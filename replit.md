# WealthFlow AI

A full-stack AI-powered financial management application.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS 4, served on port 5000
- **Backend**: Node.js + Express, served on port 3000
- **Database**: PostgreSQL (Replit managed) with Prisma ORM
- **AI**: Google Gemini AI for receipt parsing and financial tips
- **Security**: Arcjet for rate limiting and bot protection

## Project Structure

```
client/          # React frontend (Vite)
  src/
    components/  # Reusable UI components
    context/     # React context (AuthContext)
    pages/       # Page components
    utils/       # axios.js instance (uses /api proxy)
  vite.config.js # Configured for port 5000, proxy to :3000, allowedHosts: true
server/          # Express backend
  controllers/   # Business logic
  middlewares/   # Auth, Arcjet, rate limiting
  prisma/        # Schema + migrations
  routes/        # API routes
  services/      # Gemini AI, cron jobs
  utils/         # Email, prismaClient.js, redisClient.js
  app.js         # Entry point (port 3000)
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection (auto-managed by Replit)
- `JWT_SECRET` - Token signing secret
- `FRONTEND_DOMAIN` - CORS origin (set to "*" for dev)
- `PORT` - Backend port (3000)
- `REDIS_URL` - Optional Redis for caching (gracefully disabled if missing)
- `ARCJET_KEY` - Arcjet API key (optional, security fails open)
- `GEMINI_API_KEY` - Google Gemini AI key (for receipt parsing & tips)
- `EMAIL_*` - Nodemailer email credentials (for alerts/reports)

## Workflows

- **Start application** - Frontend dev server (`cd client && npm run dev`) on port 5000
- **Backend** - Express API server (`cd server && node app.js`) on port 3000

## Key Notes

- Frontend uses relative `/api` path; Vite proxies to backend at `localhost:3000`
- Redis caching is optional — disabled when `REDIS_URL` is not set
- `server/utils/prismaClient.js` is the canonical Prisma client export (note: there's also `prismaclient.js`)
- Prisma migrations are applied via `cd server && npx prisma migrate deploy`
