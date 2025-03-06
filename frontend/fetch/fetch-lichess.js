const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
} = require("@solana/web3.js");
const {
  Program,
  AnchorProvider,
  setProvider,
  Idl,
} = require("@project-serum/anchor");
const axios = require("axios");
const fs = require("fs");
// const bs58 = require("bs58");

// Option 1: Import the default export
const bs58 = require("bs58").default;

// Option 2: Use ES modules (if your project supports it)
// import bs58 from 'bs58';

// Option 3: Destructure the decode function directly
// const { decode } = require("bs58");
// Then use decode() instead of bs58.decode()

const idl = JSON.parse(
  fs.readFileSync("../types/idl/gaming_challenge.json", "utf8")
);

const wallet = Keypair.fromSecretKey(
  Uint8Array.from(
    bs58.decode(
      "3HFaXKJGgFjGy9gJBcNcycFqUZofM1gwkrXCvHzfiqfP18J3ypwXc1z8KEVepetz7popYNWKM9vGLjmN2KsiHTts"
    )
  )
); // Replace with your Phantom key
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
setProvider(provider);
const programId = new PublicKey("G2oEwdxGH5ygDFoQNfShxTn3EifGqsDynazPnLUqkQQT");
const program = new Program(idl, programId, provider);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLichessChallengeDetails(lichessChallengeLink) {
  const gameId = lichessChallengeLink.split("/").pop();
  let attempt = 0;
  const maxAttempts = 3;
  while (attempt < maxAttempts) {
    try {
      const response = await axios.get(
        `https://lichess.org/api/challenge/0BMODICI/show`,
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer lip_klyys0UD2koPyYMeYT9t",
          },
        }
      );
      const challenge = response.data;
      return {
        variant: challenge.variant.name || "Standard",
        speed: challenge.speed || "Unknown",
        result:
          challenge.status === "mate"
            ? challenge.winner
              ? "1-0"
              : "0-1"
            : "1/2-1/2",
      };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        attempt++;
        const delay = Math.pow(2, attempt) * 500;
        console.log(
          `Server responded with 429. Retrying after ${delay}ms delay...`
        );
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached for Lichess API");
}

async function updateChallengeDetails(challengePubkey) {
  const challengeAccount = new PublicKey(challengePubkey);
  const gameDetails = await fetchLichessChallengeDetails(
    "https://lichess.org/0BMODICI"
  );
  const tx = await program.methods
    .updateGameDetails(
      gameDetails.variant,
      gameDetails.speed,
      gameDetails.result
    )
    .accounts({
      challenge: challengeAccount,
      authority: wallet.publicKey,
    })
    .rpc();
  console.log("Transaction signature:", tx);
}

updateChallengeDetails("CHALLENGE_PUBKEY_FROM_PREVIOUS_STEP").catch(
  console.error
);

async function updateAllChallenges() {
  const challenges = await program.account.challenge.all();
  for (const challenge of challenges) {
    if (challenge.account.game_result === "") {
      const gameDetails = await fetchLichessChallengeDetails(
        challenge.account.lichess_challenge_link
      );
      await program.methods
        .updateGameDetails(
          gameDetails.variant,
          gameDetails.speed,
          gameDetails.result
        )
        .accounts({
          challenge: challenge.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();
      console.log(`Updated ${challenge.publicKey}`);
      await sleep(1000); // 1-second delay
    }
  }
}

setInterval(updateAllChallenges, 60000); // Check every minute
updateAllChallenges().catch(console.error);
