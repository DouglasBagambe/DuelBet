use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{hash, Hash};

declare_id!("G2oEwdxGH5ygDFoQNfShxTn3EifGqsDynazPnLUqkQQT");

#[program]
pub mod gaming_challenge {
    use super::*;

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        wager_amount: u64,
        stats_hash: [u8; 32],
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let creator = &ctx.accounts.creator;
        let system_program = &ctx.accounts.system_program;

        // Set up the challenge account
        challenge.creator = creator.key();
        challenge.wager_amount = wager_amount;
        challenge.stats_hash = stats_hash;
        challenge.is_active = 1; // Use u8 instead of bool
        challenge.created_at = Clock::get()?.unix_timestamp;
        challenge.challenger = Pubkey::default();
        challenge.is_complete = 0; // Use u8 instead of bool

        // Transfer wager amount from creator to challenge account using system program
        anchor_lang::system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: creator.to_account_info(),
                    to: challenge.to_account_info(),
                },
            ),
            wager_amount,
        )?;

        Ok(())
    }

    pub fn accept_challenge(ctx: Context<AcceptChallenge>) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let challenger = &ctx.accounts.challenger;
        let system_program = &ctx.accounts.system_program;

        // Validate challenge state
        require!(challenge.is_active == 1, ErrorCode::ChallengeNotOpen);
        require!(
            challenge.challenger == Pubkey::default(),
            ErrorCode::ChallengeComplete
        );

        // Transfer wager amount from challenger to challenge account using system program
        anchor_lang::system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: challenger.to_account_info(),
                    to: challenge.to_account_info(),
                },
            ),
            challenge.wager_amount,
        )?;

        // Update challenger in challenge account
        challenge.challenger = challenger.key();

        Ok(())
    }

    pub fn complete_challenge(
        ctx: Context<CompleteChallenge>,
        winner: Pubkey,
        zk_proof: Vec<u8>,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let creator = &ctx.accounts.creator;
        let challenger = &ctx.accounts.challenger;

        // Validate the challenge state
        require!(challenge.is_active == 1, ErrorCode::ChallengeNotOpen);
        require!(challenge.is_complete == 0, ErrorCode::ChallengeComplete);
        require!(
            challenge.challenger != Pubkey::default(),
            ErrorCode::ChallengeNotAccepted
        );

        // Ensure the winner is either the creator or the challenger
        require!(
            winner == challenge.creator || winner == challenge.challenger,
            ErrorCode::InvalidWinner
        );

        // Verify the ZK proof (placeholder implementation)
        verify_zk_proof(&zk_proof, &challenge.stats_hash)?;

        // Calculate the total payout (wager amount * 2)
        let total_payout = challenge
            .wager_amount
            .checked_mul(2)
            .ok_or(ErrorCode::InvalidWager)?;

        // Transfer the total payout to the winner
        **challenge.to_account_info().try_borrow_mut_lamports()? = challenge
            .to_account_info()
            .lamports()
            .checked_sub(total_payout)
            .ok_or(ErrorCode::InsufficientFunds)?;

        if winner == creator.key() {
            **creator.to_account_info().try_borrow_mut_lamports()? += total_payout;
        } else {
            **challenger.to_account_info().try_borrow_mut_lamports()? += total_payout;
        }

        // Update the challenge state
        challenge.is_active = 0;
        challenge.is_complete = 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    #[account(init, payer = creator, space = Challenge::LEN)]
    pub challenge: Account<'info, Challenge>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptChallenge<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    #[account(mut)]
    pub challenger: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteChallenge<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub challenger: Signer<'info>,
}

#[account]
pub struct Challenge {
    pub creator: Pubkey,
    pub wager_amount: u64,
    pub stats_hash: [u8; 32],
    pub is_active: u8, // Changed from bool to u8
    pub challenger: Pubkey,
    pub is_complete: u8, // Changed from bool to u8
    pub created_at: i64,
}

impl Challenge {
    const LEN: usize = 8 + // discriminator
        32 + // creator
        8 + // wager_amount
        32 + // stats_hash
        1 + // is_active
        32 + // challenger
        1 + // is_complete
        8; // created_at
}

#[error_code]
pub enum ErrorCode {
    #[msg("Challenge is not active")]
    ChallengeNotActive,
    #[msg("Challenge already accepted")]
    ChallengeAlreadyAccepted,
    #[msg("Challenge already complete")]
    ChallengeAlreadyComplete,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Invalid wager amount")]
    InvalidWager,
    #[msg("Insufficient funds in the challenge account")]
    InsufficientFunds,
    #[msg("Winner account is not a valid system account")]
    InvalidWinnerAccount,
    #[msg("Challenge is not open")]
    ChallengeNotOpen,
    #[msg("Challenge is already complete")]
    ChallengeComplete,
    #[msg("Challenge has not been accepted yet")]
    ChallengeNotAccepted,
}

fn verify_zk_proof(proof: &[u8], stats_hash: &[u8; 32]) -> Result<()> {
    let result = std::str::from_utf8(proof).map_err(|_| ErrorCode::InvalidWinner)?;
    require!(
        result == "1-0" || result == "0-1" || result == "1/2-1/2",
        ErrorCode::InvalidWinner
    );
    let computed_hash = anchor_lang::solana_program::hash::hash(proof).to_bytes();
    require!(computed_hash == *stats_hash, ErrorCode::InvalidWinner);
    Ok(())
}
