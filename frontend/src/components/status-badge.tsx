import type { ApplicationStatus } from "@/types/api";

const statusStyles: Record<ApplicationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  APPROVED: "bg-brand-green/15 text-brand-green border-brand-green/25",
  REJECTED: "bg-brand-red/10 text-brand-red border-brand-red/20",
};

export const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
