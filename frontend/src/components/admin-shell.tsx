"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenuButton } from "@/components/mobile-menu-button";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="relative z-[100] border-b border-black/10 bg-brand-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <div className="rounded-2xl bg-white/90 p-2">
                <img alt="InnoBiz-K Ethiopia" className="h-8 w-auto" src="/ink-logo.png" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold tracking-tight">InnoBiz-K Admin</h1>
                <p className="truncate text-xs text-white/70">Application Review Console</p>
              </div>
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <nav className="flex items-center gap-2 text-sm">
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
                    isActive(pathname, "/admin/space-requests")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/space-requests"
                >
                  Space Requests
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

            <div className="flex items-center gap-2 md:hidden">
              <NotificationBell variant="dark" />
              <MobileMenuButton
                className="border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/15"
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              />
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 rounded-[28px] border border-white/10 bg-white/10 p-3 shadow-panel backdrop-blur-md md:hidden">
              <nav className="flex flex-col gap-1 text-sm font-semibold">
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/") ? "bg-brand-blue text-white" : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/"
                >
                  Home
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/admin/dashboard")
                      ? "bg-brand-blue text-white"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/admin/applications")
                      ? "bg-brand-blue text-white"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/applications"
                >
                  Applications
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/admin/space-requests")
                      ? "bg-brand-blue text-white"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/space-requests"
                >
                  Space Requests
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/admin/profile")
                      ? "bg-brand-blue text-white"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                  href="/admin/profile"
                >
                  Profile
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
};
