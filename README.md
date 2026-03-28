# Querli — AI Database Agent

> Ask your database anything in plain English. No SQL required.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com)

---

## What Is Querli?

Querli connects to your company's database and lets anyone on your team — sales, marketing, ops, founders — ask questions in plain English. It generates SQL, runs it safely in read-only mode, and returns beautiful interactive charts and tables. No SQL knowledge required.

**The problem:** Companies have massive databases full of valuable data, but only engineers can query them. Every time someone on sales or ops needs a number, they have to ping an engineer and wait hours or days. Existing tools like Metabase require SQL knowledge, and enterprise solutions like ThoughtSpot charge $100K+/year.

**The solution:** Connect your database in 60 seconds. Ask in plain English. Get answers instantly.

---

## Demo

A pre-loaded demo database (fake e-commerce data — 10,000+ rows) lets you try Querli immediately without connecting your own database.

**Example queries you can ask:**
- *"What are the top 5 products by revenue this month?"*
- *"How many users signed up each week this month?"*
- *"Which customers haven't ordered in the last 90 days?"*
- *"Show me average order value by city"*
- *"What's our MRR trend for the last 12 months?"*

---

## Features

- **Natural language to SQL** — Groq's `llama-3.3-70b` converts plain English questions to precise SQL using your actual schema as context
- **Read-only. Always.** — Every query is validated before execution; INSERT, UPDATE, DELETE, DROP, ALTER are rejected instantly
- **Auto chart selection** — AI picks the best visualization (bar, line, pie, or table) based on your data shape
- **60-second setup** — Paste your connection string; schema is read and cached automatically
- **Query history** — Every query is saved; re-run, edit, and share with teammates
- **Demo database** — Pre-loaded fake e-commerce data so users can try immediately
- **Multi-database** — PostgreSQL, MySQL, and SQLite supported today
- **Schema explorer** — Browse tables, columns, types, and relationships visually

---

## Security

Querli is designed with security as a first principle:

- **SQL validation** — Every generated query is checked before execution; only `SELECT` and `WITH` statements are allowed
- **Read-only roles** — Connections are made with read-only Postgres roles enforced at the database level
- **10-second timeout** — All queries are killed after 10 seconds to prevent long-running accidental queries
- **Encrypted connections** — Connection strings are encrypted at rest with AES-256 (Fernet)
- **Your data never leaves your server** — Querli reads only your schema (table names, columns, types); query results go directly from your database to your browser

