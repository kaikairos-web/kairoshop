# KairoShop

Premium bike parts e-commerce with glassmorphism UI, Node.js/Express API, and Supabase auth + database.

## Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database/Auth:** Supabase (PostgreSQL + Auth + RLS)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run `supabase/policies.sql`.
4. Run `supabase/seed.sql` for sample products.
5. Create a public storage bucket named `product-images` (optional, for admin uploads).
6. Copy **Project URL**, **anon key**, and **service role key**.

### 2. Environment

```bash
cp .env.example .env
```

Fill in:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3000
```

### 3. Install & run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Create an admin user

1. Register via `/register.html`.
2. In Supabase SQL Editor:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

## Features

- User: register, login, forgot password, cart, checkout, wishlist, dashboard
- Admin: analytics, product CRUD, orders, users, reports with Chart.js
- Glassmorphism dark UI with neon cyan accents
- Responsive desktop / tablet / mobile layouts

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/products` | List products |
| GET | `/api/cart` | Get cart (auth) |
| POST | `/api/orders/checkout` | Checkout (auth) |
| GET | `/api/admin/analytics` | Admin stats |

## Project structure

```
/client     Static frontend
/server     Express API
/supabase   SQL schema, RLS, seed
```
