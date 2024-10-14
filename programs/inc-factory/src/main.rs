use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod inc_factory {
    use super::*;

    pub fn create_company(
        ctx: Context<CreateCompany>,
        name: String,
        jurisdiction: String,
        shareholders: Vec<Pubkey>,
        share_amounts: Vec<u64>,
        voters: Vec<Pubkey>,
        vote_amounts: Vec<u64>,
    ) -> Result<()> {
        // Ensure the company name is unique
        if ctx.accounts.company_registry.companies.iter().any(|&company| {
            // You might need to implement a way to compare company names
            // This is a placeholder comparison
            company == ctx.accounts.new_company.key()
        }) {
            return Err(IncFactoryError::NameAlreadyTaken.into());
        }

        // Validate company name
        if name.is_empty() || name.len() > 50 {
            return Err(IncFactoryError::InvalidName.into());
        }

        // Initialize the new company account
        let new_company = &mut ctx.accounts.new_company;
        new_company.name = name;
        new_company.jurisdiction = jurisdiction;
        new_company.shareholders = shareholders;
        new_company.share_amounts = share_amounts;
        new_company.voters = voters;
        new_company.vote_amounts = vote_amounts;

        // Add the new company to the registry
        ctx.accounts.company_registry.companies.push(new_company.key());

        // Initialize associated Token and Treasury accounts
        // This part would require additional implementation and possibly separate instructions

        Ok(())
    }

    pub fn get_company_list(ctx: Context<GetCompanyList>) -> Result<Vec<Pubkey>> {
        Ok(ctx.accounts.company_registry.companies.clone())
    }

    pub fn get_company_by_name(ctx: Context<GetCompanyByName>, name: String) -> Result<Pubkey> {
        ctx.accounts
            .company_registry
            .companies
            .iter()
            .find(|&&company| {
                // You might need to implement a way to compare company names
                // This is a placeholder comparison
                company == ctx.accounts.company_account.key()
            })
            .copied()
            .ok_or(IncFactoryError::CompanyNotFound.into())
    }
}

#[derive(Accounts)]
pub struct CreateCompany<'info> {
    #[account(mut)]
    pub company_registry: Account<'info, CompanyRegistry>,
    #[account(init, payer = user, space = 8 + 32 + 50 + 50 + 32 * 50 + 8 * 50 + 32 * 50 + 8 * 50)]
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
    pub name: String,
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
}