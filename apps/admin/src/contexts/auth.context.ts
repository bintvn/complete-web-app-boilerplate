import { createContext } from "react";
import type {
  AuthMeResponse,
  AuthSessionResponse,
  AuthSignInResponse,
  AuthSignUpData,
} from "@complete-web-app-boilerplate/sdk";

export type AuthContextValue = {
  user: AuthMeResponse["data"] | null;
  session: AuthSessionResponse["data"] | null;
  signIn: (input: {
    email: string;
    password: string;
  }) => Promise<AuthSignInResponse>;
  signUp: (input: NonNullable<AuthSignUpData["body"]>) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<{ success: true }>;
};
export const AuthContext = createContext<AuthContextValue | null>(null);
