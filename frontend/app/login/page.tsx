import { Suspense } from "react";
import { LoginPageClient } from "@/components/login-page-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
          <div className="panel w-full max-w-md p-6 text-sm text-slate-600">Loading...</div>
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
