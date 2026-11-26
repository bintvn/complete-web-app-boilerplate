import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import type { SearchDTO } from "@/types/common";

type SearchSiteHeaderProps = {
  className?: string;
  isMobile: boolean;
  onSearch: (query: string) => Promise<SearchDTO[]>;
  onSelectResult: (item: SearchDTO) => void;
  rightActions?: ReactNode;
};

export function SearchSiteHeader({
  className,
  isMobile,
  onSearch,
  onSelectResult,
  rightActions,
}: SearchSiteHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchDTO[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSearching(false);
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(() => {
      onSearch(query)
        .then((items) => {
          setSearchResults(items);
          setSearchError(null);
        })
        .catch((error) => {
          setSearchResults([]);
          setSearchError(
            error instanceof Error ? error.message : "Gagal mencari data.",
          );
        })
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node;
      if (!containerRef.current.contains(target)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <SiteHeader
      className={className}
      isMobile={isMobile}
      searchQuery={searchQuery}
      searchResults={searchResults}
      searchError={searchError}
      isFocused={isFocused}
      isSearching={isSearching}
      onChangeQuery={setSearchQuery}
      onFocus={() => setIsFocused(true)}
      onClosePanel={() => setIsFocused(false)}
      onSelectResult={(item) => {
        onSelectResult(item);
        setIsFocused(false);
      }}
      rightActions={rightActions}
      searchContainerRef={containerRef}
    />
  );
}
