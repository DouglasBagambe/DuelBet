// src/zk/compile.ts

import { exec } from "child_process";
import * as util from "util";

const execAsync = util.promisify(exec);

async function compileCircuit() {
  try {
    // Compile circuit
    await execAsync("circom circuits/GameStats.circom --r1cs --wasm --sym");

    // Generate proving key
    await execAsync(`
            snarkjs powersoftau new bn128 12 pot12_0000.ptau -v &&
            snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v &&
            snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v &&
            snarkjs groth16 setup GameStats.r1cs pot12_final.ptau GameStats_0000.zkey &&
            snarkjs zkey contribute GameStats_0000.zkey GameStats_0001.zkey --name="1st Contributor" -v &&
            snarkjs zkey export verificationkey GameStats_0001.zkey verification_key.json
        `);

    console.log("Circuit compilation complete!");
  } catch (error) {
    console.error("Error compiling circuit:", error);
  }
}

compileCircuit();
