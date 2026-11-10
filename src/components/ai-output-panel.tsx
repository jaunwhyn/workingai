import { AlertCircle, Bot, Check, Copy, Download, FileText, Pencil, RefreshCw, Square, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SourceUrlUIPart } from "ai";

import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Sources, SourcesContent, SourcesTrigger, Source } from "@/components/ai-elements/sources";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AiToolState } from "@/hooks/use-ai-tool";
import { dateStamp, downloadText, markdownToPlainText } from "@/lib/download";
import { RTL_LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface AIOutputPanelProps {
  ai: AiToolState;
  title: string;
  downloadName: string;
  emptyIcon: LucideIcon;
  emptyText: string;
  regenerateLabel?: string;
  className?: string;
}

/** Shared output surface: loading, streaming, errors, edit, copy, regenerate and download. */
export function AIOutputPanel({
  ai,
  title,
  downloadName,
  emptyIcon: EmptyIcon,
  emptyText,
  regenerateLabel = "Regenerate",
  className,
}: AIOutputPanelProps) {
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevStatus = useRef(ai.status);

  // A fresh generation replaces any manual edits.
  useEffect(() => {
    if (ai.status === "submitted" && prevStatus.current !== "submitted") {
      setEdited(null);
      setEditing(false);
    }
    prevStatus.current = ai.status;
  }, [ai.status]);

  const content = edited ?? ai.output;
  const hasContent = content.trim().length > 0;
  const waiting = ai.status === "submitted" || (ai.status === "streaming" && !ai.output);
  const rtl = RTL_LANGUAGES.has(ai.language);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed — select the text and copy it manually.");
    }
  };

  const download = (format: "txt" | "md") => {
    const name = `${downloadName}-${dateStamp()}.${format}`;
    if (format === "md") downloadText(name, content, "text/markdown");
    else downloadText(name, markdownToPlainText(content));
    toast.success(`Downloaded ${name}`);
  };

  return (
    <section
      aria-label={title}
      aria-busy={ai.busy}
      className={cn("surface-card flex min-h-[420px] flex-col overflow-hidden", className)}
    >
      <div className={cn("h-1 w-full bg-sky-soft", ai.busy && "ai-loading-bar")} />
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-sky-soft text-sky-foreground">
            <Bot className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="text-xs text-muted-foreground">AI-generated · review before use</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {ai.busy ? (
            <Button variant="outline" size="sm" onClick={ai.stop}>
              <Square /> Stop
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={copy} disabled={!hasContent} aria-label="Copy result">
                {copied ? <Check /> : <Copy />} Copy
              </Button>
              <Button
                variant={editing ? "soft" : "ghost"}
                size="sm"
                onClick={() => {
                  if (!editing) setEdited(content);
                  setEditing((v) => !v);
                }}
                disabled={!hasContent}
                aria-pressed={editing}
              >
                {editing ? <Check /> : <Pencil />} {editing ? "Done" : "Edit"}
              </Button>
              <Button variant="ghost" size="sm" onClick={ai.regenerate} disabled={!ai.canRegenerate}>
                <RefreshCw /> {regenerateLabel}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={!hasContent}>
                    <Download /> Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => download("txt")}>
                    <FileText /> Plain text (.txt)
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => download("md")}>
                    <FileText /> Markdown (.md)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 bg-gradient-ai px-4 py-5 sm:px-6" dir={rtl ? "rtl" : undefined}>
        {ai.error ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-card p-4">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p>
                <span className="font-semibold">Couldn't generate a response. </span>
                {ai.error}
              </p>
            </div>
            {ai.canRegenerate && (
              <Button size="sm" onClick={ai.regenerate}>
                <RefreshCw /> Try again
              </Button>
            )}
          </div>
        ) : waiting ? (
          <div className="space-y-4" aria-live="polite">
            <Shimmer className="text-sm font-semibold">{`Generating in ${ai.language}…`}</Shimmer>
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        ) : editing ? (
          <Textarea
            value={edited ?? ""}
            onChange={(e) => setEdited(e.target.value)}
            className="min-h-[360px] bg-card font-mono text-sm leading-relaxed"
            aria-label="Edit generated content"
            autoFocus
          />
        ) : hasContent ? (
          <div className="text-sm leading-relaxed sm:text-[15px]">
            <MessageResponse isAnimating={ai.status === "streaming"}>{content}</MessageResponse>
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-2xl border border-sky/40 bg-card text-sky-foreground shadow-card">
              <EmptyIcon className="size-6" />
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">{emptyText}</p>
          </div>
        )}

        {ai.sources.length > 0 && !editing && <SourceList sources={ai.sources} />}
      </div>
    </section>
  );
}

function SourceList({ sources }: { sources: SourceUrlUIPart[] }) {
  return (
    <Sources defaultOpen className="mt-6 mb-0 rounded-xl border bg-card p-3 text-sm">
      <SourcesTrigger count={sources.length}>
        <p className="font-semibold">Verified web sources ({sources.length})</p>
      </SourcesTrigger>
      <SourcesContent>
        {sources.map((s) => (
          <Source key={s.url} href={s.url} title={s.title || s.url} />
        ))}
      </SourcesContent>
    </Sources>
  );
}
