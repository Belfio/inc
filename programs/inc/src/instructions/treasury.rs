use anchor_lang::prelude::*;
use crate::state::Company;
use crate::errors::CompanyError;

pub fn deposit_funds(ctx: Context<TreasuryOperation>, amount: u64) -> Result<()> {
    let company = &mut ctx.accounts.company;
    company.treasury_balance = company.treasury_balance.checked_add(amount)
        .ok_or(CompanyError::TreasuryOverflow)?;
    Ok(())
}

pub fn withdraw_funds(ctx: Context<TreasuryOperation>, amount: u64) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    if amount > company.treasury_balance {
        return Err(CompanyError::InsufficientFunds.into());
    }
    company.treasury_balance = company.treasury_balance.checked_sub(amount)
        .ok_or(CompanyError::TreasuryUnderflow)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TreasuryOperation<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
} 

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositFunds<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}