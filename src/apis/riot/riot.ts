// // src/apis/riot/riot.ts
// import axios, { AxiosError } from "axios";
// import dotenv from "dotenv";
// import { RiotAPIError, RIOT_ERROR_CODES } from "../../utils/errors";
// import { CacheService, PreviewService } from "../../app";
// import { rateLimit } from "../../middleware/rateLimiter";

// dotenv.config();

// export interface RiotAccount {
//   puuid: string;
//   gameName: string;
//   tagLine: string;
// }

// export interface RiotSummoner {
//   id: string;
//   accountId: string;
//   puuid: string;
//   name: string;
//   profileIconId: number;
//   revisionDate: number;
//   summonerLevel: number;
// }

// export interface CombinedSummonerData extends RiotSummoner {
//   tagLine: string;
//   gameName: string;
// }

// class RiotAPI {
//   private static readonly RIOT_API_KEY = process.env.RIOT_API_KEY;
//   private static readonly REGION_BASE_URL = "https://europe.api.riotgames.com";
//   private static readonly LOL_BASE_URL = "https://euw1.api.riotgames.com";
//   private static readonly cacheService = CacheService.instance;

//   private static handleError(error: unknown): never {
//     if (error instanceof AxiosError && error.response) {
//       const status = error.response.status;
//       const message =
//         RIOT_ERROR_CODES[status as keyof typeof RIOT_ERROR_CODES] ||
//         "Unknown error";
//       throw new RiotAPIError(
//         status,
//         message,
//         error.response.data?.status?.message
//       );
//     }

//     if (error instanceof Error) {
//       throw new RiotAPIError(500, error.message);
//     }

//     throw new RiotAPIError(500, "Unknown error occurred");
//   }

//   private static async makeRequest<T>(
//     url: string,
//     cacheDuration?: number
//   ): Promise<T> {
//     if (!this.RIOT_API_KEY) {
//       throw new RiotAPIError(500, "RIOT_API_KEY is not configured");
//     }

//     const cacheKey = `riot:${url}`;
//     try {
//       // Check cache first
//       const cachedData = await this.cacheService.get<T>(cacheKey);
//       if (cachedData) {
//         return cachedData;
//       }

//       // Make API request
//       const response = await axios.get<T>(url, {
//         headers: {
//           "X-Riot-Token": this.RIOT_API_KEY,
//         },
//       });

//       // Cache the response if duration is specified
//       if (cacheDuration) {
//         await this.cacheService.set(cacheKey, response.data, cacheDuration);
//       }

//       return response.data;
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   static async getSummoner(
//     gameName: string,
//     tagLine: string
//   ): Promise<CombinedSummonerData> {
//     if (!gameName || !tagLine) {
//       throw new RiotAPIError(400, "Game name and tag line are required");
//     }

//     const cacheKey = `summoner:${gameName}#${tagLine}`;

//     try {
//       const cachedData = await this.cacheService.get<CombinedSummonerData>(
//         cacheKey
//       );
//       if (cachedData) {
//         return cachedData;
//       }

//       const accountUrl = `${
//         this.REGION_BASE_URL
//       }/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
//         gameName
//       )}/${encodeURIComponent(tagLine)}`;
//       const account = await this.makeRequest<RiotAccount>(accountUrl);

//       const summonerUrl = `${this.LOL_BASE_URL}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`;
//       const summoner = await this.makeRequest<RiotSummoner>(summonerUrl);

//       const combinedData: CombinedSummonerData = {
//         ...summoner,
//         tagLine,
//         gameName: account.gameName,
//       };

//       await this.cacheService.set(cacheKey, combinedData, 3600); // Cache for 1 hour
//       return combinedData;
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   static async getMatchHistory(
//     puuid: string,
//     count: number = 10,
//     startTime?: number,
//     endTime?: number,
//     queue?: number
//   ): Promise<string[]> {
//     if (!puuid) {
//       throw new RiotAPIError(400, "PUUID is required");
//     }

//     const cacheKey = `matches:${puuid}:${count}:${startTime}:${endTime}:${queue}`;

//     try {
//       const cachedData = await this.cacheService.get<string[]>(cacheKey);
//       if (cachedData) {
//         return cachedData;
//       }

//       let matchesUrl = `${this.REGION_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
//       if (startTime) matchesUrl += `&startTime=${startTime}`;
//       if (endTime) matchesUrl += `&endTime=${endTime}`;
//       if (queue) matchesUrl += `&queue=${queue}`;

//       const matches = await this.makeRequest<string[]>(matchesUrl);
//       await this.cacheService.set(cacheKey, matches, 300); // Cache for 5 minutes
//       return matches;
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   static async getMatchDetails<T>(matchId: string): Promise<T> {
//     if (!matchId) {
//       throw new RiotAPIError(400, "Match ID is required");
//     }

//     const cacheKey = `match:${matchId}`;

//     try {
//       const cachedData = await this.cacheService.get<T>(cacheKey);
//       if (cachedData) {
//         return cachedData;
//       }

//       const matchUrl = `${this.REGION_BASE_URL}/lol/match/v5/matches/${matchId}`;
//       const matchData = await this.makeRequest<T>(matchUrl);
//       await this.cacheService.set(cacheKey, matchData, 3600); // Cache for 1 hour
//       return matchData;
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   // Utility method to clear cache for a summoner
//   static async clearSummonerCache(
//     gameName: string,
//     tagLine: string
//   ): Promise<void> {
//     const cacheKey = `summoner:${gameName}#${tagLine}`;
//     await this.cacheService.delete(cacheKey);
//   }
// }

// export default RiotAPI;
