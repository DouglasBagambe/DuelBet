// src/social/x.ts
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  challengeId: string;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
}

class TwitterService {
  private client: TwitterApi;

  constructor() {
    const requiredEnvVars = [
      "TWITTER_API_KEY",
      "TWITTER_API_SECRET",
      "TWITTER_ACCESS_TOKEN",
      "TWITTER_ACCESS_SECRET",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`${envVar} is not defined in environment variables`);
      }
    }

    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  async postChallenge(details: ChallengeDetails) {
    const tweet = `
🎮 New Catoff Challenge!

${details.creator} has created a challenge for ${details.wagerAmount} SOL

Challenge ID: ${details.challengeId}

Accept now at catoff.io/challenge/${details.challengeId}

#Catoff #Gaming #Solana #LeagueOfLegends
    `.trim();

    try {
      const response = await this.client.v2.tweet(tweet);
      return {
        success: true,
        tweetId: response.data.id,
      };
    } catch (error) {
      console.error("Failed to post challenge tweet:", error);
      return {
        success: false,
        error,
      };
    }
  }

  async announceWinner(details: WinnerDetails) {
    const tweet = `
🏆 Challenge Complete!

Congratulations to ${details.winner} for winning ${details.amount} SOL!

Challenge ID: ${details.challengeId}

Create your own challenge at catoff.io

#Catoff #Gaming #Solana #LeagueOfLegends
    `.trim();

    try {
      const response = await this.client.v2.tweet(tweet);
      return {
        success: true,
        tweetId: response.data.id,
      };
    } catch (error) {
      console.error("Failed to post winner announcement:", error);
      return {
        success: false,
        error,
      };
    }
  }

  async getChallengeTweets() {
    try {
      const tweets = await this.client.v2.search("from:CatoffGame");
      return tweets;
    } catch (error) {
      console.error("Failed to fetch challenge tweets:", error);
      return null;
    }
  }

  async replyToTweet(tweetId: string, message: string) {
    try {
      const response = await this.client.v2.reply(message, tweetId);
      return {
        success: true,
        replyId: response.data.id,
      };
    } catch (error) {
      console.error("Failed to reply to tweet:", error);
      return {
        success: false,
        error,
      };
    }
  }

  async deleteTweet(tweetId: string) {
    try {
      await this.client.v2.delete(tweetId);
      return true;
    } catch (error) {
      console.error("Failed to delete tweet:", error);
      return false;
    }
  }
}

export default TwitterService;
