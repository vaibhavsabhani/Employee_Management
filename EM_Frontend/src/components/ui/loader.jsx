import React from "react";
import { cn } from "@/lib/utils";

function Loader({
  size = "md",
  className = "",
  text = "",
  variant = "primary",
  spinnerOnly = false,
}) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2.5",
    lg: "w-8 h-8 border-4",
  };

  const colorMap = {
    primary: "border-slate-300 border-t-indigo-600",
    muted: "border-slate-200 border-t-slate-400",
    white: "border-white border-t-white/90",
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div
        aria-hidden
        className={cn(
          "rounded-full animate-spin inline-block",
          sizeMap[size] || sizeMap.md,
          colorMap[variant] || colorMap.primary,
        )}
      />
      {!spinnerOnly && (
        <span className="text-sm text-slate-500" aria-live="polite">
          {text}
        </span>
      )}
    </div>
  );
}

export { Loader };
