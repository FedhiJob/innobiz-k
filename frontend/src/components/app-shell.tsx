"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { NotificationBell } from "@/components/notification-bell";

const isActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === href;
  }
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="relative z-[100] border-b border-white/70 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <div className="shrink-0">
                <Image
                  alt="InnoBiz-K Ethiopia"
                  className="h-10 w-auto"
                  src="/ink-logo.png"
                  width={120}
                  height={40}
                  priority
                />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-brand-ink">InnoBiz-K Ethiopia</h1>
                <p className="truncate text-xs text-slate-500">Incubation Application Portal</p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/") ? "bg-brand-blue text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/"
                >
                  Home
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/dashboard")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/application")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/application/new"
                >
                  Application
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/reports")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/reports"
                >
                  Reports
                </Link>
                <Link
                  className={`whitespace-nowrap rounded-xl px-3 py-2 font-semibold ${
                    isActive(pathname, "/profile")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/profile"
                >
                  Profile
                </Link>
              </nav>
              <NotificationBell />
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <NotificationBell />
              <MobileMenuButton
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              />
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 rounded-[28px] border border-white/80 bg-white/95 p-3 shadow-panel md:hidden">
              <nav className="flex flex-col gap-1 text-sm font-semibold">
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/") ? "bg-brand-blue text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                  href="/"
                >
                  Home
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/dashboard")
                      ? "bg-brand-blue text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/application")
                      ? "bg-brand-blue text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  href="/application/new"
                >
                  Application
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/reports")
                      ? "bg-brand-blue text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  href="/reports"
                >
                  Reports
                </Link>
                <Link
                  className={`rounded-2xl px-4 py-3 ${
                    isActive(pathname, "/profile")
                      ? "bg-brand-blue text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  href="/profile"
                >
                  Profile
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
};
