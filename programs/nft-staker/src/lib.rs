use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("9fN6cCpm1i1GKhXrAKJjXSFaUbjETYc43EKWf9Pu7pmN");

// Data Logics

#[program]
pub mod nft_staker {

    use super::*;
    pub fn init_ranch(ctx: Context<InitRanch>) -> Result<()> {
        let jollyranch = &mut ctx.accounts.jollyranch;
        let signer = &mut ctx.accounts.authority.key();
        if signer.to_string() != "RePtd6wqrmTvgoCVy4sfrhpuoNFuuPt3Uhr23p86dXe" {
            return Err(ErrorCode::OnlyOracleCanUpdate.into());
        }
        jollyranch.authority = ctx.accounts.authority.key();
        jollyranch.amount = 0;
        jollyranch.amount_redeemed = 0;
        jollyranch.bump = *ctx.bumps.get("jollyranch").unwrap();
        jollyranch.spl_bump = *ctx.bumps.get("jollyranch_token_account").unwrap();
        jollyranch.basking_group = 0;
        Ok(())
    }

    pub fn fund_ranch(ctx: Context<FundRanch>, amount: u64) -> Result<()> {
        let jollyranch = &mut ctx.accounts.jollyranch;
        let signer = &mut ctx.accounts.authority.key();
        jollyranch.amount += amount;
        if signer.to_string() != "RePtd6wqrmTvgoCVy4sfrhpuoNFuuPt3Uhr23p86dXe" {
            return Err(ErrorCode::OnlyOracleCanUpdate.into());
        }
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.funder_spl_account.to_account_info(),
                    to: ctx.accounts.program_spl_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn oracle_update(ctx: Context<OracleUpdate>, group_num: u8) -> Result<()> {
        let jollyranch = &mut ctx.accounts.jollyranch;
        let signer = &mut ctx.accounts.authority.key();
        if signer.to_string() != "J8TkVoRvAmep9vmg7jvchNbpSbJTzNtvhg78Eiu9cJmM" {
            return Err(ErrorCode::OnlyOracleCanUpdate.into());
        }

        jollyranch.basking_group = group_num;
        // pass in the jollyranch and update the basking group here to the number the oracle decides
        // also will need to think about RSO!

        Ok(())
    }

    pub fn stake_nft(ctx: Context<StakeNFT>, lizard_type: u8) -> Result<()> {
        let clock = Clock::get().unwrap();
        let stake = &mut ctx.accounts.stake;

        if stake.lizard_type > 2 {
            return Err(ErrorCode::InvalidLizardType.into());
        }
        stake.spl_bump = *ctx.bumps.get("program_nft_account").unwrap();
        stake.authority = ctx.accounts.authority.key();
        stake.mint = ctx.accounts.mint.key();
        stake.start_date = clock.unix_timestamp;
        stake.timer_start = clock.unix_timestamp;
        stake.lizard_type = lizard_type;

        /* front end notes - since the NFT amount is staying the same and metadata is just being updated
            the front end will need to check metadata and only display deviants / corrupted / eternal nft's to stake.
        */
        // lizard types, 0 = deviant, 1 = corrupted, 2 = eternal.
        // need to set the basking group here, decide on how to do that.

        let basking_num = (clock.unix_timestamp % 7) as u8; // need to check if stake all makes them all the same group
        stake.basking_group = basking_num; // will be 0 through 6

        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.user_nft_account.to_account_info(),
                    to: ctx.accounts.program_nft_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            1,
        )?;

        msg!("Staker nft mint: {:?}", ctx.accounts.user_nft_account.mint);
        msg!(
            "Staker nft owner: {:?}",
            ctx.accounts.user_nft_account.owner
        );

        Ok(())
    }

