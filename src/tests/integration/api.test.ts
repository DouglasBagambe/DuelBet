import request from "supertest";
import app from "../../app";

describe("API Integration Tests", () => {
  test("GET /api/summoner/:name should return summoner data", async () => {
    const response = await request(app)
      .get("/api/summoner/TestSummoner")
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
  });

  test("GET /api/matches/:puuid should return match history", async () => {
    const response = await request(app)
      .get("/api/matches/testPuuid")
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
