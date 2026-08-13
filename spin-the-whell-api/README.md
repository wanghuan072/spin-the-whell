# Spin the Wheel API

Node.js and TypeScript API for Google user authentication, signed-in comments,
and the private comment-management console. Data is stored in Neon Postgres
through Drizzle ORM.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the pooled Neon connection string to `DATABASE_URL`.
3. Replace `IP_HASH_SECRET` with a random value of at least 32 characters.
4. Add the Google web client ID to `GOOGLE_CLIENT_ID`.
5. Install packages with `npm install`.
6. Apply database migrations with `npm run db:migrate`.
7. Create the first administrator with `npm run admin:seed`.
8. Start the API with `npm run dev`.

The frontend runs on `http://localhost:3000` and proxies `/api/*` to this API
on port `4000`. Browser state-changing requests must come through the trusted
frontend origin.

## Google Cloud configuration

Create an OAuth 2.0 Client ID with application type **Web application** in the
Google Cloud console. Add these Authorized JavaScript origins:

- `http://localhost:3000` for local development
- the production frontend origin when it is available

This implementation uses the Google Identity Services popup and an ID token,
so it does not need an authorized redirect URI, Google API scopes, a client
secret, or refresh tokens. Use the same client ID for backend
`GOOGLE_CLIENT_ID` and frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

If local Node.js traffic must use a desktop proxy, add `HTTP_PROXY` and
`HTTPS_PROXY` to `.env.local`. The Google verification library reads these
variables when downloading Google's public signing certificates. Production
hosts with direct outbound access do not need them.

## Database

The schema includes:

- `users` for the current public profile and account status
- `user_identities` for the stable Google `sub` identifier
- `user_sessions` for hashed, 30-day opaque sessions
- nullable `comments.user_id`, preserving existing anonymous-era comments

After pulling a schema change, run:

```bash
npm run db:migrate
```

## Production

Compile the API and start the emitted Node.js application:

```bash
npm run build
npm run start
```

The production process runs `dist/server.js` and does not require `tsx` at runtime.
