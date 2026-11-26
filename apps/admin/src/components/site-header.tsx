import { LoaderCircle, Search } from "lucide-react";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Separator } from "@complete-web-app-boilerplate/ui/components/separator";
import { SidebarTrigger } from "@complete-web-app-boilerplate/ui/components/sidebar";
import { cn } from "../lib/utils";
import type { SearchDTO } from "@/types/common";

type SiteHeaderProps = {
  className?: string;
  isMobile: boolean;
  searchQuery: string;
  searchResults: SearchDTO[];
  searchError: string | null;
  isFocused: boolean;
  isSearching: boolean;
  onChangeQuery: (value: string) => void;
  onFocus: () => void;
  onClosePanel: () => void;
  onSelectResult: (item: SearchDTO) => void;
  rightActions?: React.ReactNode;
  searchContainerRef?: React.RefObject<HTMLDivElement | null>;
};

export function SiteHeader({
  className,
  isMobile,
  searchQuery,
  searchResults,
  searchError,
  isFocused,
  isSearching,
  onChangeQuery,
  onFocus,
  onClosePanel,
  onSelectResult,
  rightActions,
  searchContainerRef,
}: SiteHeaderProps) {
  const showSuggestionPanel = isFocused && searchQuery.trim().length > 0;

  return (
    <header className={cn("flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear", className)}>
      <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div ref={searchContainerRef} className="relative w-full max-w-sm">
          {isSearching ? (
            <LoaderCircle className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin" />
          ) : (
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          )}
          <Input
            value={searchQuery}
            onChange={(event) => onChangeQuery(event.target.value)}
            onFocus={onFocus}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClosePanel();
            }}
            placeholder={isMobile ? "Cari kamar, penghuni, inv..." : "Cari kamar, penghuni, invoice..."}
            className="h-9 pl-9 text-sm"
          />
          {showSuggestionPanel && (
            <div
              role="listbox"
              className="bg-popover text-popover-foreground absolute top-[calc(100%+0.375rem)] z-50 max-h-96 w-full overflow-y-auto rounded-md border shadow-md"
            >
              {searchError ? (
                <p className="text-destructive px-3 py-2 text-sm">{searchError}</p>
              ) : searchResults.length === 0 && !isSearching ? (
                <p className="text-muted-foreground px-3 py-2 text-sm">Data tidak ditemukan.</p>
              ) : (
                searchResults.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className="hover:bg-muted w-full cursor-pointer px-3 py-2 text-left transition-colors"
                    onClick={() => onSelectResult(item)}
                  >
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.subtitle && <p className="text-muted-foreground text-xs">{item.subtitle}</p>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Dashboard
          </Button>
          {rightActions}
        </div>
      </div>
    </header>
  );
}
