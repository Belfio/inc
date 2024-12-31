use anchor_lang::prelude::*;

#[error_code]
pub enum RegistryError {
    #[msg("Invalid company name")]
    InvalidName,
    #[msg("Company not found")]
    CompanyNotFound,
    #[msg("Registry already exists")]
    RegistryAlreadyExists,
    #[msg("Exceeds maximum companies limit")]
    ExceedsMaximumCompanies,
    #[msg("Invalid company account address")]
    InvalidCompanyAddress,
}
