import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the token from the cookie
    const token = req.cookies.lichess_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch user account from Lichess
    const response = await fetch("https://lichess.org/api/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired
        res.setHeader(
          "Set-Cookie",
          "lichess_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
        );
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      throw new Error("Failed to fetch account");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching account:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
