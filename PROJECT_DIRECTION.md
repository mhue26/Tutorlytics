# Tutorlytics - Project Direction & Planning Guide

## Project Overview

**Tutorlytics** is a modern, comprehensive platform designed to help private tutors manage their entire business operations. The platform aims to streamline student management, lesson scheduling, billing, and communication—all in one integrated system.

### Vision Statement
To become the go-to **AI-powered teaching assistant** platform for private tutors, enabling them to focus on teaching while AI handles lesson transcription, automated communication, lesson summaries, and administrative tasks. The platform combines intelligent automation with comprehensive business management to revolutionize how tutors operate.
---

## Current State

### Technology Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **Database**: SQLite (via Prisma)
- **ORM**: Prisma 6.16.2
- **Authentication**: NextAuth 4.24.11
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Build Tool**: Turbopack
- **AI Services**: (To be determined - OpenAI, Anthropic, or similar)
- **Speech-to-Text**: (To be determined - OpenAI Whisper, Deepgram, AssemblyAI, or similar)

### Implemented Features

#### ✅ Core Infrastructure
- User authentication (NextAuth integration)
- Multi-user support with data isolation
- Database schema with Prisma
- Responsive UI with Tailwind CSS

#### ✅ Student Management
- Student profiles with comprehensive information
- Parent/guardian relationship tracking
- Subject management (tutoring subjects & school subjects)
- Student goals tracking
- Archive functionality
- Class assignment
- Student status indicators
- Notes and resource links

#### ✅ Class Management
- Create and manage classes
- Color-coded classes
- Student-class associations

#### ✅ Calendar & Scheduling
- Calendar view for meetings
- Term and holiday management
- Color-coded terms and holidays
- Meeting creation and management
- Meeting completion tracking

#### ✅ Navigation & UI
- Dashboard
- Profile management
- Responsive navigation
- Modal system

### Partially Implemented / Planned Features

#### 🟡 Billing & Invoicing
- Route exists (`/billing`) but functionality may be incomplete
- **Planned**: Auto-generate invoices from lessons
- **Planned**: Stripe integration for payments
- **Planned**: Payment plans and dunning
- **Planned**: Export to bookkeeping systems

#### 🟡 Lesson Scheduling (Advanced)
- Basic meeting creation exists
- **Planned**: Drag-and-drop calendar interface
- **Planned**: Conflict prevention
- **Planned**: Recurring lessons
- **Planned**: Availability blocks
- **Planned**: Calendar sync (Google/Apple)

#### 🟡 Communication
- **Planned**: Automated email/SMS reminders
- **Planned**: Parent communication tools
- **Planned**: Notification systems

#### 🔴 Workflow Automation
- **Planned**: Self-service booking links
- **Planned**: Lesson confirmation flows
- **Planned**: Zapier/webhook integrations
- **Planned**: Template system for workflows

#### 🔴 AI-Powered Teaching Assistant
- **Planned**: Real-time speech-to-text transcription during lessons
- **Planned**: Real-time AI teaching assistance (examples, questions, quotes as you teach)
- **Planned**: AI-generated lesson summaries
- **Planned**: AI-drafted parent communication messages
- **Planned**: Automated homework deadline scheduling
- **Planned**: AI-powered insights from lesson content
- **Planned**: Student progress analysis from transcriptions

---

## Development Roadmap

### Phase 1: Core Functionality Enhancement (Current Priority)
**Goal**: Complete and polish existing features

#### 1.1 Billing & Invoicing System
- [ ] Design invoice data model
  - Invoice model (amount, due date, status, payment method)
  - Invoice line items (lessons, rates, discounts)
  - Payment tracking model
- [ ] Invoice generation from meetings
  - Auto-create invoices based on completed meetings
  - Support for different billing cycles (weekly, monthly, per lesson)
- [ ] Invoice management UI
  - List view with filters (paid, pending, overdue)
  - Invoice detail view with PDF export
  - Edit and void functionality
- [ ] Payment processing
  - Stripe integration setup
  - Payment form and processing
  - Payment history tracking
- [ ] Reporting
  - Revenue reports
  - Outstanding invoices dashboard
  - Payment analytics

#### 1.2 Enhanced Calendar & Scheduling
- [ ] Drag-and-drop calendar interface
  - Interactive calendar component
  - Drag meetings to reschedule
  - Visual conflict indicators
