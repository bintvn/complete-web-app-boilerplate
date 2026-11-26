import { type ReactNode, useCallback, useState } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/auth.context";
import { apiRequest } from "@/lib/api";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import type { TokenResponse } from "@/types/api";
import type { UserDTO } from "@/types/dtos";
import { APIError } from "@/lib/api/error";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<TokenResponse | null>(() =>
    apiRequest.getInMemoryAccessToken(),
  );
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const saveToken = useCallback((nextToken: TokenResponse | null) => {
    setToken(nextToken);
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    loading,
    setLoading,
    async signIn(input) {
      const result = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/sign-in`,
        {
          body: JSON.stringify(input),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await result.json();
      if (data.errors && Array.isArray(data.errors)) {
        throw new APIError("BAD_EMAIL", data.errors[0].message);
      }
      // setUser({
      //   id: "1",
      //   createdAt: new Date().toISOString(),
      //   updatedAt: null,
      //   email: input.email,
      //   isDisabled: false,
      //   isEmailVerified: true,
      //   name: "Bintan Siregar",
      // });

      return {
        success: true,
      };
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
