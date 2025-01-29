# Micro-Mentorship Platform - App Flow Document

## User Flows

### 1. Mentee Flow
1. **Sign Up/Login**:
   - User signs up or logs in using email and password.
   - Upon successful login, the user is redirected to their dashboard.

2. **Dashboard**:  
   - Displays:
     - Remaining credits
     - Feedback request history
     - Button to purchase credits
   - User selects "Request Feedback"

3. **Browse Mentors**:
   - View list of available mentors
   - See mentor profiles with:
     - Expertise and languages
     - Rating and reviews
     - Price per feedback
   - Filter mentors by expertise, language, or price range

4. **Request Feedback**:
   - Select a mentor or post to all mentors
   - Upload files or provide design link
   - Add context and specific questions
   - Confirm credit cost based on mentor's price
   - Submit request if sufficient credits available

5. **Session in Progress**:
   - Request sent to selected mentor
   - Mentor can accept or decline
   - Real-time notifications for status updates
   - Email notification upon completion

6. **Feedback Review**:
   - Review received feedback
   - Option to rate mentor
   - Credits automatically deducted

7. **Purchase Credits**:
   - Click "Buy Credits"
   - Select credit package
   - Complete payment via Stripe
   - Credits instantly added to account

### 2. Mentor Flow
1. **Sign Up/Login**:
   - Register as a mentor
   - Complete profile with expertise and languages

2. **Set Pricing**:
   - Set price per feedback in credits
   - Update pricing anytime from dashboard
   - View market rates from other mentors

3. **Dashboard**:
   - View:
     - Pending requests
     - Completed feedback
     - Earnings history
   - Set availability status

4. **Handle Requests**:
   - Review incoming requests
   - Accept or decline with reason
   - Submit feedback within timeframe
   - Track completed sessions

### Navigation Map

#### Mentee Navigation
- Login → Dashboard → Browse Mentors → Request Feedback → Review Feedback → Buy Credits

#### Mentor Navigation
- Login → Set Price → Dashboard → Review Requests → Submit Feedback → Track Earnings

### Notifications
- **Mentee**:
  - New mentor responses
  - Feedback completion
  - Low credit alerts
  - Price changes from favorite mentors
- **Mentor**:
  - New feedback requests
  - Request acceptance deadline reminders
  - Feedback submission reminders
  - Earnings updates

