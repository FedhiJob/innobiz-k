import { Suspense } from "react";
import { AdminApplicationsPageClient } from "@/components/admin-applications-page-client";

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="panel p-5 text-sm text-slate-600">Loading applications...</div>}>
      <AdminApplicationsPageClient />
    </Suspense>
  );
}
