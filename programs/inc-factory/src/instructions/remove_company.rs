use anchor_lang::prelude::*;

use crate::errors::RegistryError;
use crate::state::CompanyRegistry;

pub fn remove_company(ctx: Context<RemoveCompany>) -> Result<()> {
    let registry = &mut ctx.accounts.company_registry;
    let company_key = ctx.accounts.company_account.key();
    
    if let Some(pos) = registry.companies.iter().position(|x| *x == company_key) {
        registry.companies.remove(pos);
        Ok(())
    } else {
        Err(RegistryError::CompanyNotFound.into())
    }
} 

#[derive(Accounts)]
pub struct RemoveCompany<'info> {
    #[account(mut)]
    pub company_registry: Account<'info, CompanyRegistry>,
    /// CHECK: This is the company account to be removed
    pub company_account: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
} 