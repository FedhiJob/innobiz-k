import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DIRECT_DATABASE_URL;

if (testDatabaseUrl) {
  process.env.DATABASE_URL = testDatabaseUrl;
}

process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-secret-key-with-minimum-length-32-characters";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";
process.env.LOGIN_MAX_ATTEMPTS = process.env.LOGIN_MAX_ATTEMPTS ?? "5";
process.env.LOGIN_LOCKOUT_MINUTES = process.env.LOGIN_LOCKOUT_MINUTES ?? "15";

delete process.env.SMTP_HOST;
delete process.env.SMTP_PORT;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
delete process.env.SMTP_FROM;