- [ ] Recurring lessons
  - Create recurring meeting series
  - Edit/delete individual or all instances
  - Exception handling (holidays, cancellations)
- [ ] Availability management
  - Set working hours
  - Block unavailable times
  - Timezone support
- [ ] Calendar sync
  - Google Calendar integration
  - Apple Calendar (iCal) export
  - Two-way sync capabilities

#### 1.3 Communication Features
- [ ] Email notifications
  - Meeting reminders (24h, 1h before)
  - Invoice notifications
  - Welcome emails for new students
- [ ] SMS integration (optional)
  - Twilio or similar service integration
  - SMS reminders and notifications
- [ ] In-app notifications
  - Notification center
  - Real-time updates

### Phase 2: Advanced Features
**Goal**: Add differentiating features that set Tutorlytics apart

#### 2.1 Student Portal
- [ ] Student authentication system
  - Separate student login
  - Parent/guardian access
- [ ] Portal features
  - View upcoming lessons
  - View payment history
  - Download invoices
  - Request lesson changes
  - Access resources and materials
- [ ] Communication hub
  - Messaging between tutor and student/parent
  - Announcements board

#### 2.2 Self-Booking System
- [ ] Booking link generation
  - Unique booking links per tutor
  - Customizable availability windows
- [ ] Booking flow
  - Student selects time slot
  - Confirmation and reminder emails
  - Automatic meeting creation
- [ ] Booking management
  - Cancel/reschedule options
  - Waitlist functionality

#### 2.3 Website Builder
- [ ] Page builder interface
  - Drag-and-drop page editor
  - Template library
- [ ] Customization
  - Branding (colors, fonts, logo)
  - Custom domain support
  - SEO optimization
- [ ] Lead capture
  - Contact forms
  - Inquiry management
  - Automated follow-up

### Phase 3: Automation & Integration
**Goal**: Reduce manual work through automation

#### 3.1 Workflow Automation
- [ ] Automation builder
  - Visual workflow designer
  - Trigger-based actions
  - Conditional logic
- [ ] Pre-built templates
  - New student onboarding
  - Payment reminders
  - Lesson follow-ups
- [ ] Webhook system
  - Outgoing webhooks for events
  - Incoming webhook handlers

#### 3.2 Third-Party Integrations
- [ ] Zapier integration
  - Connect to 1000+ apps
  - Pre-built Zap templates
- [ ] Accounting software
  - QuickBooks integration
  - Xero integration
  - CSV export for other systems
- [ ] Communication tools
  - Slack notifications
  - Discord integration (if applicable)

### Phase 4: Analytics & Reporting
**Goal**: Provide insights to help tutors grow their business

#### 4.1 Business Analytics
- [ ] Revenue analytics
  - Revenue trends over time
  - Revenue by student/class
  - Projected revenue
- [ ] Student analytics
  - Student retention rates
  - Average lesson frequency
  - Student lifetime value
- [ ] Schedule analytics
  - Utilization rates
  - Peak hours analysis
  - Cancellation rates

#### 4.2 Reporting Dashboard
- [ ] Customizable dashboards
- [ ] Export capabilities (PDF, CSV)
- [ ] Scheduled reports (email delivery)

### Phase 5: AI-Powered Teaching Assistant ⭐ **NEW DIRECTION**
**Goal**: Transform Tutorlytics into an intelligent teaching assistant that automates documentation, communication, and insights from lesson content

#### 5.1 Real-Time Speech-to-Text Transcription System
- [ ] Choose speech-to-text provider
  - Evaluate: OpenAI Whisper API, Deepgram, AssemblyAI, Google Speech-to-Text
  - **Priority**: Real-time streaming capabilities with low latency
  - Consider: Accuracy, cost, latency, WebSocket support
- [ ] Audio recording infrastructure
  - Browser-based audio recording (Web Audio API)
  - Real-time audio streaming to transcription service
  - File upload support for recorded lessons (fallback)
  - Audio storage solution (S3, Cloudflare R2, etc.)
- [ ] Real-time transcription
  - WebSocket connection for live transcription
  - Display transcription in real-time during lessons
  - Low-latency streaming (< 2 second delay)
  - Save transcription segments to database as they arrive
  - Handle connection interruptions gracefully
- [ ] Post-lesson transcription (fallback)
  - Upload audio file after lesson
  - Background processing queue
  - Notification when transcription complete
