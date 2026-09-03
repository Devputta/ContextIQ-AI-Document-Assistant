# ContextIQ Day 2 Authentication

Day 2 extends Day 1 and keeps the existing landing page/dashboard preview.

### Added
- Registration UI
- Login UI
- Forgot-password UI
- Reset-password UI
- Google OAuth configuration boundary
- Protected route middleware
- Password-strength validation
- Environment-variable configuration

### Security architecture
No passwords, tokens, or fake sessions are stored in localStorage. The intended production flow is:

Browser → Next.js → FastAPI authentication API → PostgreSQL/Supabase

The FastAPI service should hash passwords with Argon2id/bcrypt, enforce unique username/email at the database level, issue Secure + HttpOnly + SameSite session cookies, validate sessions on protected requests, use short-lived one-time reset tokens, and use server-side Google OAuth credentials.

Copy `.env.example` to `.env.local`. Never commit real secrets.

The UI deliberately does not create fake accounts. Connect the real FastAPI endpoints before enabling production authentication.
