import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["STARTUP"]} unauthorizedPath="/admin/dashboard">
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
