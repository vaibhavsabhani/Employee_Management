"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Check } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { getCookie } from "@/src/lib/cookieStorage";
import { ROLES } from "@/src/constant/role";
import {
  useLazyGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/src/store/action/notification/notification";

const WS_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/"
).replace(/\/+$/, "");

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any> | null;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [fetchNotifications] = useLazyGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 20 })
      .unwrap()
      .then((res: any) => {
        if (res?.data) {
          setNotifications(res.data);
          setUnreadCount(res.unreadCount ?? 0);
        }
      })
      .catch(() => {});

    const token = getCookie("accessToken");
    if (!token) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("notification", (n: Notification) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
      // broadcast leave events
      if (["leave_applied", "leave_approved", "leave_rejected"].includes(n.type)) {
        window.dispatchEvent(new CustomEvent("leave:update", { detail: { type: n.type } }));
      }
      // broadcast time-entry events
      if (
        [
          "time_entry_submitted",
          "time_entry_resubmitted",
          "time_entry_approved",
          "time_entry_rejected",
          "time_entry_clock_in",
          "time_entry_lunch_start",
          "time_entry_lunch_end",
          "time_entry_clock_out",
        ].includes(n.type)
      ) {
        window.dispatchEvent(new CustomEvent("timeentry:update", { detail: { type: n.type } }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const getNotificationHref = (n: Notification): string | null => {
    const d = n.data ?? {};
    const role = getCookie("role") ?? "";
    const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

    // Leave: admins approve/reject from the list, employees view their requests there too.
    if (n.type.startsWith("leave")) return "/leave";

    // Time entry: admins review from the list; employees resubmit a rejected entry via its form.
    if (n.type.startsWith("time_entry")) {
      if (!isAdmin && n.type === "time_entry_rejected" && d.timeEntryId) {
        return `/time-entry/${d.timeEntryId}`;
      }
      return "/time-entry";
    }

    if (n.type === "attendance_marked") return "/attendance";
    return null;
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) handleMarkRead(n.id);
    const href = getNotificationHref(n);
    setIsOpen(false);
    if (href) router.push(href);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(undefined).unwrap();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        className="relative flex items-center text-muted-foreground transition hover:text-foreground cursor-pointer"
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen((o) => !o)}
      >
        {unreadCount > 0 ? (
          <BellRing className="size-5" />
        ) : (
          <Bell className="size-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-16 z-50 rounded-xl border border-notif-panel-ring bg-notif-panel shadow-xl overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-notif-panel-ring">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-notif-title text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-notif-badge text-notif-badge-fg text-[11px] font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="flex items-center gap-1 text-xs text-notif-action-fg hover:opacity-80 font-medium transition-opacity"
                onClick={handleMarkAllRead}
              >
                <Check className="size-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-notif-divider">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="size-8 text-notif-empty-icon mx-auto mb-2" />
                <p className="text-sm text-notif-empty-fg">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-notif-hover transition-colors ${
                    !n.isRead ? "bg-notif-unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 transition-colors ${
                        !n.isRead ? "bg-violet-500" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-notif-title leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-notif-msg mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-notif-time mt-1">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
