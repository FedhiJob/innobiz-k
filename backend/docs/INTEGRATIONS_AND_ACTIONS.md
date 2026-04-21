# Integrations and Actions Checklist

This file tracks exactly what you need to provide while development continues.

## Required Now

1. PostgreSQL database URL for development.
   - Provide: `DATABASE_URL`
   - Optional but recommended for Neon/pooled setups: `DIRECT_DATABASE_URL`
2. JWT secret (minimum 32 chars).
   - Provide: `JWT_SECRET`

## Required Before Email Features

1. SMTP credentials.
   - Provide: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Required Before Production File Upload

1. Storage configuration (S3-compatible or equivalent).
   - Provide: `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`

## Actions You Should Take

1. Create a `.env` from `.env.example` and fill values.
2. Decide provider choices:
   - DB provider (Neon/Supabase/Render/etc)
   - Email provider (SendGrid/Mailgun/Brevo/SES/etc)
   - Storage provider (S3/R2/Supabase Storage/etc)
3. Rotate seeded admin password after first login.
4. Add branch protection and CI checks once initial APIs are stable.
