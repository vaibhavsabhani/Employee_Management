"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Mail } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useLazyGetEmployeeEmailLogsQuery } from "@/src/store/action/employee/employee";

type EmailLog = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function EmployeeEmailLogs({ employeeId }: { employeeId: string }) {
  const [getLogs, { data, isFetching }] = useLazyGetEmployeeEmailLogsQuery();
  const [selected, setSelected] = useState<EmailLog | null>(null);

  useEffect(() => {
    if (employeeId) getLogs(employeeId);
  }, [employeeId, getLogs]);

  const logs: EmailLog[] = data?.data ?? [];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
            <Mail className="size-5" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Email History
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({logs.length})
            </span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isFetching && !data ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading email history…
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Mail className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No emails have been sent to this employee yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-6 py-3 font-semibold text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">
                    Sent To
                  </th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">
                    Date &amp; Time
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {log.subject}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{log.to}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                      {fmtDateTime(log.sentAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => setSelected(log)}
                      >
                        <Eye className="size-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Email body preview */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{selected?.subject}</DialogTitle>
            <DialogDescription>
              To {selected?.to} · {selected ? fmtDateTime(selected.sentAt) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto rounded-lg border border-border bg-white p-4">
            {selected && (
              <div
                className="text-sm text-slate-800 [&_a]:text-violet-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: selected.body }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default EmployeeEmailLogs;
