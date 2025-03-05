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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const ws_1 = __importDefault(require("ws"));
describe("Full Integration Flow", () => {
    let ws;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        ws = new ws_1.default("ws://localhost:3000");
        yield new Promise((resolve) => ws.on("open", resolve));
    }));
    afterAll(() => {
        ws.close();
    });
    test("Complete match flow", () => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Get player info
        const summonerResponse = yield (0, supertest_1.default)(app_1.default)
            .get("/api/summoner/TestPlayer")
            .expect(200);
        expect(summonerResponse.body).toHaveProperty("id");
        // 2. Get matches
        const matchesResponse = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/matches/${summonerResponse.body.puuid}`)
            .expect(200);
        expect(Array.isArray(matchesResponse.body)).toBe(true);
        // 3. Test WebSocket updates
        const wsPromise = new Promise((resolve) => {
            ws.on("message", (data) => {
                const message = JSON.parse(data.toString());
                if (message.type === "matchUpdate") {
                    resolve(message);
                }
            });
        });
        // Trigger match update
        yield (0, supertest_1.default)(app_1.default)
            .post("/api/matches/update")
            .send({ matchId: "123", status: "completed" })
            .expect(200);
        const wsMessage = yield wsPromise;
        expect(wsMessage).toHaveProperty("type", "matchUpdate");
    }));
});
