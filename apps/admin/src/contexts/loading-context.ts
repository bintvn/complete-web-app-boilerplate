import { createContext } from "react";

export interface LoadingContextValue {
  isLoading: boolean;
  setLoading: (isLoading: boolean, message?: string | undefined) => void;
}

export const LoadingContext = createContext<LoadingContextValue | null>(null);
