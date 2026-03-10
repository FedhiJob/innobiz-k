export type Role = "STARTUP" | "ADMIN";

export type ApplicationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface FounderInput {
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isPrimary?: boolean;
}

export interface Founder extends FounderInput {
  id: string;
  applicationId: string;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  applicationId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Application {
  id: string;
  startupId: string;
  companyName: string | null;
  sector: string | null;
  stage: string | null;
  description: string | null;
  teamSize: number | null;
  fundingNeeded: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  founders: Founder[];
  documents: Document[];
  statusHistory: Array<{
    id: string;
    fromStatus: ApplicationStatus | null;
    toStatus: ApplicationStatus;
    note: string | null;
    changedById: string | null;
    changedAt: string;
  }>;
}

export interface PaginatedApplications {
  items: Array<{
    id: string;
    companyName: string | null;
    status: ApplicationStatus;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface AdminApplicationListItem {
  id: string;
  companyName: string | null;
  status: ApplicationStatus;
  submittedAt: string | null;
  createdAt: string;
  startup: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedAdminApplications {
  items: AdminApplicationListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface EmailLogEntry {
  id: string;
  applicationId: string | null;
  recipient: string;
  templateType: "APPLICATION_RECEIVED" | "APPLICATION_APPROVED" | "APPLICATION_REJECTED";
  sentAt: string;
  delivered: boolean;
  errorMessage: string | null;
}

export interface AdminApplicationDetail extends Application {
  startup: {
    id: string;
    name: string;
    email: string;
  };
  emailLogs: EmailLogEntry[];
}
