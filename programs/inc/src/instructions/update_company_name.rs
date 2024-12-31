use anchor_lang::prelude::*;
use crate::state::Company;
use crate::MAX_NAME_LENGTH;
use crate::errors::CompanyError;

pub fn update_company_name(ctx: Context<UpdateCompanyDetails>, new_name: String) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.company.authority, CompanyError::Unauthorized);
    let company = &mut ctx.accounts.company;
    if new_name.len() > MAX_NAME_LENGTH {
        return Err(CompanyError::InvalidName.into());
    }
    company.company_name = new_name;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateCompanyDetails<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
} 

#[derive(Accounts)]
#[instruction(new_name: String)]
pub struct UpdateCompanyName<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
}