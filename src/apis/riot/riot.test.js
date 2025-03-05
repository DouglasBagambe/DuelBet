"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const riot_1 = __importDefault(require("./riot"));
describe("RiotAPI", () => {
    // Mock API responses
    const mockSummonerData = {
        id: "12345",
        accountId: "acc12345",
        puuid: "puuid12345",
        name: "TestSummoner",
        profileIconId: 1,
        revisionDate: 1623456789,
        summonerLevel: 100,
    };
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });
    test("getSummoner should return summoner data", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock axios get request
        jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSummonerData),
        }));
        const result = yield riot_1.default.getSummoner("TestSummoner");
        expect(result).toEqual(mockSummonerData);
    }));
    test("getSummoner should handle errors", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock error response
        jest
            .spyOn(global, "fetch")
            .mockImplementation(() => Promise.reject(new Error("API Error")));
        yield expect(riot_1.default.getSummoner("TestSummoner")).rejects.toThrow("API Error");
    }));
});
