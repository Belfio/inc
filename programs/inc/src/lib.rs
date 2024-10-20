use anchor_lang::prelude::*;

declare_id!("H1cFWB88pJvr443ak2gx1BpFVr2GcAZid38tEc5xUfk7");

#[program]
pub mod my_project {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Initialization logic here
        msg!("Initializing stogazzo {}", ctx.accounts.my_account.key());
        msg!("Initializing stogazzo {}", ctx.accounts.user.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 64)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}



#[account]
pub struct MyAccount {
    pub data: u64,
}
