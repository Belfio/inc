use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;
use sha2::{Digest, Sha256};

declare_id!("7kmLroKer2JooHLqQi8ugBRHhVVTudxUm1JsAa9gpyhK");

// Function to hash the company name
fn hash_company_name(name: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(name.as_bytes());
    let result = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result[..32]);
    hash
}



#[program]
pub mod inc_factory {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.company_registry;
        // Check if the registry is already initialized
        if !registry.companies.is_empty() {
            return Err(IncFactoryError::RegistryAlreadyExists.into());
        }

        registry.companies = Vec::new();
        Ok(())
    }

    pub fn create_company(
        ctx: Context<CreateCompany>,
        company_name: String,
        jurisdiction: String,
        shareholders: Vec<Pubkey>,
        share_amounts: Vec<u64>,
        voters: Vec<Pubkey>,
        vote_amounts: Vec<u64>,
    ) -> Result<()> {

        // Validate company name
        if company_name.is_empty() || company_name.len() > 50 {
            return Err(IncFactoryError::InvalidName.into());
        }

        // Initialize the new company account
        let new_company = &mut ctx.accounts.new_company;
        new_company.company_name = company_name;
        new_company.jurisdiction = jurisdiction;
        new_company.shareholders = shareholders;
        new_company.share_amounts = share_amounts;
        new_company.voters = voters;
        new_company.vote_amounts = vote_amounts;

        // Add the new company to the registry
        ctx.accounts
            .company_registry
            .companies
            .push(new_company.key());

        // Initialize associated Token and Treasury accounts
        // This part would require additional implementation and possibly separate instructions

        // Log the signer of the transaction
        msg!("Transaction signed by: {}", ctx.accounts.user.key());

        Ok(())
    }

    pub fn get_company_list(ctx: Context<GetCompanyList>) -> Result<Vec<Pubkey>> {
        Ok(ctx.accounts.company_registry.companies.clone())
    }

    pub fn get_company_by_name(ctx: Context<GetCompanyByName>) -> Result<Pubkey> {
        ctx.accounts
            .company_registry
            .companies
            .iter()
            .find(|&&company| {
                // You might need to implement a way to compare company names
                // This is a placeholder comparison
                company == ctx.accounts.company_account.key()
            }).copied()
            .ok_or(IncFactoryError::CompanyNotFound.into())
    }
}


#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 * 100, // Adjust space as needed
        seeds = [b"company_registry"],
        bump
    )]
    pub company_registry: Account<'info, CompanyRegistry>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}



#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateCompany<'info> {
    #[account(mut)]
    pub company_registry: Account<'info, CompanyRegistry>,
    

    #[account(
            // Start of Selection
            init,
            payer = user,
            space = 8 + 32 + 50 + 50 + 32 * 50 + 8 * 50 + 32 * 50 + 8 * 50,
            seeds = [
                b"company".as_ref(),
                &hash_company_name(&company_name),
            ],
            bump,
    )]
    pub new_company: Account<'info, Company>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetCompanyList<'info> {
    pub company_registry: Account<'info, CompanyRegistry>,
}

#[derive(Accounts)]
pub struct GetCompanyByName<'info> {
    pub company_registry: Account<'info, CompanyRegistry>,
    pub company_account: Account<'info, Company>,
}

#[account]
pub struct CompanyRegistry {
    pub companies: Vec<Pubkey>,
}

#[account]
pub struct Company {
    pub company_name: String,
    pub jurisdiction: String,
    pub shareholders: Vec<Pubkey>,
    pub share_amounts: Vec<u64>,
    pub voters: Vec<Pubkey>,
    pub vote_amounts: Vec<u64>,
}

#[error_code]
pub enum IncFactoryError {
    #[msg("Company name already taken")]
    NameAlreadyTaken,
    #[msg("Invalid company name")]
    InvalidName,
    #[msg("Company not found")]
    CompanyNotFound,
    #[msg("Registry already exists")]
    RegistryAlreadyExists,
}


