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

pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.company_registry;
    if !registry.companies.is_empty() {
        return Err(RegistryError::RegistryAlreadyExists.into());
    }

    registry.companies = Vec::new();
    Ok(())
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