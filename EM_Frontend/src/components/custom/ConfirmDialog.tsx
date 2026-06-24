"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

type Variant = "destructive" | "default";

const variantStyles: Record<
  Variant,
  { header: string; iconRing: string; iconText: string; confirmBtn: string }
> = {
  destructive: {
    header: "from-red-500 to-red-700",
    iconRing: "ring-red-300",
    iconText: "text-red-500",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
  },
  default: {
    header: "from-violet-500 to-violet-700",
    iconRing: "ring-violet-300",
    iconText: "text-violet-500",
    confirmBtn: "bg-sidebar-primary hover:bg-violet-700 text-white",
  },
};

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  isLoading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm overflow-hidden p-0 gap-0">

        {/* Colored header band */}
        <div className={`bg-linear-to-br ${styles.header} px-6 pt-8 pb-10 flex flex-col items-center gap-3`}>
          {icon && (
            <div className={`p-3 rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm`}>
              <div className="size-8 flex items-center justify-center text-white">
                {icon}
              </div>
            </div>
          )}
          <h2 className="text-xl font-bold text-white text-center leading-tight">
            {title}
          </h2>
        </div>

        {/* Pulled-up white card body */}
        <div className="-mt-5 rounded-t-3xl bg-white dark:bg-slate-900 px-6 pt-5 pb-2 space-y-3">
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              {description}
            </p>
          )}
          {children && <div className="pt-1">{children}</div>}
        </div>

        {/* Footer */}
        <AlertDialogFooter className="px-6 pb-5 pt-3 border-t-0 bg-white dark:bg-slate-900 rounded-b-xl flex flex-row justify-end gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-9 px-4 text-sm"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-9 px-5 text-sm gap-2 ${styles.confirmBtn}`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}
