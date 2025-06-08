import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface LichessUser {
  id: string;
  username: string;
  title?: string;
  online?: boolean;
  playing?: boolean;
  patron?: boolean;
}

interface LichessChallenge {
  id: string;
  url: string;
  status: string;
}

export function useLichess() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<LichessUser | null>(null);

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/lichess/account");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const createChallenge = useCallback(
    async (
      username: string,
      timeControl: {
        initialTime: number;
        increment: number;
        variant: string;
      }
    ): Promise<LichessChallenge | null> => {
      try {
        const response = await fetch("/api/lichess/challenge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            timeControl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create challenge");
        }

        return await response.json();
      } catch (error) {
        console.error("Error creating challenge:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create challenge"
        );
        return null;
      }
    },
    []
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    createChallenge,
  };
}
