import { EmailTemplateType } from "@prisma/client";

type TemplatePayload = {
  companyName?: string | null;
  applicationId: string;
  submittedDate?: Date | null;
  decisionDate?: Date | null;
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
  const submittedDate = formatDate(payload.submittedDate);
  const decisionDate = formatDate(payload.decisionDate);

  switch (template) {
    case EmailTemplateType.APPLICATION_RECEIVED: {
      const subject = "InnoBiz-K: Application received";
      const text = `Hello,\n\nWe have received your application (${payload.applicationId}) for ${companyName}. Submitted on ${submittedDate}.\n\nWe will review it and get back to you soon.\n\nInnoBiz-K Team`;
      const html = `<p>Hello,</p><p>We have received your application (<strong>${payload.applicationId}</strong>) for <strong>${companyName}</strong>. Submitted on <strong>${submittedDate}</strong>.</p><p>We will review it and get back to you soon.</p><p>InnoBiz-K Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.APPLICATION_APPROVED: {
      const subject = "InnoBiz-K: Application approved";
      const text = `Hello,\n\nGood news! Your application (${payload.applicationId}) for ${companyName} was approved on ${decisionDate}.\n\nWe will contact you with next steps.\n\nInnoBiz-K Team`;
      const html = `<p>Hello,</p><p><strong>Good news!</strong> Your application (<strong>${payload.applicationId}</strong>) for <strong>${companyName}</strong> was approved on <strong>${decisionDate}</strong>.</p><p>We will contact you with next steps.</p><p>InnoBiz-K Team</p>`;
      return { subject, text, html };
    }
    case EmailTemplateType.APPLICATION_REJECTED: {
      const subject = "InnoBiz-K: Application update";
      const text = `Hello,\n\nYour application (${payload.applicationId}) for ${companyName} was reviewed on ${decisionDate} and was not approved at this time.\n\nThank you for applying.\n\nInnoBiz-K Team`;
      const html = `<p>Hello,</p><p>Your application (<strong>${payload.applicationId}</strong>) for <strong>${companyName}</strong> was reviewed on <strong>${decisionDate}</strong> and was not approved at this time.</p><p>Thank you for applying.</p><p>InnoBiz-K Team</p>`;
      return { subject, text, html };
    }
    default:
      return {
        subject: "InnoBiz-K: Application update",
        text: "Hello,\n\nWe have an update about your application.\n\nInnoBiz-K Team",
        html: "<p>Hello,</p><p>We have an update about your application.</p><p>InnoBiz-K Team</p>",
      };
  }
};
