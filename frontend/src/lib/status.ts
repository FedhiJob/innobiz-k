import type { ApplicationStatus } from "@/types/api";

const statusLabels: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const formatStatusLabel = (status?: ApplicationStatus | null) => {
  if (!status) {
    return "New";
  }
  return statusLabels[status];
};

