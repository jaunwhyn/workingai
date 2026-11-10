import { ShieldCheck } from "lucide-react";

import { RESPONSIBLE_AI_NOTICE } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ResponsibleAINotice({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <aside
      aria-label="Responsible AI notice"
      className={cn(
        "flex gap-3 rounded-xl border border-sky/40 bg-gradient-sky text-sm",
        compact ? "p-3 text-xs" : "p-4",
        className,
      )}
    >
      <ShieldCheck className={cn("shrink-0 text-sky-foreground", compact ? "size-4" : "size-5")} />
      <p className="leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Responsible AI: </span>
        {RESPONSIBLE_AI_NOTICE}
      </p>
    </aside>
  );
}
