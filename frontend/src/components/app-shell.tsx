"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const isActive = (pathname: string, href: string) => {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
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
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-brand-ink">InnoBiz-K Ethiopia</h1>
                <p className="text-xs text-slate-500">Incubation Application Portal</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm sm:pb-0">
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
                    isActive(pathname, "/profile")
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href="/profile"
                >
                  Profile
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
};
