# PalTech Mentorship Application

An enterprise-grade, privacy-first SaaS platform built for managing mentorship pairings, tracking progress via KRAs/KPIs, logging 1:1 sessions, and facilitating continuous feedback.

Built with the **MERN Stack** (MongoDB Atlas, Express, React, Node.js) and modernized with **Tailwind CSS v4** for a premium user experience.

---

## 🌟 Key Features & Requirements Satisfied

This application strictly adheres to the 20 Acceptance Criteria outlined in the project reference document:

### Authentication & Core Flows (AC1 - AC4)
- Secure, token-based authentication (JWT) with bcrypt password hashing.
- Unauthenticated users are strictly rejected and redirected to the login portal.
- Users can create unique Mentor/Mentee pairings (preventing self-pairing).
- Pairings dynamically appear on both the Mentor and Mentee dashboards.

### Strict Role-Based Access Control & Observers (AC5, AC6, AC16, AC17)
- **Three distinct roles:** Mentor, Mentee, and Observer.
- Observers can be invited to view a pairing but are strictly restricted from creating or editing any content.
- Authenticated users cannot access or view pairings they are not explicitly a part of (enforced at the API level via custom middleware).
- Observers can be easily added and removed by the participants.

### 1:1 Sessions & Dynamic Visibility (AC7 - AC9)
- Mentors and Mentees can log and fully edit 1:1 sessions (Date, Agenda, Notes).
- Action Items can be dynamically created, assigned to specific owners, and tracked (Open, In Progress, Done).
- **Privacy Engine:** Sessions marked as "Pair only" are completely invisible to Observers. Sessions marked "Pair + Observers" are visible to all authorized parties.

### Continuous Feedback System (AC10 - AC12)
- Asynchronous messaging interface for Mentors and Mentees to exchange feedback.
- Like 1:1 sessions, feedback has its own independent visibility toggle ("Pair only" vs "Pair + Observers").
- Feedback visibility is permanently locked upon creation, but authors retain the right to delete their own feedback.

### KRA & KPI Tracking (AC13 - AC15)
- Participants can define high-level Key Result Areas (KRAs) and nest measurable Key Performance Indicators (KPIs) beneath them.
- KPIs feature a dynamic, mathematically accurate visual progress bar.
- Every update to a KPI logs a timestamped historical audit record (capturing the old value, new value, status shift, author, and notes).
- KRAs, KPIs, and their history are universally visible to all pairing participants (including Observers) to allow high-level progress tracking.

### System-Wide Integrity (AC18 - AC20)
- Pairings can be Paused or permanently Ended. Ended pairings become strictly read-only, freezing all data.
- The UI gracefully handles long data lists using pagination, sorting (e.g., Oldest vs Newest), and complex filtering (e.g., "Open Action Items Only").
- 100% data persistence is guaranteed via MongoDB Atlas.

---

## 💻 Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4 (Modern Utility-First Styling)
- React Router DOM (Client-Side Routing)
- Axios (HTTP Client)
- Lucide React (Premium Iconography)
- React Hot Toast (Non-intrusive notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose ODM
- JSON Web Tokens (JWT) & bcryptjs (Security)
- Express Validator (Input Sanitization)

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string (or local MongoDB instance)

### 1. Clone & Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `/backend` directory and add the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Run the Application
You will need two terminal windows running simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```
*(You should see "Server running on port 5000" and "Connected to MongoDB Atlas")*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5174` in your browser.

---

## 🧪 Testing the Application

A dedicated **`test_plan.md`** file is included in the project documentation. It provides highly specific, step-by-step manual test cases to verify that all 20 Acceptance Criteria (including negative paths and role-based restrictions) function exactly as intended. 

**Quick Start Test:**
1. Register `mentor@example.com` and `mentee@example.com`.
2. As the mentor, create a pairing with the mentee.
3. Open the pairing and define a KRA ("Improve Frontend").
4. Add a KPI ("Complete 5 tutorials", target: 5).
5. Click "Log Update", change current value to "2". Watch the visual progress bar calculate the completion!

---
*Developed for the PalTech Hackathon.*
