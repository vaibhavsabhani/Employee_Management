"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    previewBg: "#f8fafc",
    previewSidebar: "#1e293b",
    previewHeader: "#ffffff",
    previewCard: "#ffffff",
    previewText: "#334155",
    previewMuted: "#e2e8f0",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    previewBg: "#0f172a",
    previewSidebar: "#020617",
    previewHeader: "#1e293b",
    previewCard: "#1e293b",
    previewText: "#e2e8f0",
    previewMuted: "#334155",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    previewBg: "linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)",
    previewSidebar: "#1e293b",
    previewHeader: "#ffffff",
    previewCard: "#ffffff",
    previewText: "#334155",
    previewMuted: "#e2e8f0",
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your preferences and account settings.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose how the application looks on your device.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {themes.map(({ id, label, icon: Icon, previewBg, previewSidebar, previewHeader, previewCard, previewText, previewMuted }) => {
            const isSelected = mounted && theme === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={[
                  "group relative flex flex-col gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150",
                  isSelected
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/50",
                ].join(" ")}
              >
                {/* Mini UI preview */}
                <div
                  className="w-full overflow-hidden rounded-lg border border-border/40"
                  style={{ aspectRatio: "16/10" }}
                >
                  <div className="flex h-full" style={{ background: previewBg }}>
                    {/* Sidebar */}
                    <div
                      className="w-1/4 h-full flex flex-col gap-1 p-1"
                      style={{ background: previewSidebar }}
                    >
                      <div className="h-2 w-2/3 rounded-sm bg-white/20 mt-0.5" />
                      <div className="h-1.5 w-full rounded-sm bg-white/10" />
                      <div className="h-1.5 w-full rounded-sm bg-white/10" />
                      <div className="h-1.5 w-full rounded-sm bg-white/10" />
                    </div>

                    {/* Main */}
                    <div className="flex-1 flex flex-col">
                      {/* Header bar */}
                      <div
                        className="h-3 w-full border-b flex items-center px-1 gap-0.5"
                        style={{
                          background: previewHeader,
                          borderColor: previewMuted,
                        }}
                      >
                        <div className="h-1 w-4 rounded-sm" style={{ background: previewMuted }} />
                        <div className="h-1 w-3 rounded-sm ml-auto" style={{ background: previewMuted }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-1 flex flex-col gap-1">
                        <div
                          className="h-3 rounded-md"
                          style={{ background: previewCard, border: `1px solid ${previewMuted}` }}
                        />
                        <div className="flex gap-1">
                          <div
                            className="h-2 flex-1 rounded-sm"
                            style={{ background: previewMuted }}
                          />
                          <div
                            className="h-2 flex-1 rounded-sm"
                            style={{ background: previewMuted }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label row */}
                <div className="flex items-center gap-2 px-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
