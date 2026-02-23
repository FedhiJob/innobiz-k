import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const adminUsers = [
  {
    name: "InnoBiz Admin",
    email: "admin@innobizk.et",
    password: "Admin1234",
    role: Role.ADMIN,
  },
];

async function main() {
  for (const admin of adminUsers) {
    const passwordHash = await bcrypt.hash(admin.password, 12);

    await prisma.user.upsert({
      where: {
        email: admin.email,
      },
      update: {
        name: admin.name,
        role: admin.role,
        passwordHash,
      },
      create: {
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: admin.role,
      },
    });
  }

  console.log(`Seeded ${adminUsers.length} admin account(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
