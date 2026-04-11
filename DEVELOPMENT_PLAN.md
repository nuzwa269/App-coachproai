# CoachPro AI - Development Plan

This document outlines the step-by-step implementation plan for CoachPro AI, starting from the completed MVP foundation and extending toward a scalable, production-ready platform.

Update the checkboxes `[ ]` to `[x]` as you complete each task to track progress.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Engine:** Vercel AI SDK + OpenAI API / Anthropic Claude
- **Payments:** Credit Pack system (JazzCash, Easypaisa, Bank Transfer, WhatsApp)
- **Hosting:** Vercel

---

## 📅 Week 1: Foundation & Database
**Goal:** Users can log in and create projects.

- [x] Initialize Next.js project and push to repository.
- [x] Setup Tailwind CSS and Shadcn UI.
- [x] Setup Supabase project (Database & Auth).
- [x] Create core database tables (`Users`, `Projects`, `SavedOutputs`).
- [x] Implement Authentication (Email/Password & Google OAuth).
- [x] Setup protected routes (Dashboard is only accessible to logged-in users).

---

## 📅 Week 2: UI/UX & Workspace
**Goal:** Build the shell, navigation, and project management flow.

- [x] Build Dashboard Shell (Sidebar, Top nav).
- [x] Create "Recent Projects" view.
- [x] Build Assistants Grid (Programming Tutor, DB Expert, etc.).
- [x] Build Project Workspace (Notion-style tabs: Overview, DB, API, Docs).
- [x] Implement CRUD for Projects (Create, Read, Update, Delete).

---

## 📅 Week 3: Core AI Engine
**Goal:** Make the AI chat functional and context-aware.

- [x] Build Chat Interface using Vercel AI SDK (`useChat`).
- [x] Implement Context Injection (pass Project details into AI System Prompt).
- [x] Build the "Save to Workspace" button on AI responses.
- [x] Save AI outputs to specific project tabs in the database.

---

## 📅 Week 4: Monetization & Polish
**Goal:** Implement the credit pack system, enforce usage limits, and complete the current MVP monetization flow.

- [x] Add `ai_credits_balance` to profiles, create `credit_packs`, `credit_purchases`, `credit_ledger` tables.
- [x] Create `deduct_credit` and `add_credits` Supabase RPC functions.
- [x] Enforce credit check in `/api/chat` route.
- [x] Build Buy Credits page with JazzCash / Easypaisa / Bank / WhatsApp payment instructions.
- [x] Build credit purchase submission flow with payment proof.
- [x] Build admin approval panel for credit purchases.
- [x] Add credit balance display to sidebar.
- [x] Build Global "Saved Outputs" page across all projects.
- [ ] Final QA, bug fixes, and connect custom domain (`app.coachproai.com`).

---

# Extended Production Roadmap

This roadmap takes CoachPro AI from a working MVP to a scalable, maintainable, and production-ready system.

---

## 📅 Phase 1: Access, Roles & Account Types Foundation
**Goal:** Define a clean and scalable structure for free users, subscribers, admins, and super admins.

### Includes
- [ ] Add `profiles.role` with values: `user | admin | super_admin`
- [ ] Add `profiles.account_type` with values: `free | subscriber`
- [ ] Keep temporary legacy `ADMIN_EMAIL` fallback for safe migration
- [ ] Add admin route guards for `/admin/*`
- [ ] Add secure server-side admin authorization for admin APIs
- [ ] Apply only minimal RLS updates where admin access is required
- [ ] Backfill the existing admin user into the new role system
- [ ] Define subscriber state handling for users who purchase credits

### Business Rules
- **User:** Free app user with starter credits
- **Subscriber:** Paid user who buys credits and uses AI features
- **Admin:** Manages the application and admin panel
- **Super Admin:** Full system control

---

## 📅 Phase 2: Minimal Admin Operations
**Goal:** Enable essential admin operations without overbuilding the admin panel.

### Includes
- [ ] Build `/admin` overview page for users, credits, and recent activity
- [ ] Build `/admin/users` page to list all accounts
- [ ] Show account type (`free` / `subscriber`) on `/admin/users`
- [ ] Show current credit balance on `/admin/users`
- [ ] Allow admin role assignment and removal on `/admin/users`
- [ ] Enhance `/admin/payments` for approve / reject purchase flow
- [ ] Add basic admin audit logging for critical actions only

### Notes
- `/admin/users` is **admin-only**
- Free users and subscribers must **not** have access to admin pages

---

## 📅 Phase 3: Credit System, Billing & Entitlements
**Goal:** Strengthen the credit-based monetization system and subscriber logic.

### Includes
- [ ] Refine credit pack system and validation rules
- [ ] Harden `credit_purchases` workflow
- [ ] Add clear purchase state machine: `pending → approved → rejected`
- [ ] Add integrity checks for `credit_ledger`
- [ ] Automatically upgrade `account_type` from `free` to `subscriber` after approved paid purchase
- [ ] Define entitlement rules for free users vs subscribers
- [ ] Add misuse / duplicate submission protection
- [ ] Improve payment proof validation and admin review flow

