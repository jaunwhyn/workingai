import { Link } from "@tanstack/react-router";
import { Globe2, Moon, Sun } from "lucide-react";

import logo from "@/assets/logo.png";
import { LanguageSelect } from "@/components/language-select";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppState } from "@/lib/app-state";

export function TopBar() {
  const { theme, toggleTheme } = useAppState();
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-2 border-b bg-card/85 px-3 backdrop-blur-md sm:gap-3 sm:px-4">
      <SidebarTrigger className="size-9" aria-label="Toggle navigation" />
      <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="AI Workplace Productivity Assistant — Dashboard">
        <img src={logo} alt="" width={36} height={36} className="size-9 shrink-0" />
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-sm font-bold sm:text-base">AI Workplace</span>
          <span className="block truncate text-[11px] font-medium text-muted-foreground max-sm:hidden">
            Productivity Assistant
          </span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sky/50 bg-sky-soft px-3 text-xs font-semibold text-sky-foreground max-md:hidden">
              <Globe2 className="size-3.5" />
              Public access · no sign-in
            </span>
          </TooltipTrigger>
          <TooltipContent>Anyone with the link can use every tool. No account needed.</TooltipContent>
        </Tooltip>
        <LanguageSelect compact />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
