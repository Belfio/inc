use anchor_lang::prelude::*;
use crate::state::Company;
use crate::{MAX_NAME_LENGTH, MAX_JURISDICTION_LENGTH};
use crate::errors::CompanyError;
use inc_factory::cpi::accounts::RegisterCompany;

pub fn initialize_company(
    ctx: Context<InitializeCompany>,
    company_name: String,
    jurisdiction: String,
) -> Result<()> {
    let company = &mut ctx.accounts.company;
    
    if company_name.len() > MAX_NAME_LENGTH {
        return Err(CompanyError::InvalidName.into());
    }
    if jurisdiction.len() > MAX_JURISDICTION_LENGTH {
        return Err(CompanyError::InvalidJurisdiction.into());
    }

    // Register the company in the registry first
    let register_ctx = CpiContext::new(
        ctx.accounts.registry_program.to_account_info(),
        RegisterCompany {
            company_registry: ctx.accounts.company_registry.to_account_info(),
            company_account: ctx.accounts.company.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );

    inc_factory::cpi::register_company(register_ctx, company_name.clone())?;

    // Initialize company details
    company.company_name = company_name;
    company.jurisdiction = jurisdiction;
    company.shareholders = std::collections::BTreeMap::new();
    company.voters = std::collections::BTreeMap::new();
    company.authority = ctx.accounts.authority.key();
    company.treasury_balance = 0;

    Ok(())
}
