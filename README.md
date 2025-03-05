# Catoff Gaming Integration

## Overview

Catoff Gaming Integration is a comprehensive system that enables peer-to-peer in-game wagering with seamless stats verification and social media integration. The platform supports multiple gaming APIs and provides privacy-preserving verification through zero-knowledge proofs.

## Features

- **Gaming Stats Integration**

  - Support for Riot Games, Epic Games, Steam, and Call of Duty
  - Real-time stats fetching and verification
  - Privacy-preserving data handling

- **Zero-Knowledge Proof System**

  - Secure stats verification without exposing raw data
  - Built with Circom for robust proof generation
  - Efficient verification process

- **Social Media Integration**

  - Dynamic link previews for Telegram, Discord, and X
  - Rich preview cards with challenge details
  - Automated unfurl optimization

- **P2P Wagering System**
  - Support for UPI, crypto, and stablecoins
  - Smart contract-based challenge management
  - Real-time settlement system

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/catoff-gaming.git

# Install dependencies
cd catoff-gaming
yarn install

# Set up environment variables
cp .env.example .env

# Build the project
yarn build
```

## Configuration

1. Create developer accounts on gaming platforms:

   - Riot Games Developer Portal
   - Epic Games Developer Portal
   - Steam Partner Program
   - Call of Duty Developer Portal

2. Set up your `.env` file:

```
RIOT_API_KEY=your_riot_api_key
EPIC_API_KEY=your_epic_api_key
STEAM_API_KEY=your_steam_api_key
COD_API_KEY=your_cod_api_key
```

## Usage

1. **Start the server**

```bash
yarn start
```

2. **Create a challenge**

```bash
curl -X POST http://localhost:3000/api/challenge/create \
  -H "Content-Type: application/json" \
  -d '{"gameId": "valorant", "wagerAmount": "10", "statsRequired": ["kills", "score"]}'
```

## Development

- Run tests: `yarn test`
- Run linter: `yarn lint`
- Generate docs: `yarn docs`

## License

MIT

## Support

For support, email support@catoff.xyz or join our [Discord server](https://discord.gg/catoff).
