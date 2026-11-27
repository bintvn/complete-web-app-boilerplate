import { type ReactNode, useEffect, useState } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/auth.context";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { AuthApiError } from "@/lib/auth-error";
import { client } from "@complete-web-app-boilerplate/sdk/client.gen";
import {
  authMe,
  authRefresh,
  authResendVerification,
  authSession,
  authSignIn,
  authSignOut,
  authSignUp,
  authVerifyEmail,
  type AuthMeResponse,
  type AuthSessionResponse,
} from "@complete-web-app-boilerplate/sdk";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
const requestCopies = new WeakMap<Request, Request>();
let onExpired: (() => void) | null = null;

function check<T>(result: { data?: T; error?: unknown }): T {
  if (result.error || !result.data) throw new AuthApiError(result.error);
  return result.data;
}
async function refresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const result = await authRefresh();
        if (result.error || !result.data) {
          accessToken = null;
          onExpired?.();
          return null;
        }
        accessToken = result.data.data.accessToken;
        return accessToken;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}
client.interceptors.request.use((request) => {
  if (accessToken)
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  requestCopies.set(request, request.clone());
  return request;
});
client.interceptors.response.use(async (response, request) => {
  const path = new URL(request.url).pathname;
  const publicAuth = [
    "/auth/refresh",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/verify/email",
    "/auth/verify/email/resend",
  ].includes(path);
  if (response.status !== 401 || publicAuth) return response;
  const previousToken = request.headers
    .get("Authorization")
    ?.replace(/^Bearer /, "");
  const nextToken =
    accessToken && previousToken !== accessToken
      ? accessToken
      : await refresh();
  if (!nextToken) return response;
  const retry = requestCopies.get(request);
  if (!retry) return response;
  retry.headers.set("Authorization", `Bearer ${nextToken}`);
  const retriedResponse = await fetch(retry);
  if (retriedResponse.status === 401) {
    accessToken = null;
    onExpired?.();
  }
  return retriedResponse;
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthMeResponse["data"] | null>(null);
  const [session, setSession] = useState<AuthSessionResponse["data"] | null>(
    null,
  );
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    let active = true;
    onExpired = () => {
      if (active) {
        setUser(null);
        setSession(null);
      }
    };
    async function restore() {
      try {
        if (await refresh()) {
          const [me, currentSession] = await Promise.all([
            authMe(),
            authSession(),
          ]);
          const nextUser = check(me).data;
          const nextSession = check(currentSession).data;
          if (active) {
            setUser(nextUser);
            setSession(nextSession);
          }
        }
      } catch {
        accessToken = null;
      } finally {
        if (active) setInitializing(false);
      }
    }
    void restore();
    return () => {
      active = false;
      onExpired = null;
    };
  }, []);
  const value: AuthContextValue = {
    user,
    session,
    async signIn(input) {
      const result = check(await authSignIn({ body: input }));
      accessToken = result.data.accessToken;
      try {
        const [me, currentSession] = await Promise.all([
          authMe(),
          authSession(),
        ]);
        const nextUser = check(me).data;
        const nextSession = check(currentSession).data;
        setUser(nextUser);
        setSession(nextSession);
      } catch (error) {
        accessToken = null;
        throw error;
      }
      return result;
    },
    async signUp(input) {
      check(await authSignUp({ body: input }));
    },
    async resendVerification(email) {
      check(await authResendVerification({ body: { email } }));
    },
    async verifyEmail(email, code) {
      check(await authVerifyEmail({ body: { email, code } }));
    },
    async signOut() {
      const result = check(await authSignOut());
      accessToken = null;
      setUser(null);
      setSession(null);
      return result;
    },
  };
  return (
    <AuthContext.Provider value={value}>
      {initializing ? (
        <FullscreenLoader message="Memulihkan sesi..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
