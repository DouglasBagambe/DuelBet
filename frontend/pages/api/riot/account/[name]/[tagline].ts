// pages/api/riot/account/[name]/[tagline].ts
import { NextApiRequest, NextApiResponse } from "next";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_API_BASE_URL = "https://europe.api.riotgames.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, tagline } = req.query;

  if (!name || !tagline) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const response = await fetch(
      `${RIOT_API_BASE_URL}/riot/account/v1/accounts/by-riot-id/${name}/${tagline}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY || "",
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
      error: "Failed to fetch account data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
