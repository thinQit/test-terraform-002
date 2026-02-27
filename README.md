# test-terraform-002

A minimal web app to test and run Terraform pipelines (v2) with CRUD for pipeline definitions, triggering test runs, viewing run logs/results, and a dashboard to monitor pipeline health and recent runs.

## Features
- Dashboard with pipeline health and recent activity
- Pipeline CRUD (create, update, delete)
- Manual run triggers with status tracking
- Run detail view with logs and artifacts
- API health endpoint for CI checks
- Authentication scaffolding with RBAC-ready roles

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM with SQLite
- Tailwind CSS
- Jest + Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
### macOS/Linux
```bash
chmod +x install.sh
./install.sh
npm run dev
```

### Windows PowerShell
```powershell
./install.ps1
npm run dev
```

## Environment Variables
Create `.env` from `.env.example` and adjust as needed:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/app/               # Next.js App Router pages and layouts
src/app/api/           # API route handlers
src/components/        # Reusable UI components
src/lib/               # Utilities and shared helpers
src/providers/         # Context providers (auth, toast)
prisma/                # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health` - service health and version
- `GET /api/pipelines` - list pipelines
- `POST /api/pipelines` - create pipeline
- `GET /api/pipelines/:id` - pipeline detail
- `PUT /api/pipelines/:id` - update pipeline
- `DELETE /api/pipelines/:id` - delete pipeline
- `POST /api/pipelines/:id/trigger` - trigger run
- `GET /api/runs` - list runs
- `GET /api/runs/:id` - run detail
- `GET /api/runs/:id/logs` - run logs
- `GET /api/artifacts/:id` - artifact detail

## Available Scripts
- `npm run dev` - start development server
- `npm run build` - generate Prisma client and build
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run unit tests
- `npm run test:watch` - watch tests
- `npm run test:e2e` - run Playwright tests

## Testing
- Unit: Jest + Testing Library
- E2E: Playwright

Run tests:
```bash
npm run test
npm run test:e2e
```
