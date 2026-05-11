# Half-life Bookstore

Minimalist, mobile-first bookstore built with Next.js App Router.

## Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (`books` table)

## Supabase setup

Copy `.env.example` to `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Expected `books` table fields:

- `id`
- `title`
- `author`
- `price`
- `condition`
- `image_url`
- `is_affiliate`
- `link`

## Run locally

```bash
npm install
npm run dev
```
