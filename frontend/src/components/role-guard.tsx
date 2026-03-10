"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { Role } from "@/types/api";

interface RoleGuardProps {
  children: React.ReactNode;
  roles: Role[];
  unauthorizedPath?: string;
}

export const RoleGuard = ({ children, roles, unauthorizedPath = "/login" }: RoleGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (!roles.includes(user.role)) {
      router.replace(unauthorizedPath);
    }
  }, [isLoading, user, roles, router, pathname, unauthorizedPath]);

  if (isLoading || !user || !roles.includes(user.role)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
        <div className="panel px-6 py-4 text-sm font-medium text-slate-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};
