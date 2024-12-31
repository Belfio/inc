use anchor_lang::prelude::*;

#[error_code]
pub enum CompanyError {
    #[msg("Invalid company name")]
    InvalidName,
    #[msg("Invalid jurisdiction")]
    InvalidJurisdiction,
    #[msg("Maximum number of shareholders reached")]
    MaxShareholdersReached,
    #[msg("Maximum number of voters reached")]
    MaxVotersReached,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Treasury overflow")]
    TreasuryOverflow,
    #[msg("Treasury underflow")]
    TreasuryUnderflow,
    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,
}
