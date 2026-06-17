import React from "react";
import {
  useGetNotificationsQuery,
  useMarkReadMutation,
} from "@/store/Action/notificationAction";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const { data, isLoading } = useGetNotificationsQuery({ page: 1, limit: 50 });
  const [markRead] = useMarkReadMutation();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
      <div className="space-y-2">
        {(data?.data || []).map((n) => (
          <div
            key={n._id}
            className={`p-3 rounded border ${n.isRead ? "bg-white" : "bg-blue-50"}`}
          >
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.message}</div>
              </div>
              <div>
                {!n.isRead && (
                  <Button onClick={() => markRead(n._id)}>Mark read</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
