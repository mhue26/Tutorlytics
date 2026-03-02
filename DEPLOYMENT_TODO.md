## Deployment To-Do: TutorTools

This checklist tracks everything needed to launch the TutorTools app to production at `https://app.summitedu.com.au`, using Vercel and a managed Postgres database. We will work through these items together and mark them off as we go.

---

### 1. Hosting & Database

- [ ] Decide on managed Postgres provider (e.g. Supabase, Neon, Railway).
- [ ] Create a **production Postgres database** for TutorTools.
- [ ] Record the **production `DATABASE_URL`** connection string.
- [ ] Test running Prisma migrations against the production DB:

  ```bash
  export DATABASE_URL="postgresql://...prod..."
  npx prisma migrate deploy
  ```

---

### 2. Environment Variables (No Stripe Yet)

- [ ] List all environment variables currently used in `.env.local` (database, auth, email, etc.).
- [ ] Decide production values for required env vars:
  - [ ] `DATABASE_URL` → production Postgres URL.
  - [ ] `NEXTAUTH_URL` → (initially Vercel URL, later `https://app.summitedu.com.au`).
  - [ ] `NEXTAUTH_SECRET` → strong random value.
  - [ ] Any OAuth/email/provider keys used by the app.
- [ ] Explicitly note that **Stripe-related variables are deferred** for a future phase (no Stripe integration yet).

---

### 3. Initial Vercel Deployment (Using Vercel Domain)

- [ ] Ensure `main` (or the chosen deployment branch) is up to date on GitHub.
- [ ] Create a **new Vercel project** from the GitHub repository.
- [ ] Confirm Vercel auto-detects **Next.js** and accept default build/output settings.
- [ ] Add required environment variables in Vercel (using the Vercel URL for `NEXTAUTH_URL` initially).
- [ ] Trigger the first deploy.
- [ ] Smoke-test the app on the **Vercel-provided URL** (e.g. `https://your-project.vercel.app`):
  - [ ] Home page (`/`).
  - [ ] `"/dashboard"`.
  - [ ] `"/students"`.
  - [ ] `"/calendar"`.
  - [ ] Sign-in / sign-up flows.

---

### 4. Configure `app.summitedu.com.au` Subdomain

- [ ] In the Vercel project, **add** the custom domain `app.summitedu.com.au`.
- [ ] Copy the **CNAME target** value Vercel provides for this domain.
- [ ] Ask the existing `summitedu.com.au` maintainer to add a DNS record:
  - Type: `CNAME`
  - Name/Host: `app`
  - Value/Target: the CNAME value Vercel shows.
- [ ] Wait for DNS propagation and confirm Vercel shows `app.summitedu.com.au` as **configured**.
- [ ] Update Vercel environment variable:
  - [ ] `NEXTAUTH_URL=https://app.summitedu.com.au`
- [ ] Redeploy the app (if Vercel does not redeploy automatically).
- [ ] Smoke-test the app at `https://app.summitedu.com.au`:
  - [ ] Auth flows (sign-in/sign-up).
  - [ ] Dashboard, students, calendar, schedule pages.

---

### 5. Future: Billing, Webhooks, and Cron (Optional for First Launch)

These items are **not required** for the initial launch but should be documented for a future billing phase.

- [ ] List billing-related environment variables that will be needed later (Stripe keys, webhook secrets, price IDs, etc.).
- [ ] Identify billing-related API routes and pages (invoices, payments, quotes, webhooks, cron routes).
- [ ] Decide how billing-related UI should behave **before** billing is live (hidden, disabled, or “coming soon”).
- [ ] Plan Stripe account setup and webhook configuration for a later phase.
- [ ] Plan a scheduler/cron solution (e.g. Vercel Cron, external service) for any `api/cron/*` endpoints.

---

### 6. Pre-Launch Checklist (Without Stripe)

- [ ] `npm run build` passes locally without errors.
- [ ] `npx prisma migrate deploy` has been run successfully against the production database.
- [ ] All required environment variables are set in Vercel (no runtime `undefined` config values).
- [ ] `https://app.summitedu.com.au` resolves correctly and serves the app.
- [ ] Core flows work on `https://app.summitedu.com.au`:
  - [ ] User authentication (sign-in/sign-up, redirect after login).
  - [ ] Dashboard overview.
  - [ ] Students pages (list/detail/edit where applicable).
  - [ ] Calendar and schedule views.
- [ ] Vercel logs checked for errors during smoke tests (especially `/api/*` routes).

---

As we work through deployment, we will update this checklist by turning `[ ]` into `[x]` for completed items and adjusting or adding tasks if requirements change.

