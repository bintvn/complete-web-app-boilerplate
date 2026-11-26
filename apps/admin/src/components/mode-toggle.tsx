import { Moon, Sun } from "lucide-react";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import type { Theme } from "@/contexts/theme.context";

type ModeToggleProps = {
  isDarkMode: boolean;
  onToggle: () => void;
  theme?: Theme;
};

export function ModeToggle({ isDarkMode, onToggle }: ModeToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="cursor-pointer"
    >
      {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
