import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run seed");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    await pool.end();
  });
