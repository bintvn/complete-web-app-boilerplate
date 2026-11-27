import { type ReactNode, useCallback, useEffect, useState } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/auth.context";
import { FullscreenLoader } from "@/components/fullscreen-loader";

import { client } from "@complete-web-app-boilerplate/sdk/client.gen";
import {
  authSignIn,
  authMe,
  authRefresh,
  type AuthSignInResponse,
  type AuthRefreshResponse,
  type AuthMeResponse,
} from "@complete-web-app-boilerplate/sdk";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

type TokenResponse = AuthSignInResponse["data"] | AuthRefreshResponse["data"];

let inMemoryToken: TokenResponse | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<TokenResponse | null>(() => inMemoryToken);
  const [user, setUser] = useState<AuthMeResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);

  const saveToken = useCallback((nextToken: TokenResponse | null) => {
    inMemoryToken = nextToken;
    setToken(nextToken);
  }, []);

  useEffect(() => {
    const reqInterceptor = client.interceptors.request.use((request) => {
      if (inMemoryToken?.accessToken) {
        request.headers.set(
          "Authorization",
          `Bearer ${inMemoryToken.accessToken}`,
        );
      }
      return request;
    });

    const resInterceptor = client.interceptors.response.use(
      async (response, request) => {
        const isAuthEndpoint =
          request.url.includes("/auth/refresh") ||
          request.url.includes("/auth/sign-in") ||
          request.url.includes("/auth/sign-up");

        if (response.status !== 401 || isAuthEndpoint) {
          return response;
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = (async () => {
            try {
              const { data: result, error } = await authRefresh();

              if (error || !result?.data) {
                saveToken(null);
                setUser(null);
                return null;
              }

              saveToken(result.data);
              return result.data.accessToken;
            } finally {
              isRefreshing = false;
            }
          })();
        }

        const newAccessToken = await refreshPromise;
        if (!newAccessToken) return response;

        const retryRequest = new Request(request, {
          headers: new Headers(request.headers),
        });
        retryRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return fetch(retryRequest);
      },
    );

    return () => {
      client.interceptors.request.eject(reqInterceptor);
      client.interceptors.response.eject(resInterceptor);
    };
  }, [saveToken]);

  const value: AuthContextValue = {
    token,
    user,
    loading,
    setLoading,
    async signIn(input) {
      const { data: result, error } = await authSignIn({
        body: input,
      });

      if (error) {
        if (
          "code" in error &&
          error.code === "VALIDATION_ERROR" &&
          "errors" in error
        ) {
          throw new Error(error.errors.join(", "));
        } else if (
          "code" in error &&
          error.code !== "VALIDATION_ERROR" &&
          "message" in error
        ) {
          throw new Error(error.message);
        }

        throw error;
      }

      saveToken(result.data);
      setUser(await value.me());

      return result;
    },
    async me() {
      const { data: result, error } = await authMe();

      if (error) throw new Error(error.message);

      return result.data;
    },
    async signUp(input) {
      console.log(input);

      return {
        success: true,
      };
    },
    async signOut() {
      saveToken(null);
      setUser(null);

      return {
        success: true,
      };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && <FullscreenLoader message="Please wait..." />}
      {children}
    </AuthContext.Provider>
  );
}
