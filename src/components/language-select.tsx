import { Check, ChevronsUpDown, Languages } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppState } from "@/lib/app-state";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface LanguageSelectProps {
  className?: string;
  compact?: boolean;
  id?: string;
}

/** Searchable selector for the AI output language (shared by every tool). */
export function LanguageSelect({ className, compact, id }: LanguageSelectProps) {
  const { language, setLanguage } = useAppState();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.name === language);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`AI response language: ${language}`}
          className={cn("justify-between gap-2 font-normal", compact ? "h-9 px-2.5" : "w-full", className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Languages className="text-primary" />
            <span className={cn("truncate", compact && "max-w-28 max-sm:hidden")}>{language}</span>
          </span>
          {!compact && <ChevronsUpDown className="opacity-50" />}
          {compact && current && <span className="sr-only">{current.native}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <Command>
          <CommandInput placeholder={`Search ${LANGUAGES.length} languages…`} />
          <CommandList className="max-h-72">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((l) => (
                <CommandItem
                  key={l.name}
                  value={`${l.name} ${l.native}`}
                  onSelect={() => {
                    setLanguage(l.name);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", language === l.name ? "opacity-100 text-primary" : "opacity-0")} />
                  <span className="flex-1">{l.name}</span>
                  {l.native !== l.name && <span className="text-xs text-muted-foreground">{l.native}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
