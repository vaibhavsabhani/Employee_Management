"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type NotesCellProps = {
  notes?: string | null;
  /** Optional context shown in the dialog subtitle (e.g. employee · date). */
  subtitle?: string;
  title?: string;
  /** Characters to show before truncating with "… Read more". */
  limit?: number;
};

/**
 * Table-cell renderer for free-text notes. Truncates to a character limit with
 * an inline "… Read more" that opens a scrollable dialog — keeps row heights
 * sane on large screens and stays tidy in the mobile card view.
 */
export function NotesCell({
  notes,
  subtitle,
  title = "Work Notes",
  limit = 48,
}: NotesCellProps) {
  const [open, setOpen] = useState(false);
  const text = (notes ?? "").trim();

  if (!text) return <span className="text-slate-400 dark:text-slate-500">—</span>;

  const isLong = text.length > limit;
  const shown = isLong ? text.slice(0, limit).trimEnd() : text;

  return (
    <div className="max-w-37.5 sm:max-w-60">
      <p className="whitespace-normal wrap-break-word text-sm text-slate-600 dark:text-slate-300">
        {shown}
        {isLong && (
          // Keep "… Read more" glued together so the link never drops to its
          // own line away from the ellipsis.
          <span className="whitespace-nowrap">
            {"… "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="cursor-pointer align-baseline text-xs font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Read more
            </button>
          </span>
        )}
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 text-sidebar-primary">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="truncate">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/40 p-4">
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-foreground">
              {text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NotesCell;
