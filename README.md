# Smart Debt Flow

Smart Debt Flow is a web application that helps users manage and track their debt payoff journey.

## Deployment Status

The application is deployed at: https://project.dcertan84.workers.dev

## Recent Fixes

We've addressed several issues with the application:

1. **Fixed Circular Dependencies in Supabase Client**
   - Updated `src/lib/supabase/client.ts` to re-export from the primary source
   - Added a helper function for checking the Supabase connection

2. **Fixed Worker.js to Handle Manifest Files**
   - Updated `src/worker.js` to properly check for the ASSETS binding
   - Added a static fallback for manifest.json and manifest.webmanifest
   - Implemented better error handling and debugging

3. **Fixed index.html**
   - Created a proper HTML template for the application
   - Added proper head and meta tags
   - Configured for PWA (Progressive Web App) support

## Known Issues

1. **Cloudflare KV Storage Rate Limits**
   - We've hit the daily rate limits for the free tier of Cloudflare KV storage
   - The deployment should complete successfully once the rate limits reset (typically after 24 hours)

2. **Manifest Files**
   - Worker.js now has improved handling for manifest files, but deployment is pending due to rate limits

## Deployment Instructions

Once the Cloudflare rate limits reset, run the following command to deploy:

```bash
npm run build && npx wrangler deploy
```

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

## Troubleshooting

If you encounter a "500 Error" for manifest.json or manifest.webmanifest, check the following:

1. The worker.js file should have a fallback mechanism to serve a static manifest
2. The index.html file should properly reference the manifest file in the head section
3. The vite.config.ts should have proper PWA plugin configuration

If you encounter "Uncaught SyntaxError" related to Supabase exports, check:

1. Make sure there are no circular dependencies in the Supabase client setup
2. The `src/lib/supabase/client.ts` file should re-export from `@/utils/supabase/client` without creating circular imports

## Environment Variables

The application requires several environment variables to be set:

- `SUPABASE_URL`: The URL for your Supabase instance
- `SUPABASE_ANON_KEY`: Anon/Public key for Supabase
- `STRIPE_MODE`: Set to 'test' or 'live'
- `ENVIRONMENT`: Set to 'development' or 'production'

## Features

- **Dashboard**: Visualize your debt and track your progress
- **Debt Management**: Create and manage debt payoff strategies
- **Payment Processing**: Securely process payments via Stripe
- **Bank Connections**: Connect your bank accounts via Plaid
- **AI Support**: Get instant help from our AI assistant

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Bank Integration**: Plaid
- **AI Services**: Custom AI integration

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Plaid account (for bank connections)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-debt-flow.git
   cd smart-debt-flow
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase, Stripe, and other API keys

4. Run the development server:
   ```
   npm run dev:all
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src`: Frontend React application
  - `/components`: Reusable UI components
  - `/pages`: Application pages
  - `/lib`: Utility functions and hooks
  - `/server`: Backend server code
    - `/api`: API controllers and services
    - `/routes`: API route definitions
    - `/middleware`: Express middleware
    - `/services`: Business logic services

## Development

### Running in Development Mode

```
npm run dev:all
```

This starts both the frontend Vite server and the backend Express server concurrently.

### Building for Production

```
npm run build
```

## AI Support System

The application includes an AI-powered support system that helps users with:

- Account issues
- Payment questions
- Debt strategy advice
- Technical support

The AI system is integrated via a chat interface and provides real-time assistance to users.

## Database Migrations

Database migrations are managed through Supabase migrations in the `/supabase/migrations` directory.

## Testing

```
npm run test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 