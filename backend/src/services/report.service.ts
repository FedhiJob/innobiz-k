import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow } from "docx";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type MonthlyReportRange = {
  startDate: Date;
  endDate: Date;
};

export type MonthlyReportData = {
  rangeLabel: string;
  generatedAt: Date;
  summary: {
    totalApplications: number;
    createdInRange: number;
    submittedInRange: number;
    approvedInRange: number;
    rejectedInRange: number;
  };
  applications: Array<{
    id: string;
    companyName: string | null;
    status: ApplicationStatus;
    createdAt: Date;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    startup: {
      name: string;
      email: string;
    };
  }>;
};

const formatDate = (value: Date | null | undefined) => {
  if (!value) return "-";
  return value.toISOString().split("T")[0];
};

const formatDateTime = (value: Date | null | undefined) => {
  if (!value) return "-";
  return value.toISOString().replace("T", " ").split(".")[0];
};

const buildRangeLabel = (range: MonthlyReportRange) => {
  return `${formatDate(range.startDate)} to ${formatDate(range.endDate)}`;
};

export const resolveMonthlyRange = (input?: {
  startDate?: string;
  endDate?: string;
}): MonthlyReportRange => {
  const now = new Date();
  const defaultEnd = new Date(now);
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const start = input?.startDate ? new Date(input.startDate) : defaultStart;
  const end = input?.endDate ? new Date(input.endDate) : defaultEnd;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { startDate: defaultStart, endDate: defaultEnd };
  }

  return {
    startDate: start <= end ? start : end,
    endDate: end >= start ? end : start,
  };
};

export const buildMonthlyReportData = async (range: MonthlyReportRange): Promise<MonthlyReportData> => {
  const createdWhere: Prisma.ApplicationWhereInput = {
    createdAt: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };

  const submittedWhere: Prisma.ApplicationWhereInput = {
    submittedAt: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };

  const reviewedApprovedWhere: Prisma.ApplicationWhereInput = {
    status: ApplicationStatus.APPROVED,
    reviewedAt: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };

  const reviewedRejectedWhere: Prisma.ApplicationWhereInput = {
    status: ApplicationStatus.REJECTED,
    reviewedAt: {
      gte: range.startDate,
      lte: range.endDate,
    },
  };

  const [totalApplications, createdInRange, submittedInRange, approvedInRange, rejectedInRange, applications] =
    await prisma.$transaction([
      prisma.application.count(),
      prisma.application.count({ where: createdWhere }),
      prisma.application.count({ where: submittedWhere }),
      prisma.application.count({ where: reviewedApprovedWhere }),
      prisma.application.count({ where: reviewedRejectedWhere }),
      prisma.application.findMany({
        where: createdWhere,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          companyName: true,
          status: true,
          createdAt: true,
          submittedAt: true,
          reviewedAt: true,
          startup: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

  return {
    rangeLabel: buildRangeLabel(range),
    generatedAt: new Date(),
    summary: {
      totalApplications,
      createdInRange,
      submittedInRange,
      approvedInRange,
      rejectedInRange,
    },
    applications,
  };
};

export const renderTextReport = (data: MonthlyReportData) => {
  const lines = [
    "InnoBiz-K Monthly Report",
    `Period: ${data.rangeLabel}`,
    `Generated: ${formatDateTime(data.generatedAt)}`,
    "",
    "Summary",
    `Total applications: ${data.summary.totalApplications}`,
    `New applications: ${data.summary.createdInRange}`,
    `Submissions: ${data.summary.submittedInRange}`,
    `Approved: ${data.summary.approvedInRange}`,
    `Rejected: ${data.summary.rejectedInRange}`,
    "",
    "Applications",
  ];

  if (data.applications.length === 0) {
    lines.push("No new applications in this period.");
  } else {
    data.applications.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.companyName ?? "Untitled"} | ${item.startup.email} | ${item.status} | Created ${formatDate(
          item.createdAt,
        )}`,
      );
    });
  }

  return lines.join("\n");
};

export const renderCsvReport = (data: MonthlyReportData) => {
  const header = [
    "Application ID",
    "Company",
    "Startup Name",
    "Startup Email",
    "Status",
    "Created At",
    "Submitted At",
    "Reviewed At",
  ];

  const rows = data.applications.map((item) => [
    item.id,
    item.companyName ?? "",
    item.startup.name,
    item.startup.email,
    item.status,
    formatDate(item.createdAt),
    formatDate(item.submittedAt),
    formatDate(item.reviewedAt),
  ]);

  const escape = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [header, ...rows].map((row) => row.map((cell) => escape(String(cell))).join(",")).join("\n");
};

export const writePdfReport = async (data: MonthlyReportData, filePath: string) => {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("InnoBiz-K Monthly Report");
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Period: ${data.rangeLabel}`);
    doc.text(`Generated: ${formatDateTime(data.generatedAt)}`);
    doc.moveDown();

    doc.fontSize(14).text("Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total applications: ${data.summary.totalApplications}`);
    doc.text(`New applications: ${data.summary.createdInRange}`);
    doc.text(`Submissions: ${data.summary.submittedInRange}`);
    doc.text(`Approved: ${data.summary.approvedInRange}`);
    doc.text(`Rejected: ${data.summary.rejectedInRange}`);
    doc.moveDown();

    doc.fontSize(14).text("Applications", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    if (data.applications.length === 0) {
      doc.text("No new applications in this period.");
    } else {
      data.applications.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.companyName ?? "Untitled"} | ${item.startup.email} | ${item.status} | Created ${formatDate(
            item.createdAt,
          )}`,
        );
      });
    }

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", (error) => reject(error));
  });
};

export const writeDocxReport = async (data: MonthlyReportData, filePath: string) => {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  const summaryTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Total applications")] }),
          new TableCell({ children: [new Paragraph(String(data.summary.totalApplications))] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("New applications")] }),
          new TableCell({ children: [new Paragraph(String(data.summary.createdInRange))] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Submissions")] }),
          new TableCell({ children: [new Paragraph(String(data.summary.submittedInRange))] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Approved")] }),
          new TableCell({ children: [new Paragraph(String(data.summary.approvedInRange))] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Rejected")] }),
          new TableCell({ children: [new Paragraph(String(data.summary.rejectedInRange))] }),
        ],
      }),
    ],
  });

  const applicationRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Company")] }),
        new TableCell({ children: [new Paragraph("Startup Email")] }),
        new TableCell({ children: [new Paragraph("Status")] }),
        new TableCell({ children: [new Paragraph("Created At")] }),
      ],
    }),
    ...data.applications.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.companyName ?? "Untitled")] }),
            new TableCell({ children: [new Paragraph(item.startup.email)] }),
            new TableCell({ children: [new Paragraph(item.status)] }),
            new TableCell({ children: [new Paragraph(formatDate(item.createdAt))] }),
          ],
        }),
    ),
  ];

  const applicationsTable = new Table({
    rows: applicationRows,
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "InnoBiz-K Monthly Report",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph(`Period: ${data.rangeLabel}`),
          new Paragraph(`Generated: ${formatDateTime(data.generatedAt)}`),
          new Paragraph(""),
          new Paragraph({
            text: "Summary",
            heading: HeadingLevel.HEADING_2,
          }),
          summaryTable,
          new Paragraph(""),
          new Paragraph({
            text: "Applications",
            heading: HeadingLevel.HEADING_2,
          }),
          data.applications.length === 0
            ? new Paragraph("No new applications in this period.")
            : applicationsTable,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.promises.writeFile(filePath, buffer);
};
