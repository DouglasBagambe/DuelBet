// src/apis/riot/riot.test.ts
import axios from "axios";
import RiotAPI from "./riot";
import CacheService from "../../services/cache";
import type { RiotAccount, RiotSummoner, CombinedSummonerData } from "./riot";

jest.mock("axios");
jest.mock("../../services/cache");

const mockedAxios = jest.mocked(axios);
const mockCacheInstance = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

// Update the mock implementation
(CacheService.getInstance as jest.Mock).mockReturnValue(mockCacheInstance);

describe("RiotAPI", () => {
  const mockRiotAccount: RiotAccount = {
    puuid: "puuid12345",
    gameName: "TestSummoner",
    tagLine: "EUW",
  };

  const mockSummonerData: RiotSummoner = {
    id: "12345",
    accountId: "acc12345",
    puuid: "puuid12345",
    name: "TestSummoner",
    profileIconId: 1,
    revisionDate: 1623456789,
    summonerLevel: 100,
  };

  const mockCombinedData: CombinedSummonerData = {
    ...mockSummonerData,
    tagLine: "EUW",
    gameName: "TestSummoner",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RIOT_API_KEY = "test-api-key";
  });

  describe("getSummoner", () => {
    it("should return cached data when available", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(mockCombinedData);

      const result = await RiotAPI.getSummoner("TestSummoner", "EUW");

      expect(result).toEqual(mockCombinedData);
      expect(mockCacheInstance.get).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW"
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache data when cache miss", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(null);
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRiotAccount })
        .mockResolvedValueOnce({ data: mockSummonerData });

      const result = await RiotAPI.getSummoner("TestSummoner", "EUW");

      expect(result).toEqual(mockCombinedData);
      expect(mockCacheInstance.get).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW"
      );
      expect(mockCacheInstance.set).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW",
        mockCombinedData,
        3600
      );
    });
  });

  describe("getMatchHistory", () => {
    const mockMatches = ["match1", "match2"];

    it("should return cached matches when available", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(mockMatches);

      const result = await RiotAPI.getMatchHistory("puuid123", 2);

      expect(result).toEqual(mockMatches);
      expect(mockCacheInstance.get).toHaveBeenCalledWith("matches:puuid123:2");
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache matches when cache miss", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({ data: mockMatches });

      const result = await RiotAPI.getMatchHistory("puuid123", 2);

      expect(result).toEqual(mockMatches);
      expect(mockCacheInstance.get).toHaveBeenCalledWith("matches:puuid123:2");
      expect(mockCacheInstance.set).toHaveBeenCalledWith(
        "matches:puuid123:2",
        mockMatches,
        300
      );
    });
  });

  describe("getMatchDetails", () => {
    const mockMatchData = { gameId: "123" /* other match data */ };

    it("should return cached match details when available", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(mockMatchData);

      const result = await RiotAPI.getMatchDetails("EUW1_123");

      expect(result).toEqual(mockMatchData);
      expect(mockCacheInstance.get).toHaveBeenCalledWith("match:EUW1_123");
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache match details when cache miss", async () => {
      mockCacheInstance.get.mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({ data: mockMatchData });

      const result = await RiotAPI.getMatchDetails("EUW1_123");

      expect(result).toEqual(mockMatchData);
      expect(mockCacheInstance.get).toHaveBeenCalledWith("match:EUW1_123");
      expect(mockCacheInstance.set).toHaveBeenCalledWith(
        "match:EUW1_123",
        mockMatchData,
        3600
      );
    });
  });
});
