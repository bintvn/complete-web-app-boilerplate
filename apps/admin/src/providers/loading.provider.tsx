import { useCallback, useEffect, useMemo, useState } from "react";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import {
  LoadingContext,
  type LoadingContextValue,
} from "@/contexts/loading-context";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setIsLoading(isLoading);
    setMessage(message);
  }, []);

  const value: LoadingContextValue = useMemo(
    () => ({
      isLoading,
      setLoading,
    }),
    [isLoading, setLoading],
  );

  useEffect(() => {
    if (!isLoading) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <FullscreenLoader message={message} />}
      {children}
    </LoadingContext.Provider>
  );
}
