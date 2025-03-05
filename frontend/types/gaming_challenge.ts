// types/gaming-challenge.d.ts

export interface GamingChallengeInstruction {
  name: string;
  accounts: {
    name: string;
    isMut: boolean;
    isSigner: boolean;
  }[];
  args: {
    name: string;
    type: string | { array: [string, number] };
  }[];
}

export interface GamingChallengeAccount {
  name: string;
  type: {
    kind: string;
    fields: {
      name: string;
      type: string | { array: [string, number] };
    }[];
  };
}

export interface GamingChallengeError {
  code: number;
  name: string;
  msg: string;
}

export interface GamingChallengeIDL {
  version: string;
  name: string;
  instructions: GamingChallengeInstruction[];
  accounts: GamingChallengeAccount[];
  errors: GamingChallengeError[];
}

export const IDL: GamingChallengeIDL = {
  version: "0.1.0",
  name: "gaming_challenge",
  instructions: [
    {
      name: "createChallenge",
      accounts: [
        {
          name: "challenge",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "wagerAmount",
          type: "u64",
        },
        {
          name: "statsHash",
          type: {
            array: ["u8", 32],
          },
        },
      ],
    },
    {
      name: "acceptChallenge",
      accounts: [
        {
          name: "challenge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "challenger",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "completeChallenge",
      accounts: [
        {
          name: "challenge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "challenger",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "winner",
          type: "publicKey",
        },
        {
          name: "zkProof",
          type: "bytes",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "challenge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "wagerAmount",
            type: "u64",
          },
          {
            name: "statsHash",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "challenger",
            type: "publicKey",
          },
          {
            name: "isComplete",
            type: "bool",
          },
          {
            name: "createdAt",
            type: "i64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidWinner",
      msg: "Invalid winner",
    },
    {
      code: 6001,
      name: "InvalidWager",
      msg: "Invalid wager amount",
    },
    {
      code: 6002,
      name: "InsufficientFunds",
      msg: "Insufficient funds in the challenge account",
    },
    {
      code: 6003,
      name: "ChallengeNotAccepted",
      msg: "Challenge has not been accepted yet",
    },
    {
      code: 6004,
      name: "ChallengeNotOpen",
      msg: "Challenge is not open",
    },
    {
      code: 6005,
      name: "ChallengeComplete",
      msg: "Challenge is already complete",
    },
  ],
};
