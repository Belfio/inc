use anchor_lang::prelude::*;
use crate::state::Company;
use crate::MAX_SHAREHOLDERS;
use crate::errors::CompanyError;
use crate::instructions::UpdateCompanyDetails;

pub fn add_shareholder(ctx: Context<UpdateCompanyDetails>, shareholder: Pubkey, share_amount: u64) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    if company.shareholders.len() >= MAX_SHAREHOLDERS {
        return Err(CompanyError::MaxShareholdersReached.into());
    }
    company.shareholders.insert(shareholder, share_amount);
    Ok(())
}

pub fn remove_shareholder(ctx: Context<UpdateCompanyDetails>, shareholder: Pubkey) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    company.shareholders.remove(&shareholder);
    Ok(())
} 

#[derive(Accounts)]
#[instruction(shareholder: Pubkey, share_amount: u64)]
pub struct AddShareholder<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(shareholder: Pubkey)]
pub struct RemoveShareholder<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}