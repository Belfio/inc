use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;
use sha2::{Digest, Sha256};
use crate::errors::RegistryError;
use crate::state::*;

// Function to hash the company name
fn hash_company_name(name: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(name.as_bytes());
    let result = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result[..32]);
    hash
}


pub fn register_company(
    ctx: Context<RegisterCompany>,
    company_name: String,
) -> Result<()> {
    // Validate company name
    if company_name.is_empty() || company_name.len() > MAX_NAME_LENGTH {
        return Err(RegistryError::InvalidName.into());
    }

    let registry = &mut ctx.accounts.company_registry;

    if registry.companies.len() >= MAX_COMPANIES {
        return Err(RegistryError::ExceedsMaximumCompanies.into());
    }

    // Verify that the company account PDA matches the expected seeds
    let (expected_company_pda, _) = Pubkey::find_program_address(
        &[
            b"company",
            &hash_company_name(&company_name),
        ],
        ctx.accounts.company_program.key,
    );

    if expected_company_pda != ctx.accounts.company_account.key() {
        return Err(RegistryError::InvalidCompanyAddress.into());
    }

    // Add the new company to the registry
    registry.companies.push(ctx.accounts.company_account.key());

    msg!("Company registered by: {}", ctx.accounts.authority.key());
    Ok(())
}


#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct RegisterCompany<'info> {
    #[account(mut)]
    pub company_registry: Account<'info, CompanyRegistry>,
    /// CHECK: This is the company account that will be managed by the company management program
    pub company_account: AccountInfo<'info>,
    /// CHECK: The program that manages company accounts
    pub company_program: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}