- [ ] Transcription data model
  - `LessonTranscription` model (meetingId, audioUrl, transcript, timestamps, confidence)
  - Store full transcript and segmented chunks with timestamps
  - Link to meeting/lesson records
  - Support for incremental updates during real-time transcription

#### 5.2 Real-Time AI Teaching Assistant ⭐ **CORE FEATURE**
**Goal**: Provide intelligent, real-time assistance to tutors as they teach, enhancing their explanations with relevant examples, questions, and resources

- [ ] Real-time concept analysis
  - Monitor live transcription for concepts being explained
  - Identify when tutor is explaining a new topic or concept
  - Trigger AI assistance when concept is detected
  - Low-latency processing (< 3 seconds from speech to suggestions)

- [ ] AI-generated examples in real-time
  - When tutor explains a concept, AI suggests relevant examples
  - Examples tailored to student's age/level (from student profile)
  - Multiple example options (simple to complex)
  - One-click insertion or copy-to-clipboard
  - Examples appear in sidebar or overlay during lesson

- [ ] Sample questions generation
  - Generate practice questions based on current topic
  - Questions at appropriate difficulty level
  - Multiple question types (multiple choice, short answer, problem-solving)
  - Questions appear as tutor explains concepts
  - Can be saved to lesson notes or assigned as homework

- [ ] Reference quotes and citations
  - Provide relevant quotes, definitions, or citations
  - Source material appropriate to subject matter
  - Historical context or famous quotes when relevant
  - Links to additional resources or references
  - Age-appropriate content filtering

- [ ] Real-time teaching suggestions
  - Suggest analogies or metaphors for complex concepts
  - Recommend visual aids or diagrams
  - Identify when student might be confused (based on questions/pauses)
  - Suggest alternative explanations or approaches
  - Provide common misconceptions to address

- [ ] Context-aware assistance
  - Consider student's learning history and previous lessons
  - Adapt suggestions based on student's strengths/weaknesses
  - Reference previously covered topics when relevant
  - Suggest connections to other subjects or real-world applications

- [ ] Real-time UI/UX
  - Non-intrusive sidebar or overlay panel
  - Collapsible/expandable AI suggestions panel
  - Visual indicators when AI is processing
  - Keyboard shortcuts for quick actions
  - Mobile-responsive design for tablet/phone use during lessons

- [ ] AI processing optimization
  - Streaming LLM API for low-latency responses
  - Context window management (last 2-3 minutes of conversation)
  - Debouncing to avoid excessive API calls
  - Caching common concept explanations
  - Rate limiting and cost management

- [ ] User controls and preferences
  - Toggle real-time AI assistance on/off
  - Adjust AI suggestion frequency
  - Filter suggestion types (examples only, questions only, etc.)
  - Set AI "personality" (concise vs. detailed suggestions)
  - Privacy controls (process locally vs. cloud)

#### 5.3 Post-Lesson AI Content Generation
- [ ] Choose AI provider
  - Evaluate: OpenAI GPT-4, Anthropic Claude, or similar
  - Consider: Cost, quality, API reliability, rate limits
- [ ] Lesson summary generation
  - Analyze transcription to extract key topics
  - Generate structured lesson summaries
  - Include: topics covered, student progress, areas of difficulty, next steps
  - Allow tutor review and editing before saving
- [ ] Parent communication drafts
  - Generate personalized messages based on lesson content
  - Extract key talking points from transcription
  - Multiple tone options (professional, friendly, detailed, concise)
  - Include student progress highlights and recommendations
  - Draft email/SMS messages ready for review and send
- [ ] Homework and assignment tracking
  - Extract homework assignments mentioned in lesson
  - AI identifies deadlines and due dates from conversation
  - Auto-create homework tasks with deadlines
  - Link homework to student and lesson records
  - Send reminders to students/parents about upcoming deadlines

#### 5.4 AI Insights & Analytics
- [ ] Lesson content analysis
  - Identify topics covered in each lesson
  - Track topic progression over time
  - Detect learning gaps or areas needing attention
- [ ] Student progress insights
  - Analyze conversation patterns
  - Identify improvement areas
  - Generate progress reports
- [ ] Teaching effectiveness metrics
  - Time spent on different topics
  - Student engagement indicators (from conversation)
  - Suggested focus areas for future lessons

