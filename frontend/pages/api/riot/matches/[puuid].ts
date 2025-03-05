// pages/api/riot/matches/[puuid].ts
import { NextApiRequest, NextApiResponse } from "next";

const RIOT_API_BASE_URL = process.env.RIOT_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { puuid } = req.query;
  const count = req.query.count ? parseInt(req.query.count as string) : 10;

  if (!puuid) {
    return res.status(400).json({ error: "Missing PUUID parameter" });
  }

  try {
    const response = await fetch(
      `${RIOT_API_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Riot API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch matches",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
