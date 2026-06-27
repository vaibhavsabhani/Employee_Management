"use client";

import { LucideIcon, Pencil } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { DetailRow } from "../ui/custom/DetailRow";

export interface DetailField {
  icon: LucideIcon;
  label: string;
  value?: React.ReactNode;
}

export interface ViewDetailsDialogConfig {
  avatar?: string;
  initials: string;

  title: string;
  subtitle?: string;

  isActive?: boolean;

  fields: DetailField[];
}

interface ViewDetailsDialogProps {
  open: boolean;
  onClose: () => void;

  config: ViewDetailsDialogConfig;

  onEdit?: () => void;
  editLabel?: string;

  maxWidth?: string;
}

export function ViewDetailsDialog({
  open,
  onClose,
  config,
  onEdit,
  editLabel = "Edit",
  maxWidth = "sm:max-w-md",
}: ViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${maxWidth} p-0 gap-0 overflow-hidden`}>
        {/* Header */}
        <div className="bg-linear-to-br from-violet-600 to-violet-800 px-6 pt-8 pb-12 flex flex-col items-center gap-3">
          <div className="size-16 rounded-full ring-4 ring-white/30 overflow-hidden">
            {config.avatar ? (
              <img
                src={config.avatar}
                alt={config.initials}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                {config.initials}
              </div>
            )}
          </div>

          <div className="text-center">
            <DialogTitle className="text-lg font-bold text-white">
              {config.title}
            </DialogTitle>

            {config.subtitle && (
              <p className="text-sm text-white/70 mt-1 capitalize">
                {config.subtitle}
              </p>
            )}
          </div>

          {config.isActive !== undefined && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                config.isActive
                  ? "bg-green-400/20 text-green-100 ring-1 ring-green-300/40"
                  : "bg-red-400/20 text-red-100 ring-1 ring-red-300/40"
              }`}
            >
              {config.isActive ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="-mt-6 rounded-t-3xl bg-popover px-6 pt-5 pb-2">
          {config.fields.map((field) => (
            <DetailRow
              key={field.label}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onEdit && (
            <Button size="sm" onClick={onEdit}>
              <Pencil className="size-3" />
              {editLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
