export type NftBasking = {

    "version": "0.1.0",
    "name": "nft_staker",
    "instructions": [
        {
            "name": "initRanch",
            "accounts": [
                {
                    "name": "jollyranch",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "jollyranchTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "splTokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "fundRanch",
            "accounts": [
                {
                    "name": "jollyranch",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "funderSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "programSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "oracleUpdate",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "jollyranch",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "groupNum",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "stakeNft",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "stake",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userNftAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "programNftAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "lizardType",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "redeemNft",
            "accounts": [
                {
                    "name": "stake",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "jollyranch",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "programNftAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "programSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "redeemRewards",
            "accounts": [
                {
                    "name": "stake",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "jollyranch",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "programSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userSplAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "JollyRanch",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "splBump",
                        "type": "u8"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "amountRedeemed",
                        "type": "u64"
                    },
                    {
                        "name": "baskingGroup",
                        "type": "u8"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "Stake",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "type": "publicKey"
                    },
                    {
                        "name": "splBump",
                        "type": "u8"
                    },
                    {
                        "name": "startDate",
                        "type": "i64"
                    },
                    {
                        "name": "endDate",
                        "type": "i64"
                    },
                    {
                        "name": "timerStart",
                        "type": "i64"
                    },
                    {
                        "name": "baskingGroup",
                        "type": "u8"
                    },
                    {
                        "name": "lizardType",
                        "type": "u8"
                    },
                    {
                        "name": "withdrawn",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "OutOfFunds",
            "msg": "The staking contract is out of funds."
        },
        {
            "code": 6001,
            "name": "NotEnoughToken",
            "msg": "Not enough token sent"
        },
        {
            "code": 6002,
            "name": "TooMuchToken",
            "msg": "Too much token sent"
        },
        {
            "code": 6003,
            "name": "IncorrectSlotHashesPubkey",
            "msg": "Tried to lie about slothhashes program."
        },
        {
            "code": 6004,
            "name": "OnlyOracleCanUpdate",
            "msg": "Only the oracle can update rolls."
        },
        {
            "code": 6005,
            "name": "OracleHasAlreadySpoken",
            "msg": "The oracle already rolled."
        },
        {
            "code": 6006,
            "name": "OracleHasNotSpoken",
            "msg": "The oracle hasn't rolled yet."
        },
        {
            "code": 6007,
            "name": "OnlyGodCanDoThis",
            "msg": "Only God can do this."
        },
        {
            "code": 6008,
            "name": "InvalidLockupPeriod",
            "msg": "Invalid lockup period."
        },
        {
            "code": 6009,
            "name": "InvalidNftTime",
            "msg": "NFT Still Locked Up."
        },
        {
            "code": 6010,
            "name": "AlreadyWithdrawn",
            "msg": "This stake has already been unstaked."
        },
        {
            "code": 6011,
            "name": "InvalidLizardType",
            "msg": "Incorrect lizard type number submitted."
        }
    ],
    "metadata": {
        "address": "9fN6cCpm1i1GKhXrAKJjXSFaUbjETYc43EKWf9Pu7pmN"
    }

}