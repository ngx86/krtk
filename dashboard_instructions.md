
# Micro-Mentorship Platform - Updated Dashboard Layout Specification

## Overview

This document outlines the enhanced layout and features for the Mentee and Mentor dashboards. The new design adds a **persistent header** and **optional sidebar** to improve navigation and usability, with clearer section distinctions and enhanced functionalities across both views.

The goal is to provide a more structured, intuitive experience that can scale as additional features are introduced.

---

## 1. Header Design (Persistent)

The header will remain at the top of the dashboard across both Mentee and Mentor views, providing quick access to essential actions and user information.

### Header Layout and Features
1. **Logo and Title**:
   - Place the platform logo on the left side, followed by a “Dashboard” title. This reinforces the user’s current location.

2. **Credit Balance**:
   - **Display**: Show the available credits (e.g., “Credits: 10”) in a prominent, easy-to-read font.
   - **Buy Credits Button**: Position a “Buy Credits” button next to the credit balance. Use a primary color (e.g., green or blue) to make it visually distinct.
   - **Tooltip**: On hover or click, provide more information about credit usage, e.g., “Each feedback request costs 3 credits.”

3. **Notifications Icon**:
   - **Icon**: Add a bell icon to indicate notifications, positioned to the right of the credit balance.
   - **Badge**: Include a small, red badge on the icon to indicate unread notifications, e.g., “3” for three new notifications.
   - **Dropdown**: On click, display a dropdown with recent notifications:
     - Example notifications: “Feedback completed for [Design Name].”, “Low credits - only 2 credits remaining.”
     - Notifications can be marked as read or cleared.

4. **User Profile**:
   - **Icon/Avatar**: Display a user profile icon or initials on the far right of the header.
   - **Dropdown Menu**: Clicking the profile icon should open a dropdown menu with options:
     - Profile/Settings (if implemented in future phases)
     - Logout (if authentication is added later)

---

## 2. Sidebar Navigation (Optional)

Adding a sidebar improves navigation and allows room for additional links in future phases. It can be collapsed or hidden on smaller screens.

### Sidebar Layout and Features
1. **Sidebar Items**:
   - **Home/Dashboard**: Link to the main dashboard.
   - **Notifications**: Direct link to view all notifications in detail.
   - **Settings/Account**: Placeholder for account settings if implemented later.

2. **Style and Placement**:
   - Position the sidebar on the left side of the screen.
   - Use icons with labels for each item for clarity.
   - Apply a subtle background color or shadow to visually separate it from the main content area.

3. **Responsiveness**:
   - Ensure the sidebar is collapsible on smaller screens or replaced by a top navigation bar on mobile.

---

## 3. Main Content Area (Dashboard Sections)

The main content area is divided into specific sections for mentees and mentors. These sections should have clear, consistent styling across both views.

### Section A: Available Credits

#### Objective
Provide an easy way for users to check and add credits.

#### Layout and Features
- **Title**: “Available Credits”
- **Credits Display**: Large, bold font showing the number of credits remaining.
- **Buy Credits Button**: Styled in a primary color, next to the credits display.
- **Credit Information**: Add a short line or tooltip below the credit display, e.g., “Each feedback request costs 3 credits.”

---

### Section B: Submit Feedback (Mentee) / Feedback Queue (Mentor)

#### Mentee View: Submit Feedback
- **Section Title**: “Submit a New Feedback Request”
- **Design Link Field**:
  - **Label**: “Design Link (optional)”
  - **Tooltip**: Explain supported platforms, e.g., “Supports links from Figma, Dribbble, and Adobe XD.”
- **Description Field**:
  - **Label**: “Description / Questions”
  - **Placeholder**: “Describe what you’d like feedback on, such as layout, colors, or typography.”
- **Submit Button**:
  - Text: “Submit Request (3 Credits)”
  - Confirmation Dialog: Confirm credit deduction before submission.

#### Mentor View: Feedback Queue
- **Section Title**: “Pending Feedback Requests”
- **Request Cards**:
  - Display each feedback request as a card with details (e.g., “Review my logo design”).
  - **Action Button**: “Provide Feedback” button to open the request.
- **Status Indicator**: Show statuses for requests (e.g., “Pending”).

---

### Section C: Feedback History

#### Objective
Organize past feedback requests for easy viewing and sorting.

#### Layout and Features
- **Title**: “Your Feedback History”
- **Feedback Cards**:
  - **Status**: Show “Pending,” “In Progress,” or “Completed” with color-coding (yellow, blue, green).
  - **Design Title**: Show design name and submission date.
  - **View Link**: If a design link was provided, show a “View Design” link.
  - **Mentor Feedback**: For completed requests, display feedback with an expandable “Read more” option if needed.
  - **Rating Option**: Include a “Rate This Feedback” button with a 5-star rating system for mentor feedback.

- **Filter/Sort Options**:
  - Allow mentees to filter by status (e.g., “Pending,” “Completed”) or by date (e.g., “Most Recent”).

---

## 4. Notifications and Alerts

### Objective
Keep users informed of important events (feedback completion, low credits).

### Features
- **Notification Center**:
  - Located in the header as a bell icon with a badge.
  - Clicking the icon opens a dropdown or sidebar listing recent notifications.

- **Notification Types**:
  - Feedback completion, low credits, credit purchase confirmation.

---

## Final Layout Overview

### Header (Persistent)
- [Logo] [Dashboard Title] [Available Credits: 10 | Buy Credits] [Notifications Icon with Badge] [User Profile]

### Sidebar (Optional)
- **Links**: Home/Dashboard, Notifications, Settings/Account

### Main Content Area
1. **Available Credits Section**:
   - Display credits and “Buy Credits” button.

2. **Submit Feedback (Mentee)**:
   - Design link, description field, and submit button.

3. **Feedback Queue (Mentor)**:
   - Pending feedback requests with “Provide Feedback” action.

4. **Feedback History**:
   - Sortable list of feedback requests, with mentor feedback and rating options.

---

This document provides the necessary details to implement a well-structured dashboard with improved navigation, consistency, and clarity across both Mentee and Mentor views.
