# MangaVerse

**[🚀 View Live Demo on Vercel](https://mangaverse-puce.vercel.app/)**

MangaVerse is a premium, modern, and high-performance web application for reading manga, manhwa, and manhua. Built with Next.js App Router, it provides a seamless, ad-free reading experience with personalized libraries, reading history synchronization, and advanced discovery tools.

## Features

- **Read Instantly**: Access thousands of titles via the MangaDex API with zero wait times.
- **Library Sync**: Sign in with Google (NextAuth) to sync your bookmarks, reading progress, and library across all devices.
- **Advanced Discovery**: Filter by genre, demographic, format, and content rating to find your next favorite series.
- **Trending & Popular**: Integrates with the AniList GraphQL API to surface what the community is reading right now.
- **Premium Aesthetics**: A sleek, dark-mode-first UI built with Tailwind CSS, featuring glassmorphism, dynamic gradients, and smooth micro-animations.
- **High Performance**: Leverages Next.js 14/15 static generation, React Server Components, and optimized image loading.
- **Progressive Web App (PWA)**: Installable on mobile devices for an app-like experience.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (Custom design tokens)
- **Authentication**: NextAuth.js (Auth.js v5 beta)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **State Management**: Zustand (Client-side UI state), React Query (Data fetching)
- **APIs**: MangaDex REST API, AniList GraphQL API

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn or pnpm
- A Supabase Project (for database and storage)
- Google OAuth Credentials (for NextAuth)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mangaverse.git
   cd mangaverse
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # NextAuth
   AUTH_SECRET="your-random-secret-key" # Run `npx auth secret` to generate
   AUTH_GOOGLE_ID="your-google-oauth-client-id"
   AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # Admin
   ADMIN_EMAIL="your-email@gmail.com"
   ```

4. Set up the Database
   Execute the SQL provided in `supabase-rls-fix.sql` and any other schema files in your Supabase SQL Editor to set up the `reading_history`, `bookmarks`, and Row Level Security (RLS) policies.

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Guidelines

- **Server Actions**: All database mutations (bookmarking, updating history) are handled via Next.js Server Actions in `src/app/library/actions.ts` with strict session validation.
- **Data Fetching**: External APIs (MangaDex, AniList) are fetched using the native `fetch` API on the server side where possible, and cached according to Next.js best practices.
- **Authentication**: Uses the JWT strategy in NextAuth. The Google `profile.sub` is used as the canonical user ID across the platform and Supabase database.
- **Security**: Strict Content Security Policy (CSP) headers are defined in `next.config.ts`. Supabase operations are heavily restricted using RLS, ensuring users can only read/write their own data.

## Contributing

Contributions are welcome! Please ensure that your code adheres to the existing project structure and that you do not change the core codebase logic without prior discussion.

## License

This project is licensed under the MIT License.