#### 5.5 AI Features UI/UX
- [ ] Transcription viewer
  - Display transcriptions with timestamps
  - Search within transcriptions
  - Highlight key moments
  - Export transcriptions
- [ ] AI-generated content review interface
  - Preview AI-generated summaries
  - Edit and refine AI suggestions
  - One-click approval and save
  - Regenerate with different parameters
- [ ] AI settings and preferences
  - Configure AI tone and style
  - Set default preferences for summaries
  - Manage AI usage and costs
  - Privacy controls for transcription data

#### 5.6 Integration with Existing Features
- [ ] Link transcriptions to meetings
  - Auto-associate transcriptions with lesson records
  - Display transcription in meeting detail view
- [ ] Enhance parent communication
  - Use AI drafts in communication system
  - Schedule AI-generated follow-up messages
- [ ] Homework management system
  - Display homework extracted from lessons
  - Calendar integration for deadlines
  - Completion tracking
- [ ] Student profile enrichment
  - Auto-update student notes from lesson insights
  - Track topics covered per student
  - Progress visualization

---

## Technical Architecture

### Current Architecture
- **Monolithic Next.js Application**
  - Server-side rendering (SSR) with App Router
  - API routes for backend functionality
  - Server Actions for form submissions
  - Client components for interactive UI

### Database Considerations

#### Current: SQLite
- **Pros**: Simple setup, no external dependencies, good for development
- **Cons**: Limited scalability, no concurrent writes, not production-ready for multi-user

#### Future: PostgreSQL Migration
- **Priority**: High (before public launch)
- **Benefits**: 
  - Better concurrency handling
  - Production-ready for multi-user
  - Better performance at scale
  - Advanced querying capabilities
- **Migration Plan**:
  1. Update Prisma schema to support PostgreSQL
  2. Create migration scripts
  3. Set up PostgreSQL database (local and production)
  4. Test migration thoroughly
  5. Deploy with zero-downtime strategy

