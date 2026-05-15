# Status Tracker

## Current Phase: Phase 1 (Ready to Begin)

### Implementation Progress

- [x] **Phase 1**: Project Setup & User Auth
- [x] **Phase 2**: Core Mentorship Pairings & RBAC Middleware
- [x] **Phase 3**: 1:1 Sessions & Action Items
- [x] **Phase 4**: Feedback System
- [x] **Phase 5**: KRAs, KPIs, and Updates
- [x] **Phase 6**: Frontend Integration

### Business Requirements Checklist

- [x] **BR1**: Capture and operate mentor-mentee relationships.
- [x] **BR2**: Log 1:1 meetings (agenda, notes, action items).
- [x] **BR3**: Exchange feedback with privacy controls.
- [x] **BR4**: Support third-party observers with scoped visibility.
- [x] **BR5**: Allow KRAs and KPIs to be defined per pairing.
- [x] **BR6**: Track KPI progress over time.
- [x] **BR7**: Scoped view for each role (mentor, mentee, observer).
- [x] **BR8**: Authenticate and enforce authorization on reads/writes.
- [x] **BR9**: Persist all data reliably.

### Functional Requirements Checklist

**Authentication & Authorization**
- [x] **FR1**: Register account (name, email, password).
- [x] **FR2**: Sign in (email, password).
- [x] **FR3**: Sign out.
- [x] **FR4**: Screens/data accessible only to authenticated users.
- [x] **FR5**: Passwords stored hashed (bcrypt/argon2/scrypt).
- [x] **FR6**: Authorize every read/write based on role and visibility.
- [x] **FR7**: Authorization checks apply to all list/detail/search paths.

**Mentorship Pairings & Observers**
- [x] **FR8**: Create pairing (mentor and mentee).
- [x] **FR9**: Pairing captures mentor, mentee, dates, status, created-by/at.
- [x] **FR10**: Pause or end pairing. Ended is read-only.
- [x] **FR11**: View list of all participating pairings indicating role.
- [x] **FR12**: Mentor and mentee cannot be the same person.
- [x] **FR13**: Add observers to a pairing.
- [x] **FR14**: Observers are read-only for 1:1s, feedback, KRAs/KPIs.
- [x] **FR15**: Remove observer at any time.

**1:1 Sessions**
- [x] **FR16**: Log 1:1 session (date, agenda, notes, action items).
- [x] **FR17**: Action item captures description, owner, status, optional due date.
- [x] **FR18**: Both participants can edit 1:1s and action items.
- [x] **FR19**: Visibility: "Pair only" or "Pair + Observers". Can be changed later.

**Feedback**
- [x] **FR20**: Give feedback to the other participant.
- [x] **FR21**: Visibility is "Pair only" or "Pair + Observers".
- [x] **FR22**: Visibility locked at creation.
- [x] **FR23**: Only author may delete feedback. Edits not supported.

**KRAs and KPIs**
- [x] **FR24**: Define KRAs (title, description).
- [x] **FR25**: Add KPIs to KRAs (title, target, current, status, due date).
- [x] **FR26**: Update KPI current value/status. Preserve history.
- [x] **FR27**: KRAs, KPIs, and history visible to participants and observers.

**Listing & Pagination**
- [x] **FR28**: Filter pairings by status and role.
- [x] **FR29**: Sort 1:1s by date, filter by open action items.
- [x] **FR30**: Sort feedback by date, filter by direction.
- [x] **FR31**: Paginate long lists (1:1s, feedback, KPI updates).
- [x] **FR32**: Data persistence.

**Validation**
- [x] **FR33**: Required fields validated and rejected with messages.
- [x] **FR34**: Syntactically valid and unique email addresses.
- [x] **FR35**: Prevent same person as mentor and mentee.

### Acceptance Criteria Checklist

- [x] **AC1**: New user can register, sign out, and sign back in. Passwords hashed.
- [x] **AC2**: Unauthenticated visitors redirected/rejected.
- [x] **AC3**: User can create a pairing (mentor/mentee). Appears in both lists.
- [x] **AC4**: Prevent pairing if mentor and mentee are the same.
- [x] **AC5**: Add observer to pairing. Appears in observer's list.
- [x] **AC6**: Remove observer. Removed from list.
- [x] **AC7**: Log and edit 1:1 sessions (date, agenda, notes, action items).
- [x] **AC8**: Reassign and update status of action items.
- [x] **AC9**: "Pair only" 1:1s hidden from observers. "Pair + Observers" visible.
- [x] **AC10**: Give feedback with chosen visibility.
- [x] **AC11**: "Pair only" feedback hidden from observers. "Pair + Observers" visible.
- [x] **AC12**: Feedback visibility locked. Author can delete.
- [x] **AC13**: Create KRA and KPIs (target, current, status).
- [x] **AC14**: KPI updates recorded with history.
- [x] **AC15**: KRAs, KPIs, and history visible to participants AND observers.
- [x] **AC16**: Observers cannot create/edit content. API rejects attempts.
- [x] **AC17**: Authenticated users blocked from unrelated pairings.
- [x] **AC18**: Pause/End pairings. Ended pairings are read-only.
- [x] **AC19**: Long lists support filtering, sorting, pagination.
- [x] **AC20**: All data persists across restarts.

### Log
- **[2026-05-15]**: Initialized implementation plan and status tracker with full BR, FR, and AC lists. Ready for Phase 1.
