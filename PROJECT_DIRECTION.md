# Tutorlytics - Project Direction

## Overview

**Tutorlytics** is an AI-powered teaching assistant for private tutors: student management, scheduling, billing, and administrative automation, with a focus on real-time AI assistance during lessons.

**Vision**: The go-to platform for tutors to focus on teaching while AI handles transcription, communication, lesson summaries, and admin.

---

## Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5, Turbopack
- **Database**: SQLite via Prisma 6 — *PostgreSQL migration planned*
- **Auth**: NextAuth 4
- **Styling**: Tailwind CSS 4

---

## Implemented

- **Auth & infra**: NextAuth, multi-user data isolation, responsive layout
- **Students**: Profiles, parent/guardian, subjects, goals, archive, class assignment, status
- **Classes**: Create/manage, color-coded, student associations
- **Calendar**: Meetings, terms/holidays, completion tracking
- **Dashboard**: Board-style UI, groups, recent events, collapsible sidebar
- **UI**: Profile, modals, public homepage, forgot password

---

## Priorities

### 1. Landing page UI (current focus)
- [ ] Update landing page layout, copy, and visuals
- [ ] Improve conversion and clarity for visitors

### 2. Billing & invoicing (critical – revenue)
- [ ] Invoice data model (Invoice, LineItem, Payment)
- [ ] Auto-invoices from completed meetings, management UI, PDF export
- [ ] Stripe integration, payment tracking, revenue/outstanding views

### 3. Calendar & scheduling
- [ ] Drag-and-drop, recurring lessons, conflict prevention
- [ ] Availability (working hours, blocks), Google/iCal sync

### 4. Communication
- [ ] Email notifications (reminders, invoices), in-app notifications
- [ ] Basic tutor–student/parent messaging

### 5. AI teaching assistant (differentiator – long-term)
- [ ] Real-time transcription, in-lesson AI assistance, lesson summaries
- [ ] AI-drafted parent messages, homework deadline extraction
- [ ] Decisions: STT provider, LLM, audio storage, WebSockets

### 6. Student portal & self-booking
- [ ] Student auth, view lessons/payments, download invoices, request changes
- [ ] Booking links, student booking flow, auto meeting creation

---

## Technical debt & security

- **DB**: Migrate SQLite → PostgreSQL before production
- **Quality**: Stronger TypeScript types, error boundaries, loading states, form validation (client + server)
- **Security**: Rate limiting, CSRF, input sanitization, authz checks, GDPR (export/delete)

---

## Timeline

| When | Focus |
|------|--------|
| **Now** | Landing page UI, billing/invoicing, DB migration planning |
| **1–3 mo** | Calendar enhancements, communication (email, reminders) |
| **3–6 mo** | Student portal MVP, self-booking |
| **6+ mo** | AI teaching assistant, analytics |

---

## Decisions pending

- PostgreSQL host (Vercel, Supabase, Railway)
- Payment: Stripe (planned)
- Email: SendGrid, Resend, or SES
- AI: LLM provider, STT provider, audio storage (S3/R2)

---

**Last updated**: February 2025
