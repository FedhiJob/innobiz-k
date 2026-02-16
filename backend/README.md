# Innobiz-K Backend

Backend API for the InnoBiz-K Ethiopia incubation application system.

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
