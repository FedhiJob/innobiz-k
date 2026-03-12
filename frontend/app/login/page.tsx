import { Suspense } from "react";
import { LoginPageClient } from "@/components/login-page-client";
import { InkLoader } from "@/components/ink-loader";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <InkLoader className="min-h-screen px-4 py-10" message="Loading login..." size="lg" />
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
