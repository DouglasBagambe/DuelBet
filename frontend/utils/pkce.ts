// Generate a random code verifier (43–128 characters)
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32); // 32 bytes = 256 bits
  window.crypto.getRandomValues(array);
  // Convert to hex string
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Compute the code challenge from the verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  // Base64-url-encode the hash
  const bytes = new Uint8Array(hashBuffer);
  let str = "";
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  // Convert to base64 and make URL-safe
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Base64URL encoding function
function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
