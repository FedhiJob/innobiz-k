export type Role = "STARTUP" | "ADMIN";

export type ApplicationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type SupportInterest =
  | "OFFICE_SPACE"
  | "TRAINING"
  | "FUNDING"
  | "MENTORSHIP"
  | "NETWORKING"
  | "MARKET_ACCESS"
  | "LEGAL_SUPPORT"
  | "PRODUCT_DEVELOPMENT"
  | "INVESTMENT_READINESS"
  | "OTHER";

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "DOCUMENT_UPLOADED"
  | "MONTHLY_REPORT_SUBMITTED"
  | "SPACE_REQUEST_SUBMITTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  notifyByEmail?: boolean;
  notifyInApp?: boolean;
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

export interface MonthlyReport {
  id: string;
  applicationId: string;
  startupId: string;
  headline: string;
  description: string;
  reportMonth: string;
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
  supportInterests: SupportInterest[];
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
  monthlyReports: MonthlyReport[];
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

export interface WeeklyReportShareResponse {
  shareUrl: string;
  expiresAt: string;
  startDate: string;
  endDate: string;
}

export interface WeeklyReportEmailResponse {
  shareUrl: string;
  expiresAt: string;
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
  templateType:
    | "APPLICATION_RECEIVED"
    | "APPLICATION_APPROVED"
    | "APPLICATION_REJECTED"
    | "ADMIN_WEEKLY_REPORT"
    | "ADMIN_MONTHLY_REPORT";
  sentAt: string;
  delivered: boolean;
  errorMessage: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface OfficeSpace {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  locationLabel: string | null;
  capacity: number | null;
  amenities: string[];
  imageFileName: string | null;
  imageFileSize: number | null;
  imageMimeType: string | null;
  imageUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SpaceRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SpaceRequest {
  id: string;
  startupName: string;
  contactName: string;
  email: string;
  phone: string;
  officeSpaceId: string | null;
  officeSpaceName: string | null;
  teamSize: number | null;
  resourceTypes: string[];
  startDate: string;
  endDate: string;
  purpose: string;
  additionalNotes: string | null;
  status: SpaceRequestStatus;
  adminNotes: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  officeSpace?: Pick<OfficeSpace, "id" | "name" | "slug"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSpaceRequests {
  items: SpaceRequest[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}

export interface HeroUpdate {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  mediaUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  mediaMimeType: string | null;
  mediaFileName: string | null;
  mediaFileSize: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
}

export interface AdminApplicationDetail extends Application {
  startup: {
    id: string;
    name: string;
    email: string;
  };
  emailLogs: EmailLogEntry[];
}
