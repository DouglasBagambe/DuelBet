#!/bin/bash

# Configuration variables
RIOT_TOKEN="${RIOT_API_KEY}"
CREATOR_WALLET="/home/db/new-wallet.json"
PROGRAM_ID="GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g55LuR7U97FS"
RPC_URL="https://api.devnet.solana.com"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Helper functions
print_status() {
    echo -e "${GREEN}[*]${NC} $1"
}

print_error() {
    echo -e "${RED}[!]${NC} $1"
}

# Generate a new challenge account keypair
generate_challenge_account() {
    solana-keygen new --no-bip39-passphrase -o challenge-keypair.json
    CHALLENGE_ACCOUNT=$(solana-keygen pubkey challenge-keypair.json)
    echo $CHALLENGE_ACCOUNT
}

# Create challenge function
create_challenge() {
    local MATCH_ID=$1
    local WAGER_AMOUNT=$2
    local CHALLENGE_ACCOUNT=$3
    
    print_status "Creating challenge with wager amount: $WAGER_AMOUNT lamports"
    
    # Generate stats hash from match ID (placeholder implementation)
    local STATS_HASH=$(echo -n "$MATCH_ID" | sha256sum | cut -d ' ' -f1)
    
    # Create the challenge using solana program
    solana program deploy -v \
        --program-id $PROGRAM_ID \
        --keypair $CREATOR_WALLET \
        create_challenge \
        $CHALLENGE_ACCOUNT \
        $WAGER_AMOUNT \
        $STATS_HASH

    return $?
}

# Accept challenge function
accept_challenge() {
    local CHALLENGE_ACCOUNT=$1
    local CHALLENGER_WALLET=$2
    
    print_status "Accepting challenge..."
    
    solana program deploy -v \
        --program-id $PROGRAM_ID \
        --keypair "$CHALLENGER_WALLET" \
        accept_challenge \
        $CHALLENGE_ACCOUNT

    return $?
}

# Complete challenge function
complete_challenge() {
    local CHALLENGE_ACCOUNT=$1
    local WINNER_WALLET=$2
    local CREATOR_WALLET=$3
    local CHALLENGER_WALLET=$4
    
    print_status "Completing challenge..."
    
    # Placeholder ZK proof (you'll need to implement actual proof generation)
    local ZK_PROOF="0000000000000000000000000000000000000000000000000000000000000000"
    
    solana program deploy -v \
        --program-id $PROGRAM_ID \
        --keypair "$CREATOR_WALLET" \
        --keypair "$CHALLENGER_WALLET" \
        complete_challenge \
        $CHALLENGE_ACCOUNT \
        $WINNER_WALLET \
        $ZK_PROOF

    return $?
}

# Verify challenge status
verify_challenge() {
    local CHALLENGE_ACCOUNT=$1
    
    print_status "Challenge account status:"
    solana account "$CHALLENGE_ACCOUNT"
}

# Main flow
main() {
    # Set up Solana configuration
    solana config set --url $RPC_URL
    
    # Get player info
    echo "Enter player name (e.g., Caps):"
    read PLAYER_NAME
    echo "Enter tagline (e.g., EUW):"
    read TAGLINE
    echo "Enter wager amount (in lamports):"
    read WAGER_AMOUNT
    echo "Enter challenger wallet path (full path to keypair file):"
    read CHALLENGER_WALLET_PATH

    # Validate wallet paths
    if [ ! -f "$CREATOR_WALLET" ]; then
        print_error "Creator wallet file not found at: $CREATOR_WALLET"
        exit 1
    fi

    if [ ! -f "$CHALLENGER_WALLET_PATH" ]; then
        print_error "Challenger wallet file not found at: $CHALLENGER_WALLET_PATH"
        exit 1
    fi

    # Get PUUID from Riot API
    print_status "Getting player PUUID..."
    PLAYER_INFO=$(curl -s -H "X-Riot-Token: $RIOT_TOKEN" \
        "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/$PLAYER_NAME/$TAGLINE")
    PUUID=$(echo $PLAYER_INFO | jq -r '.puuid')

    if [ -z "$PUUID" ] || [ "$PUUID" = "null" ]; then
        print_error "Could not find player"
        exit 1
    fi
    print_status "PUUID found: $PUUID"

    # Get recent matches
    print_status "Getting recent matches..."
    MATCHES=$(curl -s -H "X-Riot-Token: $RIOT_TOKEN" \
        "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/$PUUID/ids?count=5")
    
    echo "Recent matches:"
    echo $MATCHES | jq -r '.[]' | nl
    echo "Enter match number to use (1-5):"
    read MATCH_NUM
    MATCH_ID=$(echo $MATCHES | jq -r ".[$((MATCH_NUM-1))]")

    if [ -z "$MATCH_ID" ] || [ "$MATCH_ID" = "null" ]; then
        print_error "Invalid match selection"
        exit 1
    fi
    print_status "Selected match ID: $MATCH_ID"

    # Generate new challenge account
    CHALLENGE_ACCOUNT=$(generate_challenge_account)
    print_status "Generated challenge account: $CHALLENGE_ACCOUNT"

    # Create challenge
    if ! create_challenge "$MATCH_ID" "$WAGER_AMOUNT" "$CHALLENGE_ACCOUNT"; then
        print_error "Failed to create challenge"
        exit 1
    fi
    
    # Verify initial status
    verify_challenge "$CHALLENGE_ACCOUNT"
    
    # Accept challenge
    if ! accept_challenge "$CHALLENGE_ACCOUNT" "$CHALLENGER_WALLET_PATH"; then
        print_error "Failed to accept challenge"
        exit 1
    fi
    
    # Verify status after acceptance
    verify_challenge "$CHALLENGE_ACCOUNT"
    
    # Ask if ready to complete
    echo "Ready to complete challenge? (y/n)"
    read COMPLETE
    if [ "$COMPLETE" = "y" ]; then
        echo "Enter winner wallet address:"
        read WINNER_WALLET
        
        if ! complete_challenge "$CHALLENGE_ACCOUNT" "$WINNER_WALLET" "$CREATOR_WALLET" "$CHALLENGER_WALLET_PATH"; then
            print_error "Failed to complete challenge"
            exit 1
        fi
        
        # Final verification
        verify_challenge "$CHALLENGE_ACCOUNT"
    fi

}

# Run the script
main