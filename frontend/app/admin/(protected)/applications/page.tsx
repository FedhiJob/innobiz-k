import { Suspense } from "react";
import { AdminApplicationsPageClient } from "@/components/admin-applications-page-client";
import { InkLoader } from "@/components/ink-loader";

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<InkLoader className="min-h-[60vh] px-4" message="Loading applications..." size="md" />}>
      <AdminApplicationsPageClient />
    </Suspense>
  );
}
