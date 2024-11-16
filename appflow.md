
# Micro-Mentorship Platform - App Flow Document

## User Flows

### 1. Mentee Flow
1. **Sign Up/Login**:
   - User signs up or logs in using email and password.
   - Upon successful login, the user is redirected to their dashboard.

2. **Dashboard**:
   - Displays:
     - Remaining credits.
     - Feedback request history.
     - Button to purchase credits.
   - User selects "Request Feedback."

3. **Request Feedback**:
   - User uploads files (images, PDFs) or provides a link (e.g., Figma, Google Drive).
   - Adds context or specific questions about the design.
   - Confirms credit usage and submits the request.

4. **Session in Progress**:
   - Request is sent to a mentor queue.
   - Mentee waits for the feedback to be delivered (email notification upon completion).

5. **Feedback Review**:
   - Mentee receives feedback as text in the app.
   - Can rate the mentor (optional).

6. **Purchase Credits** (If Low on Credits):
   - User clicks "Buy Credits."
   - Redirected to a payment form (Stripe integration).
   - Credits are added to their account upon successful payment.

---

### 2. Mentor Flow
1. **Sign Up/Login**:
   - Mentor logs in using email and password.
   - Profile setup includes areas of expertise and bio.

2. **Mentor Dashboard**:
   - Displays:
     - Feedback request queue.
     - Total credits earned (pending payout).
     - Completed session history.

3. **Respond to Feedback Requests**:
   - Mentor selects a pending request from the queue.
   - Reviews the mentee's design and context/questions.
   - Provides feedback via text.

4. **Submit Feedback**:
   - Feedback is submitted and marked as completed.
   - Credits are added to the mentor's account.

5. **Request Payout**:
   - Mentors can request payouts after reaching the minimum earnings threshold.
   - Payments are processed through Stripe Connect.

---

## Key Screens

### 1. Mentee Screens
- **Login/Signup**: Simple email/password form.
- **Dashboard**: Displays credits, session history, and "Request Feedback" button.
- **Request Feedback**: File upload, text input for questions, and confirmation.
- **Feedback Review**: Completed feedback displayed with mentor rating option.

### 2. Mentor Screens
- **Login/Signup**: Mentor-specific profile setup.
- **Dashboard**: Displays pending requests, earnings, and session history.
- **Feedback Submission**: Feedback entry form for mentee requests.

---

## Navigation Map

### Mentee Navigation
- Login → Dashboard → Request Feedback → Feedback Review → Buy Credits

### Mentor Navigation
- Login → Dashboard → Respond to Feedback → Submit Feedback → Request Payout

---

## Notifications
- **Mentee**:
  - Email notifications for feedback completion.
  - Alerts for low credits.
- **Mentor**:
  - Email notifications for new feedback requests.
  - Alerts for payout eligibility.

