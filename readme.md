# RVZN App

A modern web application built with React, TypeScript, and Supabase.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/rvzn.git
cd rvzn
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Authentication

The application uses Supabase Authentication with:
- Email magic links (passwordless authentication)

### Authentication Flow

1. User enters their email on the login page
2. User receives a magic link in their email
3. Clicking the link redirects to `/auth/callback`
4. The callback page verifies the session and checks if the user has a role
5. If no role is set, user is redirected to role selection
6. After role selection, user is redirected to the dashboard

### URL Configuration

For production, authentication redirects to:
- https://www.rvzn.app/auth/callback

For local development:
- http://localhost:5173/auth/callback

## Application Structure

### Routes

- `/` - Splash screen
- `/login` - Login page
- `/auth/callback` - Authentication callback handler
- `/role-selection` - Role selection for new users
- `/dashboard/*` - Protected dashboard routes

### Dashboard Routes

#### Mentee Routes
- `/dashboard` - Mentee dashboard
- `/dashboard/mentors` - Find mentors
- `/dashboard/credits` - Credits management
- `/dashboard/request-feedback` - Request feedback
- `/dashboard/feedback-history` - Feedback history

#### Mentor Routes
- `/dashboard` - Mentor dashboard

#### Common Routes
- `/dashboard/notifications` - Notifications
- `/dashboard/settings` - User settings

## Deployment

The application is deployed on Vercel and can be accessed at:
- https://www.rvzn.app

## Project Structure

```
src/
├── components/     # UI components
├── contexts/       # React contexts
├── lib/            # Utility functions and libraries
├── pages/          # Page components
├── routes/         # Application routes
└── styles/         # CSS and styling
```

## Tech Stack

- React
- TypeScript
- Vite
- Supabase (Authentication & Database)
- Tailwind CSS
- shadcn/ui

## License

[MIT](LICENSE)
