use anchor_lang::prelude::*;
use crate::errors::RegistryError;
use crate::state::{CompanyRegistry, MAX_COMPANIES};

pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.company_registry;
    if !registry.companies.is_empty() {
        return Err(RegistryError::RegistryAlreadyExists.into());
    }

    registry.companies = Vec::new();
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + // discriminator
               (32 * MAX_COMPANIES), // company pubkeys
        seeds = [b"company_registry"],
        bump
    )]
    pub company_registry: Account<'info, CompanyRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}