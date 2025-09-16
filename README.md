# ReplyMate - AI Social Media Assistant

ReplyMate is a SaaS application that uses AI to generate engaging replies to comments and create viral tweets, helping users boost their social media presence.

## Features

- **AI Reply Generator**: Instantly crafts context-aware replies.
- **Viral Tweet Generator**: Creates unique tweet ideas based on examples.
- **User Authentication**: Secure sign-up and sign-in with email/password and Google.
- **Subscription Tiers**: Monetization-ready with Stripe integration for different usage levels.
- **Admin Dashboard**: Manage users, view submissions, and monitor analytics.
- **Content Safety**: Built-in checks to moderate input and output.

## Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd replymate
    ```

2.  **Create an environment file:**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```

3.  **Fill in environment variables:**
    Open the `.env` file and add your `API_KEY` for the Google Gemini API.

4.  **Install dependencies and run:**
    This project uses `esbuild` for its dev server.
    ```bash
    npm install
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Stripe Integration

To enable payments, you need to configure your Stripe account and add the following environment variables to your `.env` file.

-   `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (e.g., `pk_test_...`).
-   `STRIPE_SECRET_KEY`: Your Stripe secret key (e.g., `sk_test_...`).
-   `STRIPE_PRO_PRICE_ID`: The Price ID for your "Pro" plan from the Stripe Dashboard (e.g., `price_...`).
-   `STRIPE_TEAM_PRICE_ID`: The Price ID for your "Team/Business" plan.
-   `STRIPE_WEBHOOK_SECRET`: The secret key for your webhook endpoint.

**How to get your Webhook Secret:**

1.  Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks).
2.  Click "Add endpoint".
3.  Set the "Endpoint URL" to `https://<your-deployed-url>/api/stripe-webhook`.
4.  Click "+ Select events" and choose `checkout.session.completed`.
5.  Click "Add endpoint".
6.  Once created, you will see a "Signing secret". Click to reveal it, and copy it into your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Deployment

This project is configured for one-click deployment on **Vercel**.

1.  **Fork the repository** to your GitHub account.
2.  **Click the "Deploy with Vercel" button** below.
3.  **Configure Environment Variables**: Vercel will prompt you to enter the environment variables from your `.env` file. Make sure to include your `API_KEY` and all `STRIPE_*` variables.
4.  **Deploy**: Vercel will handle the build and deployment process.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<your-github-username>%2Freplymate)