```python
# Every query passes through this validator before execution
FORBIDDEN = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC']

def validate_read_only(sql: str):
    upper = sql.upper().strip()
    if not upper.startswith('SELECT') and not upper.startswith('WITH'):
        raise SecurityError('Only SELECT queries allowed')
    for keyword in FORBIDDEN:
        if keyword in upper:
            raise SecurityError(f'Forbidden keyword: {keyword}')
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Dashboard, query UI, charts |
| Charts | Recharts | Interactive data visualizations |
| Backend | FastAPI (Python) | Async API + DB connector |
| App Database | Supabase (Postgres) | Users, connections, query history |
| DB Connector | SQLAlchemy + asyncpg | Connect to user's databases safely |
| AI | Groq API (llama-3.3-70b) | Natural language → SQL |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Hosting | Vercel (frontend) + Railway (backend) | Free tiers |

---

## Project Structure

```
querli/
├── app/                            # Next.js 14 App Router
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + animations
│   ├── dashboard/
│   │   └── page.tsx                # Main query interface
│   ├── connections/
│   │   ├── page.tsx                # Manage database connections
│   │   └── new/
│   │       └── page.tsx            # Add new connection
│   └── history/
│       └── page.tsx                # Query history
├── components/
│   ├── QueryInput.tsx              # Natural language input
│   ├── SQLPreview.tsx              # Generated SQL display
│   ├── ResultsTable.tsx            # Data table component
│   ├── ResultsChart.tsx            # Chart visualization
│   ├── SchemaExplorer.tsx          # DB schema browser
│   └── ConnectionForm.tsx          # Database connection form
├── lib/
│   ├── supabase.ts                 # Supabase client
│   └── api.ts                      # Backend API client
├── backend/                        # FastAPI application
│   ├── main.py                     # Entry point
│   ├── routers/
│   │   ├── queries.py              # Query generation + execution
│   │   ├── connections.py          # Connection management
│   │   └── history.py              # Query history
│   ├── services/
│   │   ├── schema_reader.py        # Read + cache DB schema
│   │   ├── sql_generator.py        # NL → SQL via Groq
│   │   ├── query_executor.py       # Safe read-only execution
│   │   └── chart_recommender.py    # AI picks best chart type
│   ├── security/
│   │   ├── sql_validator.py        # Validates SELECT-only
│   │   └── connection_encryptor.py # Fernet encryption for conn strings
│   ├── models/
│   │   └── schemas.py              # Pydantic models
│   └── db/
│       └── supabase.py             # App database client
├── tailwind.config.js
├── next.config.mjs
├── package.json
└── .env.example
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Database connections (encrypted at rest)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  db_type TEXT NOT NULL,               -- postgres | mysql | sqlite
  connection_string_encrypted TEXT NOT NULL,
  schema_cache JSONB,                  -- cached table/column metadata
  last_schema_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Query history
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  connection_id UUID REFERENCES connections(id),
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  results JSONB,
  chart_type TEXT,                     -- bar | line | pie | table
  execution_time_ms INTEGER,
  row_count INTEGER,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [Groq API key](https://console.groq.com) (free, 30 req/min)
- A Postgres, MySQL, or SQLite database to connect (or use the built-in demo)

### 1. Clone the repository

```bash
git clone https://github.com/MohammadAbbas393/querli.git
cd querli
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# AI
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key     # backup AI

# Supabase (app data)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Encryption (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your_fernet_key

# Demo database (optional — Neon free tier works great)
DEMO_DB_URL=postgres://user:pass@host/demo
```

### 5. Set up the database

Run the SQL schema in your Supabase SQL editor (see `db/schema.sql`).

### 6. Run locally

```bash
# Frontend (port 3000)
npm run dev

# Backend (port 8000)
cd backend && uvicorn main:app --reload
```

Open [http://localhost:3000](http://localhost:3000) and click **Try demo database** to test immediately.

---

## Core Application Flow

```
User connects database (connection string → encrypted + stored)
        ↓
Backend reads schema (table names, columns, types, foreign keys)
        ↓
Schema cached in Supabase
        ↓
User types: "Show me revenue by month for 2025"
        ↓
Backend sends schema + question to Groq (llama-3.3-70b)
        ↓
AI returns SQL query
        ↓
SQL validator checks it's SELECT-only (rejects if not)
        ↓
Query executes with 10s timeout on user's DB
        ↓
AI recommends best chart type (bar/line/pie/table)
        ↓
Results rendered as interactive chart + table
        ↓
Query saved to history
```

---

## AI SQL Generation

The core prompt that drives Querli's SQL generation:

```python
SYSTEM_PROMPT = """You are a SQL expert. Given a database schema and a natural
language question, generate a single PostgreSQL SELECT query.

Rules:
- ONLY generate SELECT statements. Never INSERT, UPDATE, DELETE, DROP.
- Use the exact table and column names from the schema provided.
- Add LIMIT 1000 to prevent huge result sets.
- Return ONLY the SQL query — no explanation, no markdown.
- If the question cannot be answered from the schema, return: IMPOSSIBLE
"""
```

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | $0/month | 1 connection, 50 queries/month, basic charts |
| Pro | $29/month | 5 connections, unlimited queries, all chart types, CSV export |
| Team | $49/month | Unlimited connections, shared dashboards, API access, Slack integration |

---

## Roadmap

- [ ] FastAPI backend implementation
- [ ] Schema reader (Postgres, MySQL, SQLite)
- [ ] Groq NL → SQL pipeline
- [ ] SQL safety validator
- [ ] Read-only query executor
- [ ] Chart type recommender
- [ ] Next.js dashboard (query UI, results, charts)
- [ ] Auth + connection management
- [ ] Demo database with Faker seed data
- [ ] CSV export
- [ ] Saved queries + team sharing
- [ ] Stripe billing integration
- [ ] MongoDB + BigQuery connectors

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

[MIT](./LICENSE) © 2026 Mohammad Abbas
