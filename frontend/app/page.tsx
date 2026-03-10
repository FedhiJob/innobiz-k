"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    }
  }, [isLoading, user, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
      <div className="panel px-8 py-6 text-sm font-medium text-slate-600">Loading...</div>
    </div>
  );
}
