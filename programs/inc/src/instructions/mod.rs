use anchor_lang::prelude::*;
use crate::state::Company;
use crate::MAX_SHAREHOLDERS;
use crate::MAX_VOTERS;
use crate::hash_company_name;
use inc_factory::program::CompanyRegistry;

mod initialize_company;
mod update_company_name;
mod update_jurisdiction;
mod shareholders;
mod voters;
mod treasury;

pub use initialize_company::*;
pub use update_company_name::*;
pub use update_jurisdiction::*;
pub use shareholders::*;
pub use voters::*;
pub use treasury::*;

#[derive(Accounts)]
pub struct TreasuryOperation<'info> {
    #[account(mut)]
    pub company: Account<'info, Company>,
    pub authority: Signer<'info>,
} 