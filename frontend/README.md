# InnoBiz-K Frontend (Next.js)

This frontend is built with Next.js App Router + Tailwind CSS and is wired to the backend APIs under `/api`.

## Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## Run

From project root:

```bash
npm run dev
```

Or individually:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## MVP Pages (Implemented)

Startup portal:

1. `/login`
2. `/register`
3. `/dashboard`
4. `/profile`
5. `/application/new`
6. `/application/[id]` (resume draft / view submitted)

Admin portal:

1. `/admin/login`
2. `/admin/dashboard`
3. `/admin/applications`
4. `/admin/applications/[id]`

Utility:

1. `/` (role-based redirect)
2. `not-found` page

Total currently implemented: **12 routes/pages** (`10` product pages + `2` utility routes).

## Recommended Full MVP Page Count (Based on Current Backend)

Startup + Admin together:

1. Startup login
2. Startup register
3. Startup dashboard
4. Startup profile
5. Startup new application
6. Startup application detail/edit
7. Admin login
8. Admin dashboard
9. Admin applications list
10. Admin application detail review

Recommended MVP total: **10 core pages** (+ root redirect and not-found).
