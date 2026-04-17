"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiHttpError, notificationApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { formatDateTime } from "@/lib/format";
import type { Notification } from "@/types/api";

type NotificationGroup = {
  label: string;
  items: Notification[];
};

const groupNotifications = (notifications: Notification[]): NotificationGroup[] => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const groups: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    const created = new Date(notification.createdAt).getTime();
    let label = "Earlier";
    if (created >= startOfToday) {
      label = "Today";
    } else if (created >= startOfYesterday) {
      label = "Yesterday";
    } else {
      label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(notification.createdAt),
      );
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
  });

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
};

export const NotificationBell = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingToast, setPendingToast] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const prevUnreadRef = useRef(0);
  const soundTimeoutRef = useRef<number | null>(null);

  const loadNotifications = async (options?: { silent?: boolean }) => {
    if (!token) {
      return;
    }
    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await notificationApi.list(token, 20);
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      if (options?.silent && data.unreadCount > prevUnreadRef.current) {
        const newestUnread = data.items.find((item) => !item.readAt);
        if (newestUnread) {
          setPendingToast(newestUnread);
        }
      }
      prevUnreadRef.current = data.unreadCount;
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setError(err.message);
      } else {
        setError("Unable to load notifications.");
      }
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadNotifications();
    if (!token) {
      return;
    }
    prevUnreadRef.current = 0;
    const interval = setInterval(() => {
      void loadNotifications({ silent: true });
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markRead = async (id: string) => {
    if (!token) {
      return;
    }
    try {
      await notificationApi.markRead(token, [id]);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item)),
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    } catch {
      // ignore to avoid blocking UX
    }
  };

  const markAllRead = async () => {
    if (!token) {
      return;
    }
    try {
      await notificationApi.markAllRead(token);
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setError(err.message);
      } else {
        setError("Unable to update notifications.");
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markRead(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      router.push(notification.link);
    }
  };

  useEffect(() => {
    if (!pendingToast) {
      return;
    }
    if (soundTimeoutRef.current !== null) {
      window.clearTimeout(soundTimeoutRef.current);
    }
    if (user?.notifyInApp !== false && typeof window !== "undefined") {
      try {
        const audioCtor =
          window.AudioContext ??
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (audioCtor) {
          const audioContext = new audioCtor();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = 740;
          gainNode.gain.value = 0.08;
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
        }
      } catch {
        // ignore audio errors
      }
    }
    const timer = window.setTimeout(() => {
      setPendingToast(null);
    }, 4500);
    soundTimeoutRef.current = timer;
    return () => window.clearTimeout(timer);
  }, [pendingToast]);

  const grouped = groupNotifications(items);

  const buttonStyles =
    variant === "dark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition ${buttonStyles}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0a3 3 0 01-6 0"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-ink relative">
            {unreadCount}
            <span className="notification-ping" />
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-[109] bg-brand-ink/10 backdrop-blur-[1px] md:hidden"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="fixed inset-x-3 top-20 z-[120] max-h-[calc(100vh-6.5rem)] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-4 shadow-panel backdrop-blur md:absolute md:right-0 md:left-auto md:top-full md:mt-3 md:w-80 md:max-h-none md:rounded-3xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-ink">Notifications</p>
            <button
              className="text-xs font-semibold text-brand-blue hover:underline"
              onClick={markAllRead}
              type="button"
            >
              Mark all read
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-brand-red">{error}</p> : null}
          <div className="mt-3 max-h-[calc(100vh-14rem)] space-y-2 overflow-y-auto pr-1 md:max-h-80">
            {loading ? (
              <p className="text-sm text-slate-500">Loading notifications...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              grouped.map((group) => (
                <div className="space-y-2" key={group.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                  {group.items.map((notification) => (
                    <button
                      className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                        notification.readAt
                          ? "border-slate-100 bg-white"
                          : "border-brand-blue/20 bg-brand-blue/5"
                      }`}
                      key={notification.id}
                      onClick={() => void handleNotificationClick(notification)}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-brand-ink">{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
          {user ? (
            <div className="mt-3 text-right">
              <Link
                className="text-xs font-semibold text-brand-blue hover:underline"
                href={user.role === "ADMIN" ? "/admin/notifications" : "/notifications"}
                onClick={() => setOpen(false)}
              >
                Notification settings
              </Link>
            </div>
          ) : null}
          </div>
        </>
      ) : null}

      {pendingToast ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[130] rounded-2xl border border-brand-blue/20 bg-white/95 p-3 shadow-lg md:absolute md:right-0 md:top-12 md:bottom-auto md:left-auto md:w-72">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">New notification</p>
          <p className="mt-1 text-sm font-semibold text-brand-ink">{pendingToast.title}</p>
          <p className="mt-1 text-xs text-slate-600">{pendingToast.message}</p>
        </div>
      ) : null}
    </div>
  );
};
