import type {
  Application,
  FounderInput,
  PaginatedApplications,
  User,
  Document,
  MonthlyReport,
  AdminStats,
  PaginatedAdminApplications,
  AdminApplicationDetail,
  WeeklyReportShareResponse,
  WeeklyReportEmailResponse,
  NotificationListResponse,
  HeroUpdate,
  PaginatedSpaceRequests,
  SpaceRequest,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  details?: unknown;
}

export class ApiHttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: BodyInit | Record<string, unknown>;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { token, body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new ApiHttpError(response.status, payload.message || "Request failed", payload.details);
  }

  return payload.data;
};

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    request<{ user: User; accessToken: string }>("/auth/register", {
      method: "POST",
      body: input,
    }),

  login: (input: { email: string; password: string }) =>
    request<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body: input,
    }),

  me: (token: string) =>
    request<User>("/auth/me", {
      method: "GET",
      token,
    }),

  updateProfile: (
    token: string,
    input: { name?: string; email?: string; notifyByEmail?: boolean; notifyInApp?: boolean },
  ) =>
    request<User>("/auth/me", {
      method: "PATCH",
      token,
      body: input,
    }),

  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),
};

export const applicationApi = {
  list: (token: string, page = 1, pageSize = 50) =>
    request<PaginatedApplications>(`/applications?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      token,
    }),

  getById: (token: string, id: string) =>
    request<Application>(`/applications/${id}`, {
      method: "GET",
      token,
    }),

  createDraft: (
    token: string,
    input: {
      companyName?: string;
      sector?: string;
      stage?: string;
      description?: string;
      teamSize?: number;
      supportInterests?: string[];
      founders?: FounderInput[];
    },
  ) =>
    request<Application>("/applications", {
      method: "POST",
      token,
      body: input,
    }),

  updateDraft: (
    token: string,
    id: string,
    input: {
      companyName?: string;
      sector?: string;
      stage?: string;
      description?: string;
      teamSize?: number;
      supportInterests?: string[];
      founders?: FounderInput[];
    },
  ) =>
    request<Application>(`/applications/${id}`, {
      method: "PATCH",
      token,
      body: input,
    }),

  deleteDraft: (token: string, id: string) =>
    request<null>(`/applications/${id}`, {
      method: "DELETE",
      token,
    }),

  submit: (token: string, id: string) =>
    request<Application>(`/applications/${id}/submit`, {
      method: "POST",
      token,
    }),

  uploadDocument: (token: string, applicationId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return request<Document>(`/applications/${applicationId}/documents`, {
      method: "POST",
      token,
      body: formData,
    });
  },

  deleteDocument: (token: string, applicationId: string, docId: string) =>
    request<null>(`/applications/${applicationId}/documents/${docId}`, {
      method: "DELETE",
      token,
    }),

  uploadMonthlyReport: (
    token: string,
    applicationId: string,
    input: { headline: string; description: string; file: File; reportMonth?: string },
  ) => {
    const formData = new FormData();
    formData.append("headline", input.headline);
    formData.append("description", input.description);
    if (input.reportMonth) {
      formData.append("reportMonth", input.reportMonth);
    }
    formData.append("file", input.file);

    return request<MonthlyReport>(`/applications/${applicationId}/monthly-reports`, {
      method: "POST",
      token,
      body: formData,
    });
  },
};

export const adminApi = {
  stats: (token: string) =>
    request<AdminStats>("/admin/stats", {
      method: "GET",
      token,
    }),

  listApplications: (
    token: string,
    options?: { page?: number; pageSize?: number; status?: string; search?: string },
  ) => {
    const query = new URLSearchParams();
    if (options?.page) {
      query.set("page", String(options.page));
    }
    if (options?.pageSize) {
      query.set("pageSize", String(options.pageSize));
    }
    if (options?.status) {
      query.set("status", options.status);
    }
    if (options?.search && options.search.trim().length >= 2) {
      query.set("search", options.search.trim());
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedAdminApplications>(`/admin/applications${suffix}`, {
      method: "GET",
      token,
    });
  },

  getApplication: (token: string, id: string) =>
    request<AdminApplicationDetail>(`/admin/applications/${id}`, {
      method: "GET",
      token,
    }),

  approveApplication: (token: string, id: string, input: { adminNotes?: string }) =>
    request<Application>(`/admin/applications/${id}/approve`, {
      method: "POST",
      token,
      body: input,
    }),

  rejectApplication: (
    token: string,
    id: string,
    input: { rejectionReason: string; adminNotes?: string },
  ) =>
    request<Application>(`/admin/applications/${id}/reject`, {
      method: "POST",
      token,
      body: input,
    }),

  createMonthlyReportShare: (
    token: string,
    input?: { startDate?: string; endDate?: string; expiresInDays?: number },
  ) =>
    request<WeeklyReportShareResponse>("/admin/reports/monthly/share", {
      method: "POST",
      token,
      body: input ?? {},
    }),

  emailMonthlyReport: (
    token: string,
    input: {
      recipients: string[];
      format?: "pdf" | "docx" | "txt" | "csv";
      startDate?: string;
      endDate?: string;
      expiresInDays?: number;
    },
  ) =>
    request<WeeklyReportEmailResponse>("/admin/reports/monthly/email", {
      method: "POST",
      token,
      body: input,
    }),

  listHeroUpdates: (token: string) =>
    request<HeroUpdate[]>("/admin/hero-updates", {
      method: "GET",
      token,
    }),

  createHeroUpdate: (
    token: string,
    input: {
      title: string;
      message: string;
      ctaLabel?: string;
      ctaUrl?: string;
      published?: boolean;
      media?: File | null;
    },
  ) => {
    const formData = new FormData();
    formData.append("title", input.title);
    formData.append("message", input.message);
    if (input.ctaLabel) {
      formData.append("ctaLabel", input.ctaLabel);
    }
    if (input.ctaUrl) {
      formData.append("ctaUrl", input.ctaUrl);
    }
    if (input.published !== undefined) {
      formData.append("published", String(input.published));
    }
    if (input.media) {
      formData.append("media", input.media);
    }
    return request<HeroUpdate>("/admin/hero-updates", {
      method: "POST",
      token,
      body: formData,
    });
  },

  updateHeroUpdate: (
    token: string,
    id: string,
    input: {
      title?: string;
      message?: string;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
      published?: boolean;
      media?: File | null;
    },
  ) => {
    const formData = new FormData();
    if (input.title !== undefined) {
      formData.append("title", input.title);
    }
    if (input.message !== undefined) {
      formData.append("message", input.message);
    }
    if (input.ctaLabel !== undefined) {
      formData.append("ctaLabel", input.ctaLabel ?? "");
    }
    if (input.ctaUrl !== undefined) {
      formData.append("ctaUrl", input.ctaUrl ?? "");
    }
    if (input.published !== undefined) {
      formData.append("published", String(input.published));
    }
    if (input.media) {
      formData.append("media", input.media);
    }
    return request<HeroUpdate>(`/admin/hero-updates/${id}`, {
      method: "PATCH",
      token,
      body: formData,
    });
  },

  deleteHeroUpdate: (token: string, id: string) =>
    request<null>(`/admin/hero-updates/${id}`, {
      method: "DELETE",
      token,
    }),

  listSpaceRequests: (
    token: string,
    options?: { page?: number; pageSize?: number; status?: string; search?: string },
  ) => {
    const query = new URLSearchParams();
    if (options?.page) {
      query.set("page", String(options.page));
    }
    if (options?.pageSize) {
      query.set("pageSize", String(options.pageSize));
    }
    if (options?.status) {
      query.set("status", options.status);
    }
    if (options?.search && options.search.trim().length >= 2) {
      query.set("search", options.search.trim());
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedSpaceRequests>(`/space-requests${suffix}`, {
      method: "GET",
      token,
    });
  },

  approveSpaceRequest: (token: string, id: string, input?: { adminNotes?: string }) =>
    request<SpaceRequest>(`/space-requests/${id}/approve`, {
      method: "POST",
      token,
      body: input ?? {},
    }),

  rejectSpaceRequest: (
    token: string,
    id: string,
    input: { rejectionReason: string; adminNotes?: string },
  ) =>
    request<SpaceRequest>(`/space-requests/${id}/reject`, {
      method: "POST",
      token,
      body: input,
    }),
};

export const notificationApi = {
  list: (token: string, limit = 20, unreadOnly = false) => {
    const query = new URLSearchParams();
    query.set("limit", String(limit));
    if (unreadOnly) {
      query.set("unreadOnly", "true");
    }
    return request<NotificationListResponse>(`/notifications?${query.toString()}`, {
      method: "GET",
      token,
    });
  },

  markRead: (token: string, ids: string[]) =>
    request<null>("/notifications/mark-read", {
      method: "PATCH",
      token,
      body: { ids },
    }),

  markAllRead: (token: string) =>
    request<null>("/notifications/mark-all-read", {
      method: "PATCH",
      token,
    }),
};

export const updatesApi = {
  list: (limit = 5) =>
    request<HeroUpdate[]>(`/updates?limit=${limit}`, {
      method: "GET",
    }),
};

export const spaceRequestApi = {
  create: (input: {
    startupName: string;
    contactName: string;
    email: string;
    phone: string;
    teamSize?: number;
    resourceTypes: string[];
    startDate: string;
    endDate: string;
    purpose: string;
    additionalNotes?: string;
  }) =>
    request<SpaceRequest>("/space-requests", {
      method: "POST",
      body: input,
    }),
};
