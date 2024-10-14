use anchor_lang::prelude::*;

declare_id!("87gnNU41Gpcg3EAmHHFNtqqSPC5M7R9BkY4V3TDTDs4f");

#[program]
pub mod inc {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
