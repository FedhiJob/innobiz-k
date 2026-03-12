import { ApplicationStatus } from "@prisma/client";
import { ApiError } from "./api-error";

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [],
};

export const assertStatusTransition = (
  current: ApplicationStatus,
  next: ApplicationStatus,
  message: string,
) => {
  const allowed = allowedTransitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new ApiError(400, message);
  }
};
