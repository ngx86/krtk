# **Mentee User Journey - Developer Guide**

## **Overview**  
This guide outlines the **user journey** for mentees requesting feedback on the platform. Each stage includes **functional requirements, UI components, API calls, and user interactions**.

---

## **1. Onboarding Process**

### **User Story**
As a **new mentee**, I want to sign up, verify my email, and complete my profile so I can access the platform and request feedback.

### **Steps**
1. **Sign-up screen** (Email/Password or Google Sign-in).  
2. **Email verification** (via link or code).  
3. **Profile completion form** (Name, bio, optional avatar).  
4. **Onboarding walkthrough** explaining the app.

### **Functional Requirements**
- **Sign-up form** with Google or email/password.  
- **Email verification service**.  
- **Supabase database integration** to store profile data.

### **UI Components**
- **Sign-up form** with validation.  
- **Email verification screen**.  
- **Profile setup form**.  
- **Onboarding modal or carousel (3-4 steps)**.

### **API Calls**
- `POST /auth/signup`: Create user.  
- `POST /auth/verify`: Verify email.  
- `POST /profile/update`: Store name, bio, avatar.  
- `GET /onboarding/info`: Fetch walkthrough content.

---

## **2. Dashboard Overview**

### **User Story**
As a **mentee**, I want to see my available credits, active requests, and feedback history so I can manage my interactions with mentors.

### **Steps**
1. Display credits at the top.  
2. Show "Request Feedback" button.  
3. List **active requests** with status indicators.  
4. List **completed requests** with mentor ratings.

### **Functional Requirements**
- Display **real-time credit balance**.  
- Pull **active and completed feedback requests** from the database.

### **UI Components**
- **Credits widget** with a "Buy More" button.  
- **Active requests section** with clickable details.  
- **Completed requests section** with mentor feedback.

### **API Calls**
- `GET /credits/balance`: Fetch mentee's available credits.  
- `GET /requests/active`: Fetch active requests.  
- `GET /requests/completed`: Fetch feedback history.

---

## **3. Choose Feedback Option**

### **User Story**
As a **mentee**, I want to either select a mentor directly or post an open feedback request so I can get feedback on my designs.

### **Steps**
1. Mentee chooses between:  
   - **Direct mentor selection**.  
   - **Posting an open request**.

2. **Direct mentor selection**:  
   - Browse mentor profiles, view expertise, ratings, and pricing.  
   - Select a mentor.

3. **Open request**:  
   - Specify category (e.g., UI design, branding).  
   - Set urgency and upload design files or links.

### **Functional Requirements**
- Mentor profiles with key information (name, expertise, ratings, pricing).  
- Form to submit open feedback requests.

### **UI Components**
- **Mentor selection page**.  
- **Feedback request form** with fields for category, urgency, and design upload.

### **API Calls**
- `GET /mentors`: Fetch list of available mentors.  
- `POST /requests/new`: Submit new feedback request.

---

## **4. Submitting a Request**

### **User Story**
As a **mentee**, I want to submit my feedback request and have the credits deducted automatically so that the feedback process can begin.

### **Steps**
1. Fill out the request form (mentor selection or open request).  
2. Review and confirm the request.  
3. Deduct credits and store the request in the database.

### **Functional Requirements**
- Validate form inputs.  
- Show credit deduction confirmation.  
- Store the request and update credits.

### **UI Components**
- **Review request summary** modal.  
- **Success screen** after submission.

### **API Calls**
- `POST /requests/submit`: Store the request.  
- `POST /credits/deduct`: Deduct the required credits.

---

## **5. Tracking Request Status**

### **User Story**
As a **mentee**, I want to track the status of my feedback request so I know when it is being worked on or completed.

### **Steps**
1. Display the status of each request:  
   - **Pending**: Waiting for mentor.  
   - **In Progress**: Mentor is working.  
   - **Completed**: Feedback provided.

2. Notify the mentee when feedback is ready.

### **Functional Requirements**
- Real-time updates on request status.  
- Notifications for completed feedback.

### **UI Components**
- **Status indicators** (pending, in progress, completed).  
- **Notification banner or badge** for updates.

