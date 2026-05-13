# Half-life Bookstore Supabase Setup

## Required environment variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-jwt-from-project-api-settings>
```

For automation script execution, also export:

```bash
SUPABASE_DB_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

## Auth requirement for `/admin`

1. In Supabase Auth, create a user account for admin access (email/password).
2. After user creation, add that user to `public.admin_users`:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@example.com';
```

Only users present in `public.admin_users` can create/update inventory and affiliate data.

## Supabase automation script

Run from repo root:

```bash
./scripts/apply-supabase-setup.sh
```

## Complete SQL setup script

The canonical SQL bootstrap is maintained in:

- [`supabase/setup.sql`](./supabase/setup.sql)

It now includes:

- multi-image support (`image_urls`) for books and affiliate products
- `invoices` table for cart checkout and delivery workflow
- invoice RLS policies (public insert, admin read/update/delete)
