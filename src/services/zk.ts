import { groth16 } from "snarkjs";
import { readFileSync } from "fs";

interface GameStats {
  gameId: number;
  timestamp: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
}

export class ZKService {
  private static instance: ZKService;
  private verificationKey: any;

  private constructor() {
    this.verificationKey = JSON.parse(
      readFileSync("circuits/verification_key.json", "utf-8")
    );
  }

  static getInstance(): ZKService {
    if (!ZKService.instance) {
      ZKService.instance = new ZKService();
    }
    return ZKService.instance;
  }

  async generateProof(stats: GameStats) {
    try {
      const circuitSignals: { [key: string]: any } = {
        gameId: stats.gameId,
        timestamp: stats.timestamp,
        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
        score: stats.score,
      };

      const { proof, publicSignals } = await groth16.fullProve(
        circuitSignals,
        "circuits/GameStats_js/GameStats.wasm",
        "circuits/GameStats_0001.zkey"
      );

      return { proof, publicSignals };
    } catch (error) {
      console.error("Error generating proof:", error);
      throw new Error("Failed to generate ZK proof");
    }
  }

  async verifyProof(proof: any, publicSignals: any): Promise<boolean> {
    try {
      return await groth16.verify(this.verificationKey, publicSignals, proof);
    } catch (error) {
      console.error("Error verifying proof:", error);
      return false;
    }
  }
}