### File Structure Recommendations
```
tutor-tools/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Base UI components (buttons, inputs, etc.)
│   │   ├── forms/             # Form components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── prisma.ts          # Prisma client
│   │   ├── stripe.ts          # Stripe integration
│   │   ├── email.ts           # Email service
│   │   ├── ai/                # AI integrations
│   │   │   ├── transcription.ts  # Speech-to-text service
│   │   │   ├── openai.ts      # OpenAI/LLM service
│   │   │   └── prompts.ts     # AI prompt templates
│   │   └── utils.ts           # Helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

### Component Organization
- **Current**: Components are co-located with pages
- **Recommendation**: Extract reusable components to `src/components/`
- **Pattern**: Feature-based organization with shared UI components

---

## Development Priorities

### Immediate (Next 2-4 weeks)
1. **Complete Billing System**
   - This is a core differentiator and revenue feature
   - High user value
   - Foundation for payment processing

2. **Enhance Calendar Experience**
   - Drag-and-drop interface
   - Recurring lessons
   - Better UX for scheduling

3. **Database Migration Planning**
   - Research PostgreSQL hosting options
   - Plan migration strategy
   - Set up development PostgreSQL instance

### Short-term (1-3 months)
1. **Communication Features**
   - Email notifications
   - Automated reminders
   - Basic messaging

2. **Student Portal MVP**
   - Basic student login
   - View schedule and invoices
   - Simple communication

3. **Self-Booking System**
   - Booking link generation
   - Basic booking flow

### Medium-term (3-6 months)
1. **Website Builder**
   - Page templates
   - Customization options
   - Lead capture

2. **Advanced Analytics**
   - Revenue reporting
   - Student analytics
   - Business insights

3. **Automation System**
   - Workflow builder
   - Template library
   - Webhook support

### Long-term (6+ months)
1. **AI-Powered Teaching Assistant** ⭐ **PRIORITY**
   - **Real-time transcription** with live AI assistance
   - **Real-time teaching support** (examples, questions, quotes as you teach)
   - AI-generated lesson summaries
   - Automated parent communication
   - Homework deadline automation
   - This is the key differentiator and should be prioritized

2. **Mobile App** (if needed)
   - React Native or PWA
   - Push notifications
   - Mobile-optimized experience
   - Audio recording for lessons

3. **Marketplace Features** (if applicable)
   - Tutor discovery
   - Reviews and ratings
   - Commission system

4. **Advanced AI Features**
   - Smart scheduling suggestions
   - Predictive student progress analysis
   - Personalized lesson plan recommendations

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive TypeScript types
- [ ] Implement error boundaries
- [ ] Add loading states consistently
- [ ] Improve error handling and user feedback
- [ ] Add form validation (client and server-side)

### Testing
- [ ] Set up testing framework (Jest + React Testing Library)
- [ ] Write unit tests for utilities
- [ ] Write integration tests for API routes
- [ ] Write E2E tests for critical flows (Playwright/Cypress)

### Performance
- [ ] Optimize database queries (add indexes, use select)
- [ ] Implement caching strategy (Redis or Next.js caching)
- [ ] Optimize images and assets
- [ ] Code splitting and lazy loading
- [ ] Performance monitoring (Vercel Analytics or similar)

### Security
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Implement proper authorization checks
- [ ] Security audit and penetration testing
- [ ] GDPR compliance (data export, deletion)
- [ ] **AI-Specific Security**:
  - [ ] Encrypt audio files at rest and in transit
  - [ ] Implement access controls for transcriptions
  - [ ] Data retention policies for recordings
  - [ ] Compliance with FERPA/COPPA (educational data privacy)
  - [ ] Audit logging for AI-generated content
  - [ ] Secure API key management for AI services

### Documentation
- [ ] API documentation
- [ ] Component documentation (Storybook?)
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] User documentation/help center

---

## Business Considerations

### Pricing Strategy (Future)
- **Free Tier**: Basic features, limited students
- **Pro Tier**: All features, unlimited students, priority support
- **Enterprise**: Custom features, dedicated support, SSO

### Monetization
- Subscription-based model
- Transaction fees (optional for payment processing)
- Premium features (advanced analytics, custom branding)

### Growth Strategy
- **MVP Launch**: Focus on core features
- **Beta Testing**: Invite select tutors for feedback
- **Marketing**: Content marketing, SEO, partnerships
- **Referral Program**: Incentivize user referrals

---

## Success Metrics

### User Engagement
- Daily/Monthly Active Users (DAU/MAU)
- Session duration
- Feature adoption rates
- User retention (30-day, 90-day)

### Business Metrics
- Revenue per user
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Churn rate

### Product Metrics
- Time to first value (TTFV)
- Feature usage rates
- Support ticket volume
- User satisfaction (NPS)

---

## Risk Management

### Technical Risks
- **Database Scalability**: Mitigate with PostgreSQL migration
- **Third-party Dependencies**: Have backup options (e.g., multiple payment providers)
- **Data Loss**: Implement regular backups and disaster recovery
- **AI Service Reliability**: 
  - API rate limits and downtime
  - Cost overruns from high usage
  - Mitigation: Implement fallback providers, usage monitoring, cost caps
- **Audio/Transcription Privacy**: 
  - Sensitive student data in recordings
  - Compliance with FERPA, COPPA, GDPR
  - Mitigation: Encryption, access controls, data retention policies
- **AI Accuracy**: 
  - Transcription errors affecting summaries
  - Mitigation: Human review step, confidence scores, edit capabilities

### Business Risks
- **Market Competition**: Focus on unique features and superior UX
- **User Acquisition**: Build strong referral program and content marketing
- **Feature Bloat**: Maintain focus on core value proposition

---

## Notes & Decisions

### Decisions Pending
- PostgreSQL hosting provider (Vercel Postgres, Supabase, Railway, etc.)
- Payment processor (Stripe is planned, but not implemented)
- Email service provider (SendGrid, Resend, AWS SES, etc.)
- SMS provider (if implementing SMS features)
- Hosting platform (Vercel, AWS, etc.)
- **AI/LLM Provider**: OpenAI, Anthropic Claude, or other (for content generation)
- **Speech-to-Text Provider**: OpenAI Whisper, Deepgram, AssemblyAI, Google Speech-to-Text
- **Audio Storage**: AWS S3, Cloudflare R2, or similar (for lesson recordings)
- **Background Job Processing**: Vercel Cron, BullMQ, or similar (for transcription processing)

### Open Questions
- Should tutors be able to have multiple locations?
- Group lessons vs. individual only?
- Video call integration (Zoom, Google Meet)?
- **AI Questions**:
  - Real-time transcription vs. post-processing only? **Answer: Both - real-time is core feature**
  - Should transcriptions be editable by tutors? **Yes, for accuracy**
  - Privacy: How to handle sensitive student information in AI processing?
  - Cost model: How to manage AI API costs (pass to users, include in subscription)?
  - Offline support: Can we cache AI responses or work offline?
  - Multi-language transcription support?
  - **Real-time AI latency**: What's acceptable delay for suggestions? (Target: < 3 seconds)
  - **Real-time AI frequency**: How often should AI suggest examples/questions? (Configurable)
  - Should real-time AI suggestions be saved to lesson notes automatically?

---

## Resources & References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Inspiration & Competitors
- TutorCruncher
- Teachworks
- SimplyBook.me
- Calendly (for booking features)

### AI/ML Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Whisper (Speech-to-Text)](https://platform.openai.com/docs/guides/speech-to-text)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Deepgram Speech-to-Text](https://developers.deepgram.com/)
- [AssemblyAI](https://www.assemblyai.com/docs)

---

## AI-Powered Teaching Assistant: Detailed Planning

### Core Value Proposition
Transform every lesson with **real-time AI assistance** that enhances teaching in the moment, then automatically generates insights and communication. Reduce administrative burden by 80% while improving teaching effectiveness, parent engagement, and student outcomes.

**Key Differentiator**: Unlike other platforms that only analyze lessons after they're done, Tutorlytics provides intelligent, real-time assistance as you teach—suggesting examples, questions, and resources exactly when you need them.

### User Workflow (AI-Enhanced)
1. **During Lesson** (Real-Time AI Assistance):
   - Tutor starts lesson and enables real-time transcription
   - **As tutor explains concepts**: AI analyzes speech in real-time
   - **AI provides instant suggestions**:
     - Relevant examples tailored to the topic and student level
     - Sample questions for practice or assessment
     - Reference quotes, definitions, or citations
     - Teaching suggestions (analogies, visual aids, alternative explanations)
   - Tutor can view suggestions in sidebar and use them immediately
   - AI captures conversation, identifies topics, notes homework assignments
   
2. **After Lesson**:
   - AI processes transcription automatically
   - Generates lesson summary with key points
   - Extracts homework assignments and deadlines
   - Creates draft parent communication message
   
3. **Tutor Review**:
   - Review and edit AI-generated summary
   - Approve or modify parent message
   - Verify homework deadlines
   - One-click send to parents
   
4. **Automated Follow-up**:
   - Homework deadline reminders
   - Progress updates based on lesson patterns
   - Suggested focus areas for next lesson

#### API Integration Strategy
- **Speech-to-Text**: 
  - **Real-time**: Use streaming WebSocket API (Deepgram, AssemblyAI, or OpenAI Whisper streaming)
  - **Post-processing**: Batch API for uploaded recordings
  - Low-latency requirements (< 2 seconds for real-time)
- **LLM for Real-Time Assistance**:
  - **Streaming chat completions** for low-latency responses
  - **Context window**: Last 2-3 minutes of conversation
  - **Prompt engineering**: Optimize for speed and relevance
  - **Response format**: Structured JSON for easy parsing
- **LLM for Post-Lesson Processing**:
  - Standard chat completions API with structured prompts
  - Can use more powerful models (GPT-4, Claude) for deeper analysis
- **Cost Management**: 
  - Cache common concept explanations and examples
  - Debounce real-time requests to avoid excessive API calls
  - Batch processing where possible for post-lesson features
  - User-configurable quality vs. cost settings
  - Usage tracking and limits per user/subscription tier
  - Consider local models for common requests (future optimization)

#### Privacy & Compliance
- **Data Minimization**: Only process necessary audio segments
- **Consent**: Clear opt-in for transcription features
- **Retention**: Configurable retention periods, auto-delete old recordings
- **Access Control**: Only tutor and authorized parents can access transcriptions
- **Encryption**: End-to-end encryption for audio files
- **Compliance**: FERPA, COPPA, GDPR compliance for educational data

---

## Changelog

### 2025-01-XX
- Initial project direction document created
- Documented current state and planned features
- Established development roadmap
- **Added AI-Powered Teaching Assistant direction**:
  - Real-time speech-to-text transcription system
  - **Real-time AI teaching assistance** (examples, questions, quotes during lessons)
  - AI-generated lesson summaries
  - Automated parent communication
  - Homework deadline automation
  - Comprehensive AI feature planning

---

**Last Updated**: [Date]
**Document Owner**: [Name/Team]
**Review Frequency**: Monthly
