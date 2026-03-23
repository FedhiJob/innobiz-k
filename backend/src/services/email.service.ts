import nodemailer from "nodemailer";
import { EmailTemplateType } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { buildEmailTemplate } from "./email.templates";

type EmailContext = {
  applicationId?: string;
  companyName?: string | null;
  submittedDate?: Date | null;
  decisionDate?: Date | null;
  reportPeriod?: string;
  downloadUrl?: string;
  recipient: string;
  templateType: EmailTemplateType;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
};

const isSmtpConfigured = () => {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
};

const getTransporter = () => {
  const secure = env.SMTP_PORT === 465;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const sendAndLogEmail = async (context: EmailContext) => {
  const { subject, text, html } = buildEmailTemplate(context.templateType, {
    companyName: context.companyName,
    applicationId: context.applicationId,
    submittedDate: context.submittedDate,
    decisionDate: context.decisionDate,
    reportPeriod: context.reportPeriod,
    downloadUrl: context.downloadUrl,
  });

  if (!isSmtpConfigured()) {
    await prisma.emailLog.create({
      data: {
        applicationId: context.applicationId,
        recipient: context.recipient,
        templateType: context.templateType,
        delivered: false,
        errorMessage: "SMTP not configured",
      },
    });
    return;
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: context.recipient,
      subject,
      text,
      html,
      attachments: context.attachments,
    });

    await prisma.emailLog.create({
      data: {
        applicationId: context.applicationId,
        recipient: context.recipient,
        templateType: context.templateType,
        delivered: true,
      },
    });
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        applicationId: context.applicationId,
        recipient: context.recipient,
        templateType: context.templateType,
        delivered: false,
        errorMessage: error instanceof Error ? error.message : "Unknown email error",
      },
    });
  }
};
