"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { InkLoader } from "@/components/ink-loader";
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
      <InkLoader className="min-h-screen px-4" message="Checking access..." size="md" />
    );
  }

  return <>{children}</>;
};
