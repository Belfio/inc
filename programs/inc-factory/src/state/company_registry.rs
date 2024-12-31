use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

pub const MAX_COMPANIES: usize = 1000000;
pub const MAX_NAME_LENGTH: usize = 50;

#[account]
pub struct CompanyRegistry {
    pub companies: Vec<Pubkey>,
}





