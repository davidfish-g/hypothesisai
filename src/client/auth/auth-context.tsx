import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  expertise?: string[];
  scholarId?: string | null;
};

type Session = {
  user: SessionUser;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  data: Session | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  signIn: (callbackUrl?: string) => void;
  signOut: (callbackUrl?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/session", {
        credentials: "include",
      });

      if (!response.ok) {
        setData(null);
        setStatus("unauthenticated");
        return;
      }

      const session = (await response.json()) as Session | null;
      setData(session);
      setStatus(session?.user ? "authenticated" : "unauthenticated");
    } catch (error) {
      console.error("Failed to load session:", error);
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback((callbackUrl = "/dashboard") => {
    window.location.href = `/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }, []);

  const signOut = useCallback(async (callbackUrl = "/") => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = callbackUrl;
  }, []);

  const value = useMemo(
    () => ({ data, status, refresh, signIn, signOut }),
    [data, refresh, signIn, signOut, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within AuthProvider");
  }
  return {
    data: context.data,
    status: context.status,
  };
}

export function useAuthActions() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }
  return {
    refresh: context.refresh,
    signIn: context.signIn,
    signOut: context.signOut,
  };
}
