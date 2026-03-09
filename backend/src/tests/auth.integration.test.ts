import request from "supertest";
import app from "../app";
import { cleanupTestData, uniqueEmail } from "./helpers";

describe("Auth API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("registers, logs in, and fetches current user", async () => {
    const email = uniqueEmail("auth");
    const password = "Password1";

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Integration Startup",
      email,
      password,
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.user.email).toBe(email);
    expect(registerResponse.body.data.accessToken).toEqual(expect.any(String));

    const loginResponse = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.accessToken).toEqual(expect.any(String));

    const accessToken: string = loginResponse.body.data.accessToken;

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data.email).toBe(email);
    expect(meResponse.body.data.role).toBe("STARTUP");
  });

  it("locks account after repeated failed login attempts", async () => {
    const email = uniqueEmail("lockout");
    const password = "Password1";

    await request(app).post("/api/auth/register").send({
      name: "Lockout User",
      email,
      password,
    });

    for (let i = 0; i < 5; i += 1) {
      const failed = await request(app).post("/api/auth/login").send({
        email,
        password: "WrongPassword1",
      });

      expect(failed.status).toBe(401);
    }

    const locked = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(locked.status).toBe(423);
    expect(locked.body.message).toContain("temporarily locked");
  });
});
