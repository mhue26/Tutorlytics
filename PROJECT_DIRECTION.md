# Tutorlytics - Project Direction

## Project Overview

**Tutorlytics** is an AI-powered teaching assistant platform for private tutors. The platform helps tutors manage students, schedule lessons, handle billing, and automate administrative tasks—with a focus on real-time AI assistance during lessons.

### Vision
To become the go-to platform that enables tutors to focus on teaching while AI handles lesson transcription, automated communication, lesson summaries, and administrative tasks.

---

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **Database**: SQLite (via Prisma) - *Migration to PostgreSQL planned*
- **ORM**: Prisma 6.16.2
- **Authentication**: NextAuth 4.24.11
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Build Tool**: Turbopack

---

## Current Features (Implemented)

### Core Infrastructure
- ✅ User authentication with NextAuth
- ✅ Multi-user support with data isolation
- ✅ Monday.com-style dashboard layout (top header, sidebar, board views)
- ✅ Responsive UI with Tailwind CSS

### Student Management
- ✅ Student profiles (name, email, phone, address, notes)
- ✅ Parent/guardian relationship tracking
- ✅ Subject management (tutoring subjects & school subjects)
- ✅ Student goals tracking
- ✅ Archive functionality
- ✅ Class assignment
- ✅ Student status indicators

### Class Management
- ✅ Create and manage classes
- ✅ Color-coded classes
- ✅ Student-class associations

### Calendar & Scheduling
- ✅ Calendar view for meetings/lessons
- ✅ Term and holiday management
- ✅ Color-coded terms and holidays
- ✅ Meeting creation and management
- ✅ Meeting completion tracking

### Dashboard
- ✅ Monday.com-style board interface
- ✅ Board groups and task tables
- ✅ Recent events display
- ✅ Sidebar navigation with hide/show functionality

### UI/UX
- ✅ Profile management
- ✅ Modal system
- ✅ Public-facing homepage
- ✅ Forgot password functionality

---

## Priority Features for Implementation

### 🔴 **PRIORITY 1: Billing & Invoicing System** (Critical - Revenue Feature)
**Why**: Core revenue feature, essential for business operations

**Tasks**:
- [ ] Design invoice data model (Invoice, InvoiceLineItem, Payment models)
- [ ] Auto-generate invoices from completed meetings
- [ ] Invoice management UI (list, filters, detail view, PDF export)
- [ ] Stripe integration for payment processing
- [ ] Payment tracking and history
- [ ] Revenue reports and outstanding invoices dashboard

**Estimated Impact**: High - Enables monetization and core business functionality

---

### 🟠 **PRIORITY 2: Enhanced Calendar & Scheduling** (High Value)
**Why**: Improves user experience and reduces scheduling friction

**Tasks**:
- [ ] Drag-and-drop calendar interface
- [ ] Recurring lessons (create series, edit/delete instances)
- [ ] Conflict prevention and visual indicators
- [ ] Availability management (working hours, blocked times)
- [ ] Calendar sync (Google Calendar, iCal export)

**Estimated Impact**: High - Significantly improves scheduling workflow

---

### 🟡 **PRIORITY 3: Communication Features** (Medium-High Value)
**Why**: Reduces manual communication overhead

**Tasks**:
- [ ] Email notifications (meeting reminders, invoice notifications)
- [ ] Automated email reminders (24h, 1h before lessons)
- [ ] In-app notification center
- [ ] Basic messaging between tutor and student/parent

**Estimated Impact**: Medium-High - Reduces administrative burden

---

### 🟢 **PRIORITY 4: AI-Powered Teaching Assistant** ⭐ (Differentiator - Long-term)
**Why**: Key differentiator that sets Tutorlytics apart from competitors

**Core Features**:
- [ ] Real-time speech-to-text transcription during lessons
- [ ] Real-time AI teaching assistance (examples, questions, quotes as you teach)
- [ ] AI-generated lesson summaries
- [ ] AI-drafted parent communication messages
- [ ] Automated homework deadline extraction and scheduling

**Technical Requirements**:
- Choose speech-to-text provider (Deepgram, AssemblyAI, or OpenAI Whisper)
- Choose LLM provider (OpenAI GPT-4, Anthropic Claude)
- Audio storage solution (S3, Cloudflare R2)
- Real-time WebSocket infrastructure for streaming

**Estimated Impact**: Very High - Unique selling point, but complex to implement

---

### 🔵 **PRIORITY 5: Student Portal** (Medium Value)
**Why**: Improves student/parent engagement

**Tasks**:
- [ ] Student authentication system
- [ ] View upcoming lessons and payment history
- [ ] Download invoices
- [ ] Request lesson changes
- [ ] Access resources and materials

**Estimated Impact**: Medium - Improves user experience but not critical for MVP

---

### ⚪ **PRIORITY 6: Self-Booking System** (Medium Value)
**Why**: Reduces scheduling overhead

**Tasks**:
- [ ] Booking link generation
- [ ] Student booking flow
- [ ] Automatic meeting creation
- [ ] Cancel/reschedule options

**Estimated Impact**: Medium - Nice-to-have feature

---

## Technical Debt & Critical Improvements

### Database Migration
- [ ] **URGENT**: Migrate from SQLite to PostgreSQL before production
  - Better concurrency handling
  - Production-ready for multi-user
  - Better performance at scale

### Code Quality
- [ ] Add comprehensive TypeScript types
- [ ] Implement error boundaries
- [ ] Add loading states consistently
- [ ] Improve error handling and user feedback
- [ ] Add form validation (client and server-side)

### Security
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Implement proper authorization checks
- [ ] GDPR compliance (data export, deletion)

---

## Development Timeline

### Immediate (Next 2-4 weeks)
1. **Billing & Invoicing System** - Critical revenue feature
2. **Database Migration Planning** - Research PostgreSQL hosting, plan migration

### Short-term (1-3 months)
1. **Enhanced Calendar** - Drag-and-drop, recurring lessons
2. **Communication Features** - Email notifications, reminders

### Medium-term (3-6 months)
1. **Student Portal MVP** - Basic student login and features
2. **Self-Booking System** - Booking links and flow

### Long-term (6+ months)
1. **AI-Powered Teaching Assistant** - Real-time transcription and AI assistance
2. **Advanced Analytics** - Revenue reporting, student analytics

---

## Key Decisions Pending

- PostgreSQL hosting provider (Vercel Postgres, Supabase, Railway, etc.)
- Payment processor (Stripe is planned)
- Email service provider (SendGrid, Resend, AWS SES, etc.)
- AI/LLM Provider (OpenAI, Anthropic Claude)
- Speech-to-Text Provider (Deepgram, AssemblyAI, OpenAI Whisper)
- Audio storage (AWS S3, Cloudflare R2)

---

**Last Updated**: January 2025
