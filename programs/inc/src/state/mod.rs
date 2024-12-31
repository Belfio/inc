use anchor_lang::prelude::*;
use std::collections::BTreeMap;

#[account]
pub struct Company {
    pub company_name: String,
    pub jurisdiction: String,
    pub authority: Pubkey,
    pub treasury_balance: u64,
    pub shareholders: BTreeMap<Pubkey, u64>,
    pub voters: BTreeMap<Pubkey, u64>,
} 