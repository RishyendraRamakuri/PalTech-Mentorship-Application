# Mentorship Application Implementation Plan

## Architectural Decisions
- **Stack**: MERN (MongoDB, Express, React, Node.js)
- **Auth**: Custom JWT with `bcrypt` for password hashing.
- **Database**: MongoDB Atlas with Mongoose. Using reference-based schemas (e.g., separate collection for KPI Updates for pagination support).
- **Security/Privacy**: Strict Role-Based Access Control (RBAC). A custom Express middleware will enforce visibility rules for Mentor, Mentee, and Observer roles on a per-pairing basis.

## Phase 1: Project Setup & Authentication
- Initialize Node.js/Express backend and React frontend.
- Setup MongoDB Atlas connection via URI.
- Create `User` schema (name, email, password hash).
- Implement Auth endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` (if token blacklisting/cookie clearing is used).
- Validate syntax of email and ensure uniqueness.

## Phase 2: Core Pairings & Authorization Middleware
- Create `Pairing` schema (mentorId, menteeId, observers array, status, dates).
- Implement custom Authorization Middleware:
  - Intercept requests with `:pairingId`.
  - Resolve the requesting user's role on the pairing (Mentor, Mentee, Observer, or None).
  - Enforce permission checks (e.g., block "None", block "Observer" from writes).
- Implement Pairing APIs:
  - Create pairing (validate mentor != mentee).
  - Add/remove observers (Mentor/Mentee only).
  - Update pairing status (Pause/Resume/End).
  - List pairings (filter by status and role).

## Phase 3: 1:1 Sessions & Action Items
- Create `OneOnOne` schema (pairingId, date, agenda, notes, visibility).
- Create `ActionItem` schema/subdocument (description, owner, status, due date).
- Implement 1:1 APIs:
  - Create/Edit 1:1 session (participants only).
  - Update Action Item status/owner.
  - List 1:1s (sort by date, filter by open action items, paginated).
- **Privacy check**: Ensure "Pair only" 1:1s are stripped from API responses if the requester is an Observer.

## Phase 4: Feedback System
- Create `Feedback` schema (pairingId, from, to, body, visibility).
- Implement Feedback APIs:
  - Create feedback (require visibility at creation).
  - Delete feedback (author only).
  - List feedback (sort by date, filter by direction, paginated).
- **Privacy check**: Ensure visibility is locked at creation and "Pair only" feedback is hidden from Observers.

## Phase 5: KRAs, KPIs, and Updates
- Create `KRA` schema (pairingId, title, description).
- Create `KPI` schema (kraId, title, target, current_value, status, due_date).
- Create `KPIUpdate` collection (kpiId, previous_value, new_value, status, note, author). *Separate collection ensures robust pagination.*
- Implement KRA/KPI APIs:
  - Create KRAs and KPIs (participants only).
  - Log KPI updates (participants only).
  - View KRAs, KPIs, and paginated update history (Visible to Pair + Observers).

## Phase 6: Frontend Application Build
- Setup routing (Sign In, Register, Dashboard, Pairing Details).
- Implement Authentication context and private routes.
- Build Dashboard to list pairings (with filters).
- Build Pairing Details page with tabs: 1:1s, Feedback, KRAs/KPIs.
- Implement forms/modals for data entry.
- Ensure UI respects roles (e.g., hide "Edit" buttons for observers).
