import { EmailTemplateType } from "@prisma/client";

type TemplatePayload = {
  companyName?: string | null;
  applicationId?: string;
  submittedDate?: Date | null;
  decisionDate?: Date | null;
  reportPeriod?: string;
  downloadUrl?: string;
};

type TemplateResult = {
  subject: string;
  text: string;
  html: string;
};

const formatDate = (value?: Date | null) => {
  if (!value) {
    return "";
  }

  return value.toISOString().split("T")[0];
};

export const buildEmailTemplate = (
  template: EmailTemplateType,
  payload: TemplatePayload,
): TemplateResult => {
  const companyName = payload.companyName ?? "your application";
  const applicationId = payload.applicationId ?? "N/A";
  const submittedDate = formatDate(payload.submittedDate);
  const decisionDate = formatDate(payload.decisionDate);

  switch (template) {
    case EmailTemplateType.APPLICATION_RECEIVED: {
      const subject = "innobiz-k: Application received";
      const text = `Hello,\n\nWe have received your application (${applicationId}) for ${companyName}. Submitted on ${submittedDate}.\n\nWe will review it and get back to you soon.\n\ninnobiz-k Team`;
      const html = `<p>Hello,</p><p>We have received your application (<strong>${applicationId}</strong>) for <strong>${companyName}</strong>. Submitted on <strong>${submittedDate}</strong>.</p><p>We will review it and get back to you soon.</p><p>innobiz-k Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.APPLICATION_APPROVED: {
      const subject = "innobiz-k: Application approved";
      const text = `Hello,\n\nGood news! Your application (${applicationId}) for ${companyName} was approved on ${decisionDate}.\n\nWe will contact you with next steps.\n\ninnobiz-k Team`;
      const html = `<p>Hello,</p><p><strong>Good news!</strong> Your application (<strong>${applicationId}</strong>) for <strong>${companyName}</strong> was approved on <strong>${decisionDate}</strong>.</p><p>We will contact you with next steps.</p><p>innobiz-k Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.APPLICATION_REJECTED: {
      const subject = "innobiz-k: Application update";
      const text = `Hello,\n\nYour application (${applicationId}) for ${companyName} was reviewed on ${decisionDate} and was not approved at this time.\n\nThank you for applying.\n\ninnobiz-k Team`;
      const html = `<p>Hello,</p><p>Your application (<strong>${applicationId}</strong>) for <strong>${companyName}</strong> was reviewed on <strong>${decisionDate}</strong> and was not approved at this time.</p><p>Thank you for applying.</p><p>innobiz-k Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.ADMIN_WEEKLY_REPORT: {
      const period = payload.reportPeriod ?? "the selected period";
      const downloadUrl = payload.downloadUrl ?? "";
      const subject = "innobiz-k: Weekly admin report";
      const text = `Hello,\n\nYour weekly admin report for ${period} is ready.\n\nDownload: ${downloadUrl}\n\ninnobiz-k Team`;
      const html = `<p>Hello,</p><p>Your weekly admin report for <strong>${period}</strong> is ready.</p><p><a href="${downloadUrl}">Download report</a></p><p>innobiz-k Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.ADMIN_MONTHLY_REPORT: {
      const period = payload.reportPeriod ?? "the selected period";
      const downloadUrl = payload.downloadUrl ?? "";
      const subject = "innobiz-k: Monthly admin report";
      const text = `Hello,\n\nYour monthly admin report for ${period} is ready.\n\nDownload: ${downloadUrl}\n\ninnobiz-k Team`;
      const html = `<p>Hello,</p><p>Your monthly admin report for <strong>${period}</strong> is ready.</p><p><a href="${downloadUrl}">Download report</a></p><p>innobiz-k Team</p>`;
      return { subject, text, html };
    }
    default:
      return {
        subject: "innobiz-k: Application update",
        text: "Hello,\n\nWe have an update about your application.\n\ninnobiz-k Team",
        html: "<p>Hello,</p><p>We have an update about your application.</p><p>innobiz-k Team</p>",
      };
  }
};
