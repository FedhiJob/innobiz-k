# Innobiz-K Backend

Backend API for the innobiz-k Ethiopia incubation application system.

## Project Structure

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    middleware/
    modules/
      admin/
      applications/
      auth/
    routes/
    types/
    utils/
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migration:

```bash
npm run prisma:migrate
```

5. Seed admin account:

```bash
npm run seed
```

6. Run dev server:

```bash
npm run dev
```

## Integration Tests

1. Configure a database for tests.
   Use `TEST_DATABASE_URL` in `.env` if you want tests to use a separate database.
   If you are using Neon, set `DIRECT_DATABASE_URL` to the non-pooled direct connection and the test suite will use it automatically when `TEST_DATABASE_URL` is not set.
2. Run tests:

```bash
npm test
```

## Prisma and Neon

- Use `DATABASE_URL` for the application runtime connection.
- Use `DIRECT_DATABASE_URL` for Prisma migrations and integration tests.
- This avoids flaky pooled-connection behavior during long-running test or migration sessions.
