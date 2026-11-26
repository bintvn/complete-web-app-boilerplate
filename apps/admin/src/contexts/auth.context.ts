import { createContext, type Dispatch, type SetStateAction } from "react";
import type { UserDTO } from "@/types/dtos/user.dto";
import type {
  SignInParams,
  SignInResponse,
  SignOutResponse,
  SignUpParams,
  SignUpResponse,
} from "@/types/auth";
import type { TokenResponse } from "@/types/api";

export type AuthContextValue = {
  token: TokenResponse | null;
  user: UserDTO | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  signIn: (input: SignInParams) => Promise<SignInResponse>;
  signUp: (input: SignUpParams) => Promise<SignUpResponse>;
  signOut: () => Promise<SignOutResponse>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
