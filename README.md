# Querli

AI-powered database agent that turns plain English into SQL. Connect your Postgres or MySQL database, ask questions in natural language, and get results as interactive tables and charts — no SQL knowledge required.

## What It Does

- **Natural language to SQL** — type a question in plain English; Querli writes the SQL and runs it
- **Multiple database support** — connect Postgres and MySQL databases
- **Interactive results** — view query results as tables or charts (bar, line)
- **Query history** — every query is saved so you can revisit, re-run, or share past results
- **Usage tracking** — per-plan query quotas enforced automatically
- **Secure by design** — database connection strings are encrypted at rest; only SELECT queries are allowed (no writes, no drops)

## Pricing

| Plan | Price | Queries/mo | Connections |
|------|-------|------------|-------------|
| Free | $0/mo | 50 | 1 |
| Pro | $29/mo | 500 | 5 |
| Business | $79/mo | Unlimited | 20 |

## Tech Stack

- **Frontend** — Next.js 14 (App Router), Tailwind CSS, deployed on Vercel
- **Backend** — FastAPI (Python 3.11), deployed on Railway
- **Database & Auth** — Supabase (Postgres + Auth)
- **Payments** — Stripe (subscriptions, billing portal, webhooks)
- **AI** — Groq API (llama-3.3-70b) for NL-to-SQL generation
- **Query execution** — SQLAlchemy with SELECT-only enforcement and 10-second timeout
- **Encryption** — Fernet symmetric encryption for stored connection strings

## Architecture

```
User → Vercel (Next.js frontend)
         ├── /login, /signup       ← Supabase Auth (email + OAuth)
         ├── /dashboard            ← overview, usage meter, recent queries
         ├── /connections          ← manage database connections
         ├── /query                ← main product: ask questions, see results
         ├── /history              ← past queries with re-run links
         ├── /billing              ← Stripe subscription management
         └── /settings             ← account settings
                  ↓
         Railway (FastAPI backend)
         ├── POST /query           ← NL → SQL → execute → return results
         ├── POST /encrypt         ← encrypt a connection string for storage
         └── DELETE /connections   ← remove a connection
                  ↓
         Supabase (Postgres)
         ├── subscriptions
         ├── connections           ← encrypted DB URLs
         └── queries               ← full query history with results
```

## Dashboard Pages

**Dashboard** — connected database count, query usage this month vs. limit, recent query list, quick link to add a database

**Connections** — add a Postgres or MySQL connection by pasting the connection URL; connection string is encrypted before being stored

**Query** — select a connected database, type a question in plain English, see the generated SQL and results; chart toggle available

**History** — all past queries with the question, SQL, execution time, and a re-run button

**Billing** — self-serve plan upgrade, downgrade, or cancellation via Stripe

**Settings** — update profile and change password

## How Users Get Started

1. Sign up at the website
2. Choose a plan (free plan available — 50 queries/month, 1 connection)
3. Add a database connection (paste a Postgres or MySQL URL)
4. Go to the Query page and ask a question in plain English
5. View results as a table or chart; re-run any past query from History

## Security

- Connection strings are encrypted with Fernet before being stored in the database
- The backend enforces SELECT-only queries — no INSERT, UPDATE, DELETE, DROP, or TRUNCATE is allowed
- Queries time out after 10 seconds to prevent runaway queries
- All Supabase tables have Row Level Security (RLS) — users can only access their own data

## Local Development

### Prerequisites
- Node.js 18+, Python 3.11
- Supabase project, Stripe account, Groq API key
- Fernet encryption key: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

### Frontend
```bash
cd querli
npm install
npm run dev        # runs on localhost:3002
```

### Backend
```bash
cd querli/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
STRIPE_BUSINESS_PRICE_ID
GROQ_API_KEY
ENCRYPTION_KEY
NEXT_PUBLIC_APP_URL
BACKEND_URL
```

## Deployment

- **Frontend**: Vercel — auto-deploys from the main branch
- **Backend**: Railway — auto-deploys from the main branch, Python 3.11 pinned via `.python-version`
