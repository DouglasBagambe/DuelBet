import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, codeVerifier } = req.body;

    if (!code || !codeVerifier) {
      return res.status(400).json({
        error: "Missing required parameters",
      });
    }

    const clientId = process.env.NEXT_PUBLIC_LICHESS_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        error: "Lichess client ID not configured",
      });
    }

    const redirectUri = `${req.headers.origin}/lichess/callback`;

    // Exchange code for token using the PKCE endpoint
    const tokenResponse = await fetch("https://lichess.org/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_id: clientId,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Lichess token exchange error:", errorData);
      return res.status(tokenResponse.status).json({
        error:
          errorData.error_description || "Failed to exchange code for token",
        details: errorData,
      });
    }

    const data = await tokenResponse.json();

    // Set secure cookie with the token
    res.setHeader(
      "Set-Cookie",
      `lichess_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${data.expires_in}`
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error("Token exchange error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
