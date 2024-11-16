# Micro-Mentorship Platform

A platform connecting designers with experienced mentors for quick, actionable feedback.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd micro-mentorship
```

2. Install dependencies:
```bash
npm install
```

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
