# Roomly backend

Secure Node.js + Express backend for the roommate compatibility finder app.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   Generate strong random secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET, for example:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Run this twice to get two different secrets.

3. Start the server:
   ```
   npm run dev
   ```

4. Test it:
   ```
   GET http://localhost:5000/api/health
   ```

## API endpoints

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Log in |
| POST | /api/auth/refresh | No (needs refresh cookie) | Get new access token |
| POST | /api/auth/logout | No | Clear session |
| GET | /api/users/me | Yes | Get my profile |
| PUT | /api/users/me | Yes | Update my profile |
| POST | /api/users/quiz | Yes | Submit lifestyle quiz |
| GET | /api/matches/suggestions | Yes | Get ranked candidate list |
| POST | /api/matches/swipe | Yes | Like or reject a candidate |
| GET | /api/matches/my-matches | Yes | List mutual matches |
| GET | /api/messages/:matchId | Yes | Get chat history for a match |

Real-time chat runs over Socket.io on the same server, authenticated with the same access token (`socket.handshake.auth.token`).

## Security measures included

- Passwords hashed with bcrypt (12 salt rounds), never returned in any response
- JWT access tokens (15 min) and refresh tokens (7 days), stored in httpOnly, sameSite cookies so JavaScript cannot read them
- Refresh token stored server-side per user, invalidated on logout
- Account lockout for 15 minutes after 5 failed login attempts, to block brute-force attacks
- express-validator on every input field (email format, password strength, quiz ranges)
- express-rate-limit on auth routes (10 attempts / 15 min) and globally (200 requests / 15 min)
- helmet sets protective HTTP headers
- express-mongo-sanitize strips MongoDB operator injection attempts from input
- hpp blocks HTTP parameter pollution
- CORS locked to your actual frontend URL only, not open to all origins
- Centralized error handler that never leaks stack traces in production
- Authorization checks on chat and match routes so a user can only read their own matches/messages
- .env excluded from git so secrets never get pushed to GitHub

## Things to do before going to production

- Add email verification on signup
- Add a "forgot password" flow
- Move file/photo uploads to a service like Cloudinary instead of storing raw paths
- Set NODE_ENV=production and use HTTPS so the secure cookie flag actually applies
