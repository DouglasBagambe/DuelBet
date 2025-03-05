import request from "supertest";
import app from "../../app";
import WebSocket from "ws";
import RiotAPI from "../../apis/riot/riot";

describe("Full Integration Flow", () => {
  let ws: WebSocket;

  beforeAll(async () => {
    ws = new WebSocket("ws://localhost:3000");
    await new Promise((resolve) => ws.on("open", resolve));
  });

  afterAll(() => {
    ws.close();
  });

  test("Complete match flow", async () => {
    // 1. Get player info
    const summonerResponse = await request(app)
      .get("/api/summoner/TestPlayer")
      .expect(200);

    expect(summonerResponse.body).toHaveProperty("id");

    // 2. Get matches
    const matchesResponse = await request(app)
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
    await request(app)
      .post("/api/matches/update")
      .send({ matchId: "123", status: "completed" })
      .expect(200);

    const wsMessage = await wsPromise;
    expect(wsMessage).toHaveProperty("type", "matchUpdate");
  });
});
