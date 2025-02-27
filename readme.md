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

4. Set up the database in Supabase:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Create a new query
   - Copy the contents of `database_setup.sql` from this repository
   - Run the query to set up all necessary tables and policies

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Authentication

The application uses Supabase Authentication with:
- Email magic links (passwordless authentication)

### Authentication Flow

The application uses a streamlined authentication flow with Supabase:

1. **Login**: Users sign in with email magic links through Supabase Auth.

2. **Auth Callback**: After successful authentication, users are redirected to the auth callback page which:
   - Verifies the authentication tokens
   - Checks if the user exists in the database
   - Checks if the user has selected a role
   - Redirects to the appropriate page based on user status

3. **Role Selection**: New users are prompted to select a role (Mentor or Feedback Seeker).
   - The role is stored in the database
   - The role is also cached in the AuthContext for quick access

4. **Dashboard Access**: Once a user has a role, they can access the dashboard and role-specific features.

### Key Components

- **AuthContext**: Manages authentication state, user information, and role data
- **OnboardingContext**: Handles the role selection process
- **Protected Routes**: Ensure users can only access appropriate pages based on their authentication status and role

### Database Structure

The users table in the database stores essential user information:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

For detailed setup instructions, see the "Set up the database in Supabase" section above.

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
