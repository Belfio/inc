use anchor_lang::prelude::*;
use crate::state::Company;
use crate::MAX_JURISDICTION_LENGTH;
use crate::errors::CompanyError;
use crate::instructions::UpdateCompanyDetails;

pub fn update_jurisdiction(ctx: Context<UpdateCompanyDetails>, new_jurisdiction: String) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    if new_jurisdiction.len() > MAX_JURISDICTION_LENGTH {
        return Err(CompanyError::InvalidJurisdiction.into());
    }
    company.jurisdiction = new_jurisdiction;
    Ok(())
} 

#[derive(Accounts)]
#[instruction(new_jurisdiction: String)]
pub struct UpdateJurisdiction<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
}