    pub fn redeem_nft(ctx: Context<RedeemNFT>) -> Result<()> {
        let stake = &mut ctx.accounts.stake;
        let jollyranch = &mut ctx.accounts.jollyranch;
        let timer_end = Clock::get().unwrap().unix_timestamp;
        if jollyranch.amount_redeemed >= jollyranch.amount {
            return Err(ErrorCode::OutOfFunds.into());
        }

        // lizard types, 0 = deviant, 1 = corrupted - basking_bonus = 2.0 for corrupted, 2 = eternal.
        let mut basking_bonus = 1.0;
        let mut redemption_rate = 5.0;

        match stake.lizard_type {
            0 => {
                redemption_rate = 5.0;
            }
            1 => {
                redemption_rate = 6.0;
                basking_bonus = 2.0;
            }
            2 => {
                redemption_rate = 7.0;
                basking_bonus = 2.0;
            }
            _ => msg!(
                "Invalid lizard type, bonus not applied: {}",
                stake.lizard_type
            ),
        }
        if stake.basking_group == jollyranch.basking_group {
            redemption_rate += basking_bonus;
        }

        let redeemable_time = (timer_end - stake.timer_start).abs() as f64;
        let to_days = 60.0 * 60.0 * 24.0;
        let redeemable_days: f64 = redeemable_time / to_days;
        let amount_to_redeem = redemption_rate * redeemable_days;
        let redeem_amount = (amount_to_redeem * 1e6) as u64;
        jollyranch.amount_redeemed += redeem_amount;
        stake.withdrawn = true;
        msg!("amount to redeem {}", amount_to_redeem);
        // Transfer SPL Token Rewards
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.program_spl_account.to_account_info(),
                    to: ctx.accounts.user_spl_account.to_account_info(),
                    authority: ctx.accounts.program_spl_account.to_account_info(),
                },
                &[&[
                    ctx.accounts.jollyranch.key().as_ref(),
                    b"jolly_token_account",
                    &[ctx.accounts.jollyranch.spl_bump],
                ]],
            ),
            redeem_amount,
        )?;
        // Transfer Back NFT from Stake account
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.program_nft_account.to_account_info(),
                    to: ctx.accounts.user_nft_account.to_account_info(),
                    authority: ctx.accounts.program_nft_account.to_account_info(),
                },
                &[&[
                    ctx.accounts.stake.key().as_ref(),
                    &[ctx.accounts.stake.spl_bump],
                ]],
            ),
            1,
        )?;
        // Finally, close the escrow account and refund the maker (they paid for its rent-exemption).
        anchor_spl::token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::CloseAccount {
                account: ctx.accounts.program_nft_account.to_account_info(),
                destination: ctx.accounts.user_nft_account.to_account_info(),
                authority: ctx.accounts.program_nft_account.to_account_info(),
            },
            &[&[
                ctx.accounts.stake.key().as_ref(),
                &[ctx.accounts.stake.spl_bump],
            ]],
        ))?;
        Ok(())
    }

    pub fn redeem_rewards(ctx: Context<RedeemRewards>) -> Result<()> {
        let stake = &mut ctx.accounts.stake;
        let jollyranch = &mut ctx.accounts.jollyranch;
        let timer_end = Clock::get().unwrap().unix_timestamp;

        if jollyranch.amount_redeemed >= jollyranch.amount {
            return Err(ErrorCode::OutOfFunds.into());
        }

        let mut basking_bonus = 1.0;
        let mut redemption_rate = 5.0;

        match stake.lizard_type {
            0 => {
                redemption_rate = 5.0;
            }
            1 => {
                redemption_rate = 6.0;
                basking_bonus = 2.0;
            }
            2 => {
                redemption_rate = 7.0;
                basking_bonus = 2.0;
            }
            _ => msg!(
                "Invalid lizard type, bonus not applied: {}",
                stake.lizard_type
            ),
        }
        if stake.basking_group == jollyranch.basking_group {
            redemption_rate += basking_bonus;
        }

        let day_differential = (timer_end - stake.timer_start).abs() as f64;
        let to_days = 60.0 * 60.0 * 24.0;
        let days_elapsed: f64 = day_differential / to_days;
        let amount_to_redeem = redemption_rate * days_elapsed;
        let redeem_amount = (amount_to_redeem * 1e6) as u64;
        stake.timer_start = timer_end;
        jollyranch.amount_redeemed += redeem_amount;
        msg!("amount to redeem {}", amount_to_redeem);
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.program_spl_account.to_account_info(),
                    to: ctx.accounts.user_spl_account.to_account_info(),
                    authority: ctx.accounts.program_spl_account.to_account_info(),
                },
                &[&[
                    ctx.accounts.jollyranch.key().as_ref(),
                    b"jolly_token_account",
                    &[ctx.accounts.jollyranch.spl_bump],
                ]],
            ),
            redeem_amount,
        )?;
        Ok(())
    }
}

// Data Validators - in place of init_if_needed we use getOrCreateAssociatedToken in the front end

#[derive(Accounts)]
pub struct InitRanch<'info> {
    #[account(init, seeds = [b"jolly_account".as_ref()], bump, payer = authority, space = JollyRanch::LEN)]
    pub jollyranch: Account<'info, JollyRanch>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, seeds = [jollyranch.key().as_ref(), b"jolly_token_account"], bump, payer = authority, token::mint = spl_token_mint, token::authority = jollyranch_token_account)]
    pub jollyranch_token_account: Account<'info, TokenAccount>,
    pub spl_token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundRanch<'info> {
    #[account(mut, has_one = authority, seeds = [b"jolly_account".as_ref()], bump = jollyranch.bump)]
    pub jollyranch: Account<'info, JollyRanch>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub funder_spl_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [jollyranch.key().as_ref(), b"jolly_token_account"], bump = jollyranch.spl_bump)]
    pub program_spl_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OracleUpdate<'info> {
    pub authority: Signer<'info>,
    #[account(mut)]
    pub jollyranch: Box<Account<'info, JollyRanch>>,
}

