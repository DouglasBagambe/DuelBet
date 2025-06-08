import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function LichessCallback() {
  const router = useRouter();
  const { code, state, error } = router.query;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for OAuth errors
        if (error) {
          console.error("OAuth error:", error);
          toast.error(`Authentication failed: ${error}`);
          router.push("/lichess");
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          console.error("Missing required parameters");
          toast.error("Missing required authentication parameters");
          router.push("/lichess");
          return;
        }

        // Validate state to prevent CSRF
        const savedState = sessionStorage.getItem("lichess_oauth_state");
        sessionStorage.removeItem("lichess_oauth_state"); // Clean up immediately
        if (state !== savedState) {
          console.error("Invalid state parameter");
          toast.error("Invalid authentication state");
          router.push("/lichess");
          return;
        }

        // Get code verifier for PKCE
        const codeVerifier = sessionStorage.getItem("lichess_code_verifier");
        sessionStorage.removeItem("lichess_code_verifier"); // Clean up immediately
        if (!codeVerifier) {
          console.error("Code verifier not found");
          toast.error("Authentication session expired");
          router.push("/lichess");
          return;
        }

        // Exchange code for token
        const response = await fetch("/api/lichess/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to exchange code for token");
        }

        const data = await response.json();

        // Store token in sessionStorage (or use a more secure method)
        sessionStorage.setItem("lichess_token", data.access_token);

        toast.success("Successfully authenticated with Lichess");
        router.push("/lichess");
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error(
          error instanceof Error ? error.message : "Authentication failed"
        );
        router.push("/lichess");
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, code, state, error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Authentication</h1>
        <p className="text-gray-600">
          Please wait while we complete your login...
        </p>
      </div>
    </div>
  );
}