---

## 📅 Phase 4: AI Assistants & Configuration Layer
**Goal:** Move assistant logic from hardcoded config into a database-driven system.

### Includes
- [ ] Create `ai_assistants` table
- [ ] Store assistant personas in the database
- [ ] Add active / inactive assistant controls
- [ ] Add assistant categories / tags
- [ ] Add per-assistant prompt configuration
- [ ] Add free vs subscriber assistant access rules
- [ ] Replace hardcoded assistant definitions with DB-driven records

---

## 📅 Phase 5: Multi-AI Provider Support
**Goal:** Support multiple AI providers and model-specific usage rules.

### Includes
- [ ] Add provider support for OpenAI, Gemini, Grok, and Anthropic
- [ ] Create provider/model factory abstraction
- [ ] Add per-assistant model selection
- [ ] Add fallback model strategy
- [ ] Add retry and timeout handling
- [ ] Add environment validation for provider API keys
- [ ] Create pricing rules for different AI models
- [ ] Support different credit costs per AI model

### Example Direction
- Cheaper models can consume fewer credits
- More advanced models can consume more credits

---

## 📅 Phase 6: Admin Content & Knowledge Management
**Goal:** Allow admins to manage assistants, templates, and shared AI knowledge.

### Includes
- [ ] Build `/admin/assistants`
- [ ] Build `/admin/templates`
- [ ] Build `/admin/knowledge`
- [ ] Add shared template management
- [ ] Add knowledge document upload and management
- [ ] Add context injection controls for admin-managed knowledge

---

## 📅 Phase 7: User Experience & Product Features
**Goal:** Improve the subscriber and end-user experience.

### Includes
- [ ] Add user settings page
- [ ] Add preferred AI/model selection
- [ ] Add credits/subscription summary page
- [ ] Improve onboarding flow
- [ ] Improve saved outputs experience
- [ ] Add project templates for users
- [ ] Add generation tools (roadmap, schema, blueprint, etc.)
- [ ] Improve empty states and error recovery states

---

## 📅 Phase 8: Analytics, Audit Logs & Reporting
**Goal:** Add visibility into platform usage, credits, payments, and admin activity.

### Includes
- [ ] Build admin analytics dashboard
- [ ] Add credit usage metrics
- [ ] Add subscriber growth metrics
- [ ] Add revenue tracking
- [ ] Add assistant popularity insights
- [ ] Expand audit logs for admin and system actions
- [ ] Add exportable reports

---

## 📅 Phase 9: Security & Production Hardening
**Goal:** Make the system secure and reliable for production use.

### Includes
- [ ] Perform full RLS audit
- [ ] Audit all admin and user API authorization
- [ ] Add stronger input validation
- [ ] Add rate limiting
- [ ] Validate all required environment variables
- [ ] Improve auth/session handling
- [ ] Improve file upload and payment proof safety
- [ ] Add error boundaries and secure failure handling

---

## 📅 Phase 10: QA, Reliability & Release Operations
**Goal:** Ensure safe deployments, reliable migrations, and stable production releases.

### Includes
- [ ] Add Vercel preview deployment checklist
- [ ] Add migration safety checklist
- [ ] Add rollback strategy for production changes
- [ ] Add smoke testing for critical flows
- [ ] Add monitoring and alerts
- [ ] Add admin bootstrap/setup scripts
- [ ] Add release notes / deployment process documentation
- [ ] Add incident response and recovery notes

---

## 📋 Suggested Delivery Order

- **Week 5:** Phase 1 — Access, Roles & Account Types Foundation
- **Week 6:** Phase 2 — Minimal Admin Operations
- **Week 7:** Phase 3 — Credit System, Billing & Entitlements
- **Week 8:** Phase 4 — AI Assistants & Configuration Layer
- **Week 9:** Phase 5 — Multi-AI Provider Support
- **Week 10:** Phase 6 — Admin Content & Knowledge Management
- **Week 11:** Phase 7 — User Experience & Product Features
- **Week 12:** Phase 8 — Analytics, Audit Logs & Reporting
- **Week 13:** Phase 9 — Security & Production Hardening
- **Week 14:** Phase 10 — QA, Reliability & Release Operations

---

## ✅ Core Planning Principles

- **Roles and billing are different things**
  - `role` controls admin/system access
  - `account_type` controls free vs paid user status

- **Subscribers are not admins**
  - Subscriber means a paid credit-based user
  - Admin means someone who manages the app

- **Credits are the core economy**
  - Users buy credit packs
  - Different AI models can consume different credit amounts

- **Admin pages are private**
  - `/admin/*` routes are only for `admin` and `super_admin`

- **Build in layers**
  - Foundation → Admin → Billing → AI → Scaling → Hardening
