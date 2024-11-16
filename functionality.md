
# Micro-Mentorship Platform - Functionality Document

## Core Functionalities

### 1. User Authentication
- **Description**: Allows users (mentees and mentors) to sign up, log in, and manage their accounts.
- **Key Features**:
  - Email/password authentication.
  - Role-based access control (mentee/mentor).
- **Integration**: Supabase Auth API.

### 2. Credit System
- **Description**: Enables mentees to purchase and use credits for feedback requests.
- **Key Features**:
  - Purchase credits via Stripe.
  - Deduct credits automatically when a feedback request is submitted.
  - Display remaining credits on the user dashboard.
- **Integration**: Supabase database and Stripe payment processing.

### 3. Feedback Requests
- **Description**: Allows mentees to submit designs for feedback and mentors to respond.
- **Key Features**:
  - File upload or external link submission.
  - Text input for questions/context.
  - Feedback queue for mentors.
  - Text-based feedback response.
- **Integration**: Supabase database for request storage.

### 4. Mentor Ratings
- **Description**: Enables mentees to rate mentors after receiving feedback.
- **Key Features**:
  - Rating system (1-5 stars).
  - Optional text-based comments.
- **Integration**: Supabase database for storing ratings.

### 5. Payments and Payouts
- **Description**: Handles credit purchases by mentees and payouts to mentors.
- **Key Features**:
  - Stripe integration for credit purchases.
  - Mentor payouts via Stripe Connect.
  - Minimum earnings threshold for payouts.

### 6. User Dashboard
- **Description**: Displays essential information and actions for mentees and mentors.
- **Key Features**:
  - Mentees:
    - Remaining credits.
    - Feedback request history.
    - "Request Feedback" button.
  - Mentors:
    - Pending requests queue.
    - Total credits earned.
    - Payout history.

---

## Deferred Functionalities
- Real-time notifications for session updates.
- Multimedia feedback support (voice recordings, annotations).
- Advanced analytics for user behavior.