### **API Calls**
- `GET /requests/status`: Fetch the status of feedback requests.  
- `POST /notifications/subscribe`: Subscribe to status updates.

---

## **6. Receiving and Reviewing Feedback**

### **User Story**
As a **mentee**, I want to view the feedback provided by the mentor and request clarifications if needed.

### **Steps**
1. Display mentor feedback:  
   - Text comments.  
   - Annotated design files (if applicable).  
   - Audio or video responses (if applicable).

2. Option to request clarifications.

### **Functional Requirements**
- Display feedback and any attached files.  
- Allow clarifications via follow-up comments.

### **UI Components**
- **Feedback page** showing mentor comments and attachments.  
- **Clarification request form**.

### **API Calls**
- `GET /feedback/{request_id}`: Retrieve feedback.  
- `POST /feedback/clarification`: Submit clarification request.

---

## **7. Rating the Mentor**

### **User Story**
As a **mentee**, I want to rate the mentor based on the feedback provided so I can help improve the mentor ranking system.

### **Steps**
1. Mentee selects a star rating (1-5).  
2. Optionally, leave a written review.  
3. Submit rating to update mentor profile.

### **Functional Requirements**
- Rating input with validation.  
- Store rating and review in the database.

### **UI Components**
- **Rating form** with stars and review text area.  
- **Success confirmation** after submission.

### **API Calls**
- `POST /feedback/rate`: Submit mentor rating and review.

---

## **8. Buying More Credits**

### **User Story**
As a **mentee**, I want to purchase additional credits so I can continue requesting feedback.

### **Steps**
1. Click "Buy More Credits" button.  
2. Redirect to payment page (Stripe integration).  
3. On success, update credits balance.

### **Functional Requirements**
- Payment integration via Stripe.  
- Update credits automatically after purchase.

### **UI Components**
- **Credits purchase page**.  
- **Payment confirmation screen**.

### **API Calls**
- `POST /credits/purchase`: Initiate purchase.  
- `POST /credits/update`: Update credits after payment confirmation.

---

# **Mentor User Journey - Developer Guide**

## **Overview**  
This guide outlines the **user journey** for mentors providing feedback. Each stage includes **functional requirements, UI components, API calls, and user interactions**.

---

## **1. Onboarding Process**

### **User Story**  
As a **new mentor**, I want to sign up, complete my profile, and go through an onboarding walkthrough so I can start receiving requests from mentees.

### **Steps**  
1. **Sign-up screen** (Email/Password or Google Sign-in).  
2. **Email verification** (via link or code).  
3. **Profile completion form**:  
   - Bio, expertise areas, portfolio links.  
   - Pricing per feedback session.  
4. **Onboarding walkthrough** explaining the mentor process.

### **Functional Requirements**  
- Create mentor profiles with bio, portfolio links, and expertise areas.  
- Assign default pricing or allow customization.

### **UI Components**  
- **Sign-up form** with validation.  
- **Email verification screen**.  
- **Profile setup form** with mentor-specific fields.  
- **Onboarding modal or carousel (3-4 steps)**.

### **API Calls**  
- `POST /auth/signup`: Create user.  
- `POST /auth/verify`: Verify email.  
- `POST /mentors/profile`: Store mentor profile.  
- `GET /onboarding/info`: Fetch walkthrough content.

---

## **2. Dashboard Overview**

### **User Story**  
As a **mentor**, I want to see my pending feedback requests, completed sessions, and earnings, so I can effectively manage my interactions with mentees.

### **Steps**  
1. Display pending feedback requests at the top.  
2. Show total earnings and pending payouts.  
3. Display completed requests with ratings from mentees.

### **Functional Requirements**  
- Fetch and display pending and completed feedback requests.  
- Track mentor earnings and provide payout options.

### **UI Components**  
- **Pending requests widget**.  
- **Earnings overview widget** with payout options.  
- **Completed feedback section** with mentee ratings.

### **API Calls**  
- `GET /requests/pending`: Fetch pending requests.  
- `GET /requests/completed`: Fetch completed feedback.  
- `GET /mentors/earnings`: Retrieve total earnings.

---

## **3. Managing Feedback Requests**

### **User Story**  
As a **mentor**, I want to browse feedback requests and accept or decline them based on relevance and my availability.

