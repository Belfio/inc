use anchor_lang::prelude::*;
use crate::state::Company;
use crate::MAX_VOTERS;
use crate::errors::CompanyError;
use crate::instructions::UpdateCompanyDetails;

pub fn add_voter(ctx: Context<UpdateCompanyDetails>, voter: Pubkey, voting_power: u64) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    if company.voters.len() >= MAX_VOTERS {
        return Err(CompanyError::MaxVotersReached.into());
    }
    company.voters.insert(voter, voting_power);
    Ok(())
}

pub fn remove_voter(ctx: Context<UpdateCompanyDetails>, voter: Pubkey) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    company.voters.remove(&voter);
    Ok(())
} 

#[derive(Accounts)]
#[instruction(voter: Pubkey, voting_power: u64)]
pub struct AddVoter<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(voter: Pubkey)]
pub struct RemoveVoter<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
}