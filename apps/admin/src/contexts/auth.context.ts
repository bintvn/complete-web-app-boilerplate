import { createContext, type Dispatch, type SetStateAction } from "react";
import type {
  SignInParams,
  SignInResponse,
  SignOutResponse,
  SignUpParams,
  SignUpResponse,
} from "@/types/auth";
import type {
  AuthMeResponse,
  AuthRefreshResponse,
  AuthSignInResponse,
} from "@complete-web-app-boilerplate/sdk";

type TokenResponse = AuthSignInResponse["data"] | AuthRefreshResponse["data"];

export type AuthContextValue = {
  token: TokenResponse | null;
  user: AuthMeResponse["data"] | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  signIn: (input: SignInParams) => Promise<SignInResponse>;
  me: () => Promise<AuthMeResponse["data"]>;
  signUp: (input: SignUpParams) => Promise<SignUpResponse>;
  signOut: () => Promise<SignOutResponse>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
