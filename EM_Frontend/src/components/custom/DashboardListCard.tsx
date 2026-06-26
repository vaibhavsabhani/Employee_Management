"use client";

import { ReactNode } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <AlertCircle className="size-7 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

interface DashboardListCardProps<T> {
  title: string;
  emptyMessage: string;
  items: T[];
  onViewAll: () => void;
  renderItem: (item: T, index: number) => ReactNode;
}

export function DashboardListCard<T>({
  title,
  emptyMessage,
  items,
  onViewAll,
  renderItem,
}: DashboardListCardProps<T>) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 cursor-pointer"
        >
          View all
          <ArrowRight className="size-3" />
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyRow message={emptyMessage} />
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );
}