#[derive(Accounts)]
pub struct StakeNFT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = Stake::LEN)]
    pub stake: Account<'info, Stake>,
    #[account(mut)]
    pub user_nft_account: Account<'info, TokenAccount>,
    #[account(init, seeds = [stake.key().as_ref()], bump, token::mint = mint, token::authority = program_nft_account, payer = authority)]
    pub program_nft_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RedeemNFT<'info> {
    #[account(mut, has_one = authority)]
    pub stake: Box<Account<'info, Stake>>,
    #[account(mut)]
    pub jollyranch: Box<Account<'info, JollyRanch>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [stake.key().as_ref()], bump = stake.spl_bump)]
    pub program_nft_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub user_nft_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [jollyranch.key().as_ref(), b"jolly_token_account"], bump = jollyranch.spl_bump)]
    pub program_spl_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub user_spl_account: Box<Account<'info, TokenAccount>>,
    pub token_mint: Box<Account<'info, Mint>>,
    pub nft_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RedeemRewards<'info> {
    #[account(mut, has_one = authority)]
    pub stake: Account<'info, Stake>,
    #[account(mut)]
    pub jollyranch: Account<'info, JollyRanch>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [jollyranch.key().as_ref(), b"jolly_token_account"], bump = jollyranch.spl_bump)]
    pub program_spl_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_spl_account: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Data Structures
const DISCRIMINATOR_LENGTH: usize = 8;
const AUTHORITY_LENGTH: usize = 32;
const START_DATE_LENGTH: usize = 8;
const END_DATE_LENGTH: usize = 8;
const AMOUNT_LENGTH: usize = 8;
const AMOUNT_REDEEMED_LENGTH: usize = 8;
const TIMER_LENGTH: usize = 8;
const BUMP_LENGTH: usize = 1;
const WITHDRAWN_LENGTH: usize = 1;
const BASKING_SIZE: usize = 1;
const LIZARD_TYPE: usize = 1;

#[account]
pub struct JollyRanch {
    pub authority: Pubkey,
    pub spl_bump: u8,
    pub amount: u64,
    pub amount_redeemed: u64,
    pub basking_group: u8,
    pub bump: u8,
}

impl JollyRanch {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + AUTHORITY_LENGTH
        + BUMP_LENGTH
        + AMOUNT_LENGTH
        + AMOUNT_REDEEMED_LENGTH
        + BASKING_SIZE
        + BUMP_LENGTH;
}

#[account]
pub struct Stake {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub spl_bump: u8,
    pub start_date: i64,
    pub end_date: i64,
    pub timer_start: i64,
    pub basking_group: u8,
    pub lizard_type: u8,
    pub withdrawn: bool,
}

impl Stake {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + AUTHORITY_LENGTH
        + AUTHORITY_LENGTH
        + BUMP_LENGTH
        + START_DATE_LENGTH
        + END_DATE_LENGTH
        + TIMER_LENGTH
        + BASKING_SIZE
        + LIZARD_TYPE
        + WITHDRAWN_LENGTH;
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("The staking contract is out of funds.")]
    OutOfFunds,
    #[msg("Not enough token sent")]
    NotEnoughToken,
    #[msg("Too much token sent")]
    TooMuchToken,
    #[msg("Tried to lie about slothhashes program.")]
    IncorrectSlotHashesPubkey,
    #[msg("Only the oracle can update rolls.")]
    OnlyOracleCanUpdate,
    #[msg("The oracle already rolled.")]
    OracleHasAlreadySpoken,
    #[msg("The oracle hasn't rolled yet.")]
    OracleHasNotSpoken,
    #[msg("Only God can do this.")]
    OnlyGodCanDoThis,
    #[msg("Invalid lockup period.")]
    InvalidLockupPeriod,
    #[msg("NFT Still Locked Up.")]
    InvalidNftTime,
    #[msg("This stake has already been unstaked.")]
    AlreadyWithdrawn,
    #[msg("Incorrect lizard type number submitted.")]
    InvalidLizardType,
}

/*
    could potentially run into problems here, ex. on day 7 redeems for 7 sight per day = 49 sight redeemed
    the next day, the user wants to redeem on day 8 for 6 sight per day, they just redeemed for 7 days, they should have
    6 more sight to claim with current code it'll check amount to redeem = 48 (8 days * 6 per day) - amount redeemed (7 * 7 = 49)
    and will be a negative amount, so won't be able to redeem
    - potential solution, when redeemed set a timer back to 0? stored on stake account.
    let timer = clock.unix timestamp etc. we still store start date like normally, just don't edit it
    when we redeem check the current date against the timer, calculate amount redeemed like that
    then we set the timer back to 0.
    psuedocode -
    in stake:
        stake.timer = Clock::get().unwrap().unix_timestamp;
        // we still set stake start date for reference purposes on front end also set stake end date if lockup and
            will need to write logic when redeeming for that as well.
    in redeem:
        to_days = 60 * 60 * 24
        let clock = Clock::get().unwrap().unix_timestamp; //current time
        let redeemable days = (clock - stake.timer) * to_days
        let amount to redeem = redemption rate * redeemable days
            - transfer amount to redeem
        stake.timer = Clock::get().unwrap().unix_timestamp; //set stake time to current time again
 ---------
 this solution makes it so we aren't checking against an amount redeemed already, so our redemption rate can be variable
 it just checks the amount of time the NFT has been staked and gives out rewards depending on that time spent staked
 and the current redemption rate rewards
*/