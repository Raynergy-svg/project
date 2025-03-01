
# Smart Debt Flow

A comprehensive debt management application with AI-powered support.

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