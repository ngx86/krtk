# Micro-Mentorship Platform

## Overview
A platform connecting designers with mentors for quick, focused feedback sessions.

## Core Features
- User authentication with Supabase
- Credit-based feedback system
- Real-time notifications
- Mentor/mentee dashboards

## Database Schema

### Users Table
```sql
users (
  id: string,
  email: string,
  role: 'mentee' | 'mentor',
  credits: number,
  name: string?,
  bio: string?,
  avatar_url: string?,
  rating: number,
  review_count: number,
  expertise: string[],
  languages: string[],
  portfolio_url: string?,
  price_per_feedback: number?,
  created_at: string
)
```

### Feedback Requests Table
```sql
feedback_requests (
  id: number,
  mentee_id: string,
  mentor_id: string?,
  description: string,
  link: string,
  status: 'pending' | 'accepted' | 'completed' | 'declined',
  urgency: 'low' | 'medium' | 'high',
  credits_cost: number,
  feedback: string?,
  created_at: string,
  updated_at: string
)
```

### Notifications Table
```sql
notifications (
  id: number,
  user_id: string,
  message: string,
  type: 'feedback' | 'credits' | 'system',
  read: boolean,
  created_at: string
)
```

## Component Structure

### Core Components
1. `MentorDashboard.tsx`
   - Display pending feedback requests
   - Show earnings and completed reviews
   - Set price per feedback
   - Accept/decline requests

2. `MenteeDashboard.tsx`
   - Show available credits
   - Display active and completed requests
   - Request new feedback

3. `FeedbackRequest.tsx`
   - Submit new feedback requests
   - Set urgency level
   - Specify design details

4. `NotificationsPage.tsx`
   - List all notifications
   - Mark as read functionality
   - Sort by date

### Authentication
- Supabase Auth UI for sign-in/sign-up
- Role-based access control
- Protected routes

### State Management
- React Context for app state
- Real-time updates with Supabase subscriptions
- Optimistic updates for better UX

## Development

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with Supabase credentials
4. Run development server: `npm run dev`

### Deployment
1. Push changes to GitHub
2. Vercel will automatically deploy from the main branch
3. Environment variables must be set in Vercel dashboard

## Tech Stack
- React + TypeScript
- Vite
- Supabase
- shadcn/ui
- TailwindCSS

## Next Steps: Integrating Credits, Feedback, and Notifications

This section outlines the steps to integrate logic for credits, feedback, and notifications into the micro-mentorship app, ensuring a seamless connection between components.

---

### 1. Credits System

#### Overview
The credits system should handle:
- Assigning credits to mentees after purchase.
- Deducting credits for feedback requests.
- Rewarding mentors with credits or monetary value for completed feedback.

#### Steps
1. **CreditsPage.tsx**
   - **Functionality**:
     - Display the mentee's current balance.
     - Fetch credit history (e.g., purchases, deductions) via API.
   - **Actions**:
     - Create a `fetchCredits` function to retrieve credit balance from the database.
     - Add a `deductCredits` function triggered when mentees submit feedback requests.

2. **RequestFeedbackPage.tsx**
   - **Functionality**:
     - Validate and deduct credits when mentees submit a request.
     - Store requests and link them to mentors.
   - **Actions**:
     - Use `getCredits` to check credit balance and `deductCredits` to deduct credits.

3. **EarningsPage.tsx**
   - **Functionality**:
     - Display mentor earnings (pending and completed).
   - **Actions**:
     - Fetch earnings with a `fetchEarnings` call.
     - Add a `withdrawEarnings` function for payouts.

---

### 2. Feedback Management

#### Overview
The feedback system handles:
- Submission and management of feedback requests.
- Notifications for new requests and completion.
- Tracking feedback status and history.

#### Steps
1. **FeedbackRequest.tsx**
   - **Functionality**:
     - Display request details (e.g., credits offered, deadline).
     - Allow mentors to accept or decline requests.
   - **Actions**:
     - Add `acceptFeedbackRequest` and `declineFeedbackRequest` API calls.

2. **FeedbackHistoryPage.tsx**
   - **Functionality**:
     - Show mentee feedback history with status and mentor ratings.
   - **Actions**:
     - Fetch history with a `getFeedbackHistory` API call.
     - Add a `rateMentor` function.

3. **MentorDashboard.tsx**
   - **Functionality**:
     - Display pending feedback requests for mentors.
   - **Actions**:
     - Fetch requests with `getPendingRequests`.

---

### 3. Notifications

#### Overview
Notifications keep users informed about:
- New feedback requests.
- Feedback completion.
- Credit updates.

#### Steps
1. **NotificationsPage.tsx**
   - **Functionality**:
     - Display a list of notifications for users.
   - **Actions**:
     - Fetch notifications with `getNotifications`.
     - Add read/unread tracking.

2. **Header.tsx**
   - **Functionality**:
     - Add a notifications icon with an unread badge.
   - **Actions**:
     - Display unread count and recent notifications in a dropdown.

3. **MentorDashboard.tsx and MenteeDashboard.tsx**
   - **Functionality**:
     - Push notifications to dashboards for updates (e.g., "New request received").
   - **Actions**:
     - Implement real-time notifications using WebSockets or polling.

---

### 4. Database and Backend Integration

Ensure the following APIs are implemented:
1. **Credits APIs**:
   - `POST /credits/deduct` – Deduct credits.
   - `GET /credits/balance` – Fetch credit balance.
   - `POST /credits/reward` – Reward mentors.

2. **Feedback APIs**:
   - `POST /feedback/submit` – Submit requests.
   - `GET /feedback/pending` – Retrieve pending requests.
   - `POST /feedback/complete` – Mark feedback as completed.

3. **Notifications APIs**:
   - `GET /notifications` – Fetch notifications.
   - `POST /notifications/read` – Mark notifications as read.

---

### 5. Testing and Validation

1. **Credits System**:
   - Test credit deductions, rewards, and balances.
2. **Feedback System**:
   - Verify mentors receive requests promptly.
3. **Notifications**:
   - Test delivery and marking as read.

---

### 6. Next Steps for the Developer

1. **Prioritize API Integration**:
   - Set up endpoints for credits, feedback, and notifications.
2. **Connect Frontend to APIs**:
   - Update components to interact with APIs.
3. **Implement Real-Time Notifications**:
   - Use WebSockets or polling for urgent updates.
4. **Enhance the UI**:
   - Add urgency indicators, credit balances, and notifications.

---

### Optional Enhancements
1. **Urgent Feedback Requests**:
   - Charge extra credits for urgent requests.
2. **Mentor Availability**:
   - Allow mentors to set availability for urgent requests.
3. **Feedback Ratings**:
   - Enable mentees to rate mentors post-feedback.
