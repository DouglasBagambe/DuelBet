import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await fetch(`https://lichess.org/api/user/${username}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }
      throw new Error(`Lichess API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({
      username: data.username,
      id: data.id,
      title: data.title,
      rating:
        data.perfs?.classical?.rating ||
        data.perfs?.rapid?.rating ||
        data.perfs?.blitz?.rating,
    });
  } catch (error) {
    console.error("Error fetching Lichess user:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch user data",
    });
  }
}
