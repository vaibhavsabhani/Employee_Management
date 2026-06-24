"use client";

import { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Monitor, Search, Mail, Clock, LogIn, LogOut, Globe, Smartphone } from "lucide-react";
import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import Filter from "@/src/components/custom/filters";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import usePaginatedQuery from "@/src/hooks/usePagination";
import { useLazyGetActivityLogsQuery } from "@/src/store/action/activity-log/activityLog";

/* ── types ─────────────────────────────────────────────── */
type LogEntry = {
  id: string;
  action: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  city?: string;
  region?: string;
  loginAt: string;
  logoutAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role?: { name: string };
  };
};

/* ── helpers ─────────────────────────────────────────────── */
function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(loginAt: string, logoutAt?: string) {
  if (!logoutAt) return null;
  const ms = new Date(logoutAt).getTime() - new Date(loginAt).getTime();
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0) return `${hrs}h ${rem}m`;
  return `${mins}m`;
}

function UserCell({ user }: { user: LogEntry["user"] }) {
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase();
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="shrink-0 size-8 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold text-xs">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="" className="size-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground capitalize truncate">
          {user.role?.name ?? "employee"}
        </p>
      </div>
    </div>
  );
}

/* ── filter panel ────────────────────────────────────────── */
const ACTION_TABS = [
  { label: "All", value: "" },
  { label: "Login", value: "LOGIN" },
  { label: "Logout", value: "LOGOUT" },
];

type DraftFilters = { search: string; email: string; action: string; startDate: string; endDate: string };
const defaultDraft: DraftFilters = { search: "", email: "", action: "", startDate: "", endDate: "" };
const defaultFilters = { search: "", email: "", action: "", startDate: "", endDate: "" };

function LogFilterPanel({
  draft,
  setDraft,
  onApply,
  onReset,
}: {
  draft: DraftFilters;
  setDraft: React.Dispatch<React.SetStateAction<DraftFilters>>;
  onApply: () => void;
  onReset: () => void;
  closeFilter?: () => void;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end gap-4 p-3 w-full">
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-semibold mb-1.5">Search by Name</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="First or last name…"
            value={draft.search}
            onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-sm font-semibold mb-1.5">Search by Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Email address…"
            value={draft.email}
            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-sm font-semibold mb-1.5">From Date</label>
        <Input
          type="date"
          value={draft.startDate}
          onChange={(e) => setDraft((p) => ({ ...p, startDate: e.target.value }))}
          max={draft.endDate || undefined}
        />
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-sm font-semibold mb-1.5">To Date</label>
        <Input
          type="date"
          value={draft.endDate}
          onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
          min={draft.startDate || undefined}
        />
      </div>

      <div className="flex gap-3 shrink-0 xl:pb-0 pb-1">
        <Button type="button" onClick={onApply} className="h-10 px-6 bg-sidebar-primary hover:bg-violet-700 text-white">
          Apply Filter
        </Button>
        <Button type="button" variant="outline" onClick={onReset} className="h-10 px-6">
          Reset
        </Button>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────── */
const LogsPage = () => {
  const [getLogs] = useLazyGetActivityLogsQuery();
  const [draft, setDraft] = useState<DraftFilters>(defaultDraft);

  const fetchLogs = useCallback(
    ({ page, limit, ...filters }: any) =>
      getLogs({ page, limit, filters }).unwrap(),
    [getLogs],
  );

  const transformResponse = useCallback(
    (res: any) => ({ data: res?.data ?? [], total: res?.total ?? 0 }),
    [],
  );

  const {
    data, loading, page, nextPage, prevPage, canNext, canPrev,
    updateFilters, filters, totalPages, total, limit, setLimit, resetLimit,
  } = usePaginatedQuery(fetchLogs, { defaultFilters, transformResponse });

  const activeAction = (filters as any)?.action ?? "";

  const handleApply = () => { resetLimit(); updateFilters({ ...(filters as any), ...draft }); };
  const handleReset = () => { setDraft(defaultDraft); resetLimit(); updateFilters(defaultFilters); };

  const columns: ColumnDef<any>[] = [
    {
      id: "user",
      header: "Employee",
      cell: ({ row }) => <UserCell user={row.original.user} />,
    },
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.user.email}</span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const isLogin = row.original.action === "LOGIN";
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isLogin
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          }`}>
            {isLogin ? <LogIn className="size-3" /> : <LogOut className="size-3" />}
            {row.original.action}
          </span>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ipAddress || "—"}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const { city, region, country } = row.original;
        const parts = [city, region, country].filter(Boolean).join(", ");
        return parts ? (
          <span className="flex items-center gap-1 text-sm">
            <Globe className="size-3 text-muted-foreground shrink-0" />
            {parts}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "browser",
      header: "Browser",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Monitor className="size-3 text-muted-foreground shrink-0" />
          {row.original.browser || "—"}
        </span>
      ),
    },
    {
      accessorKey: "os",
      header: "OS",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.os || "—"}</span>
      ),
    },
    {
      accessorKey: "device",
      header: "Device",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Smartphone className="size-3 text-muted-foreground shrink-0" />
          <span className="capitalize">{row.original.device || "—"}</span>
        </span>
      ),
    },
    {
      accessorKey: "loginAt",
      header: "Login Time",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm whitespace-nowrap">
          <Clock className="size-3 text-green-500 shrink-0" />
          {fmtDate(row.original.loginAt)}
        </span>
      ),
    },
    {
      accessorKey: "logoutAt",
      header: "Logout Time",
      cell: ({ row }) =>
        row.original.logoutAt ? (
          <span className="flex items-center gap-1 text-sm whitespace-nowrap">
            <Clock className="size-3 text-orange-500 shrink-0" />
            {fmtDate(row.original.logoutAt)}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Active
          </span>
        ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const d = duration(row.original.loginAt, row.original.logoutAt);
        return d ? (
          <span className="text-sm font-medium text-muted-foreground">{d}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Track employee login and logout activity across all sessions."
      />

      {/* Filter Panel */}
      <Filter>
        <LogFilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={handleApply}
          onReset={handleReset}
        />
      </Filter>

      {/* Action type tabs */}
      <div className="flex gap-2 flex-wrap" id="log-action-tabs">
        {ACTION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              const newDraft = { ...draft, action: tab.value };
              setDraft(newDraft);
              resetLimit();
              updateFilters({ ...(filters as any), ...newDraft });
            }}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeAction === tab.value
                ? "bg-sidebar-primary text-white border-sidebar-primary"
                : "bg-pill-bg text-pill-fg border-pill-ring hover:border-violet-400 hover:text-violet-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onNext={nextPage}
        onPrev={prevPage}
        canNext={canNext}
        canPrev={canPrev}
        page={page}
        total={totalPages}
        totalRecords={total}
        limit={limit}
        setLimit={setLimit}
        showExtraHeader={["log-action-tabs", "pageHeading"]}
      />
    </div>
  );
};

export default LogsPage;
