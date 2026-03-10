"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const isActive = (pathname: string, href: string) => {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-[#1E1C1B] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">InnoBiz-K Admin</h1>
            <p className="text-xs text-white/70">Application Review Console</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className={`rounded-lg px-3 py-2 font-semibold ${
                isActive(pathname, "/admin/dashboard")
                  ? "bg-[#4E705D] text-white"
                  : "text-white/85 hover:bg-white/10"
              }`}
              href="/admin/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className={`rounded-lg px-3 py-2 font-semibold ${
                isActive(pathname, "/admin/applications")
                  ? "bg-[#4E705D] text-white"
                  : "text-white/85 hover:bg-white/10"
              }`}
              href="/admin/applications"
            >
              Applications
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-white/70">{user?.email}</p>
            </div>
            <button
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              onClick={async () => {
                await logout();
                router.replace("/admin/login");
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
};
