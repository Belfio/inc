use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;
use sha2::{Digest, Sha256};
use inc_factory::{self, program::CompanyRegistry};
use inc_factory::cpi::accounts::RegisterCompany;

mod state;
mod errors;
mod instructions;

use state::*;
use errors::*;
use instructions::*;

declare_id!("H1cFWB88pJvr443ak2gx1BpFVr2GcAZid38tEc5xUfk7");

pub const MAX_SHAREHOLDERS: usize = 100;
pub const MAX_VOTERS: usize = 100;
pub const MAX_NAME_LENGTH: usize = 50;
pub const MAX_JURISDICTION_LENGTH: usize = 50;

// Function to hash the company name for consistent seed generation
fn hash_company_name(name: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(name.as_bytes());
    let result = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result[..32]);
    hash
}

#[program]
pub mod company_management {
    use super::*;

    pub use crate::instructions::{
        initialize_company,
        update_company_name,
        update_jurisdiction,
        add_shareholder,
        remove_shareholder,
        add_voter,
        remove_voter,
        deposit_funds,
        withdraw_funds,
    };
} 