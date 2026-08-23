<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MedBook — Doctor Appointment Frontend

Next.js frontend for the [DoctorAppointmentService_Backend](https://github.com/DevTechMike-Coder/DoctorAppointmentService_Backend) Spring Boot API.

## Getting started

1. Start the backend (Spring Boot, default port `8080`).
2. Copy the env file and adjust if needed:

   ```bash
   cp .env.example .env.local
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## How the API is reached

The browser calls same-origin `/api/v1/*`; `next.config.ts` rewrites those
requests server-side to `BACKEND_URL` (default `http://localhost:8080`).
This avoids CORS entirely. To call the backend directly from the browser
instead, set `NEXT_PUBLIC_API_BASE_URL` (the backend must then allow your
origin in its CORS config).

## Structure

- `app/(auth)` — login and registration
- `app/(patient)` — doctor browsing, booking, patient appointments
- `app/(doctor)` — doctor appointments, availability slots, profile
- `hooks/` — data-fetching hooks per resource
- `lib/` — API client, auth/token helpers, shared types, date helpers
- `components/` — shared UI (header/nav, toasts)
- `proxy.ts` — route protection + role-based redirects (Next.js proxy convention)
