use anchor_lang::prelude::*;

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("AygfummZBxjDZoE3FhoWfyG2mvBE3jZS1FM2sNttDvvv");

#[program]
pub mod company_registry {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        initialize_registry::initialize_registry(ctx)
    }

    pub fn register_company(
        ctx: Context<RegisterCompany>,
        company_name: String,
    ) -> Result<()> {
        register_company::register_company(ctx, company_name)
    }

    pub fn remove_company(ctx: Context<RemoveCompany>) -> Result<()> {
        remove_company::remove_company(ctx)
    }
}



