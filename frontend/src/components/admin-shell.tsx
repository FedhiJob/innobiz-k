"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";

const isActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === href;
  }
  if (href === "/admin/dashboard") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-brand-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="flex items-center gap-3" href="/">
              <div className="rounded-2xl bg-white/90 p-2">
                <img alt="InnoBiz-K Ethiopia" className="h-8 w-auto" src="/ink-logo.png" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">InnoBiz-K Admin</h1>
                <p className="text-xs text-white/70">Application Review Console</p>
              </div>
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm sm:pb-0">
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/") ? "bg-brand-blue text-white shadow-sm" : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/"
                >
                  Home
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/admin/dashboard")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/admin/applications")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/applications"
                >
                  Applications
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/admin/profile")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/profile"
                >
                  Profile
                </Link>
              </nav>
              <NotificationBell variant="dark" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
};