### **Steps**  
1. View feedback requests assigned directly or from the open pool.  
2. Accept or decline requests.  
3. Start providing feedback once a request is accepted.

### **Functional Requirements**  
- Display feedback requests with relevant details (description, design link, urgency).  
- Provide options to accept or decline.

### **UI Components**  
- **Pending requests list** with action buttons.  
- **Request details page** with acceptance options.

### **API Calls**  
- `GET /requests/open`: Fetch open feedback requests.  
- `POST /requests/accept`: Accept a feedback request.  
- `POST /requests/decline`: Decline a request.

---

## **4. Providing Feedback**

### **User Story**  
As a **mentor**, I want to provide feedback on the design, either through text-based comments or annotated images, so the mentee can improve their work.

### **Steps**  
1. View the design or file shared by the mentee.  
2. Provide detailed feedback:  
   - Text comments.  
   - Annotated images (if supported).  
   - Optional video/audio notes.  
3. Submit the feedback.

### **Functional Requirements**  
- Allow mentors to view design files or links.  
- Provide multiple feedback formats (text, images, video).

### **UI Components**  
- **Feedback editor** (text area with rich formatting).  
- **Image annotation tool** (if applicable).  
- **Upload component** for video/audio notes.

### **API Calls**  
- `POST /feedback/submit`: Submit feedback.  
- `POST /feedback/attachments`: Upload additional files (if needed).

---

## **5. Completing Requests and Ratings**

### **User Story**  
As a **mentor**, I want to submit the completed feedback and view the mentee’s rating, so I can track my performance and earn credits.

### **Steps**  
1. Submit the completed feedback.  
2. Receive a rating from the mentee.  
3. View aggregated ratings and feedback on the dashboard.

### **Functional Requirements**  
- Submit feedback and notify the mentee.  
- Store mentee ratings and display them in the mentor’s profile.

### **UI Components**  
- **Completion confirmation modal**.  
- **Ratings widget** in the mentor dashboard.

### **API Calls**  
- `POST /feedback/complete`: Mark feedback as completed.  
- `GET /feedback/rating`: Retrieve mentee’s rating and review.

---

## **6. Earnings and Payouts**

### **User Story**  
As a **mentor**, I want to track my earnings and request payouts when I reach the minimum balance, so I can receive compensation for my work.

### **Steps**  
1. Track earnings from completed requests.  
2. Request payouts via Stripe when reaching the payout threshold.

### **Functional Requirements**  
- Track total earnings and pending payouts.  
- Initiate payouts through Stripe Connect.

### **UI Components**  
- **Earnings overview** with payout threshold indicator.  
- **Payout request form**.

### **API Calls**  
- `GET /mentors/earnings`: Fetch total earnings.  
- `POST /payout/request`: Request payout via Stripe.

---

## **Summary Table for Developer Reference**

| **Stage**              | **UI Components**            | **API Calls**                                            |
|-----------------------|------------------------------|----------------------------------------------------------|
| Onboarding            | Sign-up form, profile form   | POST /auth/signup, POST /mentors/profile                 |
| Dashboard Overview    | Dashboard widgets            | GET /requests/pending, GET /mentors/earnings             |
| Managing Requests     | Pending request list         | GET /requests/open, POST /requests/accept                |
| Providing Feedback    | Feedback editor, annotations | POST /feedback/submit, POST /feedback/attachments        |
| Completing Requests   | Confirmation modal           | POST /feedback/complete, GET /feedback/rating            |
| Earnings and Payouts  | Payout form, earnings widget | GET /mentors/earnings, POST /payout/request              |

---

## **Optional Enhancements**
1. **Real-time Notifications**:  
   - Notify mentors when new requests are available.  
   - Alert mentees when feedback is submitted.  

   **API Calls:**  
   - `POST /notifications/push`: Send notifications.  

2. **Urgency-Based Pricing:**  
   - Higher credit cost for urgent requests.  
   - Display urgency indicators on feedback requests.

---

This structure ensures that developers understand **what needs to be built, how it connects to backend services, and the expected outcomes**. Let me know if you’d like further refinements or if you’d like to discuss integration points! 🚀