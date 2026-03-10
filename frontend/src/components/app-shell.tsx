"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const isActive = (pathname: string, href: string) => {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/60 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-brand-slate">
              InnoBiz-K Ethiopia
            </h1>
            <p className="text-xs text-slate-500">Incubation Application Portal</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className={`rounded-lg px-3 py-2 font-semibold ${
                isActive(pathname, "/dashboard")
                  ? "bg-brand-blue text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className={`rounded-lg px-3 py-2 font-semibold ${
                isActive(pathname, "/application")
                  ? "bg-brand-blue text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              href="/application/new"
            >
              Application
            </Link>
            <Link
              className={`rounded-lg px-3 py-2 font-semibold ${
                isActive(pathname, "/profile")
                  ? "bg-brand-blue text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              href="/profile"
            >
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              className="btn-secondary"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
};
