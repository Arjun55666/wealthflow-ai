# WealthFlow AI

A full-stack personal finance management web application with AI-powered features.

## Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Node.js + Express (serves built frontend as static files)
- **Database**: PostgreSQL via Prisma ORM (Replit-managed)
- **Caching**: Redis via ioredis (optional - gracefully disabled if REDIS_URL not set)
- **AI**: Google Gemini SDK for receipt scanning and financial insights
- **Auth**: JWT + bcryptjs

## Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # App views (Dashboard, Accounts, Transactions)
│   │   └── utils/        # Axios config
│   └── dist/            # Built frontend (served by Express)
├── server/          # Express backend
│   ├── app.js       # Entry point (serves on PORT, defaults to 5000)
│   ├── controllers/ # Business logic
│   ├── middlewares/ # Auth guards, Arcjet rate limiting
│   ├── prisma/      # Schema and migrations
│   ├── routes/      # API routes (/api/auth, /api/accounts, etc.)
│   ├── services/    # Gemini AI, cron jobs
│   └── utils/       # Redis client, Prisma client, email helpers
└── package.json     # Root orchestration scripts
```

## Running in Development

1. Install server deps: `cd server && npm install`
2. Install client deps: `cd client && npm install`
3. Generate Prisma client: `cd server && ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma`
4. Push schema: `cd server && ./node_modules/.bin/prisma db push --schema=prisma/schema.prisma`
5. Build client: `cd client && npm run build`
6. Start server: `node server/app.js`

The workflow "Start application" runs `node server/app.js` on port 5000.

## Environment Variables

Required secrets:
- `DATABASE_URL` - PostgreSQL connection string (Replit-managed)
- `JWT_SECRET` - JWT signing secret

Optional secrets:
- `GROQ_API_KEY` - For AI receipt scanning (Llama 4 Scout vision) and financial tips (Llama 3.3 70b)
- `REDIS_URL` - Upstash Redis for caching (app works without it)
- `ARCJET_KEY` - For rate limiting and shield protection (app works without it)
- `EMAIL_USER` / `EMAIL_PASS` - For budget alert emails
- `FRONTEND_DOMAIN` - Allowed CORS origin

## Key Features

- AI Receipt Scanning (requires GEMINI_API_KEY)
- Budget tracking with email alerts
- Transaction management with recurring support
- Monthly financial reports
- Dashboard with charts (Recharts)
