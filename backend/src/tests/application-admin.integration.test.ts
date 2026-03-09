import fs from "fs/promises";
import path from "path";
import request from "supertest";
import { EmailTemplateType } from "@prisma/client";
import app from "../app";
import { prisma } from "../config/prisma";
import { cleanupTestData, createAdminUser, uniqueEmail } from "./helpers";

const fixturePath = path.resolve(process.cwd(), "src/tests/fixtures/pitch-deck.pdf");

const createDraftPayload = (email: string) => ({
  companyName: "InnoBiz Test Company",
  sector: "Technology",
  stage: "MVP",
  description: "This is an integration test application description.",
  teamSize: 6,
  fundingNeeded: 25000,
  founders: [
    {
      name: "Primary Founder",
      email,
      role: "CEO",
      isPrimary: true,
    },
  ],
});

describe("Application + Admin flow", () => {
  beforeAll(async () => {
    await fs.mkdir(path.dirname(fixturePath), { recursive: true });
    await fs.writeFile(fixturePath, "integration test pitch deck");
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    try {
      await fs.unlink(fixturePath);
    } catch {
      // no-op
    }
  });

  it("enforces document requirement before submission and records status timeline", async () => {
    const startupEmail = uniqueEmail("startup_submit");
    const startupPassword = "Password1";

    await request(app).post("/api/auth/register").send({
      name: "Startup Submit",
      email: startupEmail,
      password: startupPassword,
    });

    const startupLogin = await request(app).post("/api/auth/login").send({
      email: startupEmail,
      password: startupPassword,
    });

    const startupToken: string = startupLogin.body.data.accessToken;

    const createDraft = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${startupToken}`)
      .send(createDraftPayload(uniqueEmail("founder")));

    expect(createDraft.status).toBe(201);
    const applicationId: string = createDraft.body.data.id;

    const submitWithoutDoc = await request(app)
      .post(`/api/applications/${applicationId}/submit`)
      .set("Authorization", `Bearer ${startupToken}`);

    expect(submitWithoutDoc.status).toBe(400);
    expect(submitWithoutDoc.body.message).toContain("pitch deck");

    const uploadResponse = await request(app)
      .post(`/api/applications/${applicationId}/documents`)
      .set("Authorization", `Bearer ${startupToken}`)
      .attach("file", fixturePath);

    expect(uploadResponse.status).toBe(201);

    const submitResponse = await request(app)
      .post(`/api/applications/${applicationId}/submit`)
      .set("Authorization", `Bearer ${startupToken}`);

    expect(submitResponse.status).toBe(200);
    expect(submitResponse.body.data.status).toBe("SUBMITTED");

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
    });

    expect(application?.statusHistory.map((entry) => entry.toStatus)).toEqual(["DRAFT", "SUBMITTED"]);

    const submittedLog = await prisma.emailLog.findFirst({
      where: {
        applicationId,
        templateType: EmailTemplateType.APPLICATION_RECEIVED,
        recipient: startupEmail,
      },
    });

    expect(submittedLog).not.toBeNull();
  });

  it("allows startup to delete draft applications and blocks deletion after submission", async () => {
    const startupEmail = uniqueEmail("startup_delete");
    const startupPassword = "Password1";

    await request(app).post("/api/auth/register").send({
      name: "Startup Delete",
      email: startupEmail,
      password: startupPassword,
    });

    const startupLogin = await request(app).post("/api/auth/login").send({
      email: startupEmail,
      password: startupPassword,
    });
    const startupToken: string = startupLogin.body.data.accessToken;

    const createDraft = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${startupToken}`)
      .send(createDraftPayload(uniqueEmail("founder_delete")));
    const draftId: string = createDraft.body.data.id;

    const uploadForDraft = await request(app)
      .post(`/api/applications/${draftId}/documents`)
      .set("Authorization", `Bearer ${startupToken}`)
      .attach("file", fixturePath);
    expect(uploadForDraft.status).toBe(201);

    const uploadedPath = path.resolve(
      process.cwd(),
      String(uploadForDraft.body.data.fileUrl).replace(/\//g, path.sep),
    );
    await fs.stat(uploadedPath);

    const deleteDraft = await request(app)
      .delete(`/api/applications/${draftId}`)
      .set("Authorization", `Bearer ${startupToken}`);

    expect(deleteDraft.status).toBe(200);

    const [deletedApplication, remainingDocuments] = await Promise.all([
      prisma.application.findUnique({
        where: { id: draftId },
      }),
      prisma.document.count({
        where: { applicationId: draftId },
      }),
    ]);

    expect(deletedApplication).toBeNull();
    expect(remainingDocuments).toBe(0);
    await expect(fs.access(uploadedPath)).rejects.toBeTruthy();

    const createAndSubmit = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${startupToken}`)
      .send(createDraftPayload(uniqueEmail("founder_submitted_delete")));
    const submittedId: string = createAndSubmit.body.data.id;

    await request(app)
      .post(`/api/applications/${submittedId}/documents`)
      .set("Authorization", `Bearer ${startupToken}`)
      .attach("file", fixturePath);

    await request(app)
      .post(`/api/applications/${submittedId}/submit`)
      .set("Authorization", `Bearer ${startupToken}`);

    const deleteSubmitted = await request(app)
      .delete(`/api/applications/${submittedId}`)
      .set("Authorization", `Bearer ${startupToken}`);

    expect(deleteSubmitted.status).toBe(400);
    expect(deleteSubmitted.body.message).toContain("draft");
  });

  it("allows admin to approve and reject submitted applications and logs emails", async () => {
    const startupEmail = uniqueEmail("startup_admin");
    const startupPassword = "Password1";
    const adminEmail = uniqueEmail("admin");
    const adminPassword = "Password1";

    await createAdminUser(adminEmail, adminPassword);

    await request(app).post("/api/auth/register").send({
      name: "Startup Admin Flow",
      email: startupEmail,
      password: startupPassword,
    });

    const startupLogin = await request(app).post("/api/auth/login").send({
      email: startupEmail,
      password: startupPassword,
    });
    const startupToken: string = startupLogin.body.data.accessToken;

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });
    const adminToken: string = adminLogin.body.data.accessToken;

    const createAndSubmit = async (label: string) => {
      const createResponse = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${startupToken}`)
        .send(createDraftPayload(uniqueEmail(`founder_${label}`)));

      const appId: string = createResponse.body.data.id;

      await request(app)
        .post(`/api/applications/${appId}/documents`)
        .set("Authorization", `Bearer ${startupToken}`)
        .attach("file", fixturePath);

      const submitResponse = await request(app)
        .post(`/api/applications/${appId}/submit`)
        .set("Authorization", `Bearer ${startupToken}`);

      expect(submitResponse.status).toBe(200);
      return appId;
    };

    const approveAppId = await createAndSubmit("approve");
    const rejectAppId = await createAndSubmit("reject");

    const approveResponse = await request(app)
      .post(`/api/admin/applications/${approveAppId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ adminNotes: "Looks good" });

    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.data.status).toBe("APPROVED");

    const rejectResponse = await request(app)
      .post(`/api/admin/applications/${rejectAppId}/reject`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ rejectionReason: "Not aligned with current cohort priorities." });

    expect(rejectResponse.status).toBe(200);
    expect(rejectResponse.body.data.status).toBe("REJECTED");

    const [approvedLog, rejectedLog] = await Promise.all([
      prisma.emailLog.findFirst({
        where: {
          applicationId: approveAppId,
          templateType: EmailTemplateType.APPLICATION_APPROVED,
          recipient: startupEmail,
        },
      }),
      prisma.emailLog.findFirst({
        where: {
          applicationId: rejectAppId,
          templateType: EmailTemplateType.APPLICATION_REJECTED,
          recipient: startupEmail,
        },
      }),
    ]);

    expect(approvedLog).not.toBeNull();
    expect(rejectedLog).not.toBeNull();

    const approvedEntity = await prisma.application.findUnique({
      where: { id: approveAppId },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
    });
    const rejectedEntity = await prisma.application.findUnique({
      where: { id: rejectAppId },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
    });

    expect(approvedEntity?.statusHistory.map((entry) => entry.toStatus)).toEqual([
      "DRAFT",
      "SUBMITTED",
      "APPROVED",
    ]);
    expect(rejectedEntity?.statusHistory.map((entry) => entry.toStatus)).toEqual([
      "DRAFT",
      "SUBMITTED",
      "REJECTED",
    ]);
  });
});
