import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";

export const TEST_EMAIL_PREFIX = "it_";

export const uniqueEmail = (label: string) =>
  `${TEST_EMAIL_PREFIX}${label}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

export const createAdminUser = async (email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      name: "Integration Admin",
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  });
};

export const cleanupTestData = async () => {
  const users = await prisma.user.findMany({
    where: {
      email: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  if (users.length === 0) {
    return;
  }

  const userIds = users.map((user) => user.id);

  const applications = await prisma.application.findMany({
    where: {
      startupId: {
        in: userIds,
      },
    },
    select: {
      id: true,
      documents: {
        select: {
          fileUrl: true,
        },
      },
    },
  });

  const applicationIds = applications.map((application) => application.id);

  for (const application of applications) {
    for (const document of application.documents) {
      const resolved = path.resolve(process.cwd(), document.fileUrl.replace(/\//g, path.sep));
      try {
        await fs.unlink(resolved);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }
  }

  await prisma.emailLog.deleteMany({
    where: {
      OR: [
        {
          recipient: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
        {
          applicationId: {
            in: applicationIds.length > 0 ? applicationIds : ["__no_match__"],
          },
        },
      ],
    },
  });

  await prisma.applicationStatusHistory.deleteMany({
    where: {
      OR: [
        {
          applicationId: {
            in: applicationIds.length > 0 ? applicationIds : ["__no_match__"],
          },
        },
        {
          changedById: {
            in: userIds,
          },
        },
      ],
    },
  });

  await prisma.document.deleteMany({
    where: {
      applicationId: {
        in: applicationIds.length > 0 ? applicationIds : ["__no_match__"],
      },
    },
  });

  await prisma.founder.deleteMany({
    where: {
      applicationId: {
        in: applicationIds.length > 0 ? applicationIds : ["__no_match__"],
      },
    },
  });

  await prisma.application.deleteMany({
    where: {
      id: {
        in: applicationIds.length > 0 ? applicationIds : ["__no_match__"],
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
};
