// programs/wager/src/lib.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("YourProgramIdHere");

#[program]
pub mod wager {
    use super::*;

    // Initialize a new wager
    pub fn initialize_wager(
        ctx: Context<InitializeWager>,
        amount: u64,
        description: String,
    ) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        wager.creator = *ctx.accounts.user.key;
        wager.amount = amount;
        wager.description = description;
        wager.challenger = Pubkey::default();
        wager.is_resolved = false;
        wager.winner = Pubkey::default();

        // Transfer creator's stake to escrow
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.escrow_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
        Ok(())
    }

    // Accept the wager
    pub fn accept_wager(ctx: Context<AcceptWager>) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        require!(wager.challenger == Pubkey::default(), WagerError::AlreadyAccepted);
        wager.challenger = *ctx.accounts.user.key;

        // Transfer challenger's stake to escrow
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.escrow_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), wager.amount)?;
        Ok(())
    }

    // Resolve the wager (for now, manually by an admin or oracle)
    pub fn resolve_wager(ctx: Context<ResolveWager>, winner: Pubkey) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        require!(!wager.is_resolved, WagerError::AlreadyResolved);
        require!(
            winner == wager.creator || winner == wager.challenger,
            WagerError::InvalidWinner
        );

        wager.is_resolved = true;
        wager.winner = winner;

        // Transfer funds from escrow to winner
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.escrow_account.to_account_info(),
            to: ctx.accounts.winner_token_account.to_account_info(),
            authority: ctx.accounts.escrow_account.to_account_info(), // Simplified, needs proper signer
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), wager.amount * 2)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWager<'info> {
    #[account(init, payer = user, space = 8 + 32 + 32 + 8 + 256 + 1 + 32)]
    pub wager: Account<'info, Wager>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub escrow_account: Account<'info, token::TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptWager<'info> {
    #[account(mut)]
    pub wager: Account<'info, Wager>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub escrow_account: Account<'info, token::TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveWager<'info> {
    #[account(mut)]
    pub wager: Account<'info, Wager>,
    #[account(mut)]
    pub escrow_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub winner_token_account: Account<'info, token::TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(signer)] // For now, an admin or oracle resolves it
    pub authority: AccountInfo<'info>,
}

#[account]
pub struct Wager {
    pub creator: Pubkey,
    pub challenger: Pubkey,
    pub amount: u64,
    pub description: String,
    pub is_resolved: bool,
    pub winner: Pubkey,
}

#[error_code]
pub enum WagerError {
    #[msg("Wager already accepted")]
    AlreadyAccepted,
    #[msg("Wager already resolved")]
    AlreadyResolved,
    #[msg("Invalid winner")]
    InvalidWinner,
}