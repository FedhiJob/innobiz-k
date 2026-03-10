import { AdminShell } from "@/components/admin-shell";
import { RoleGuard } from "@/components/role-guard";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]} unauthorizedPath="/dashboard">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
