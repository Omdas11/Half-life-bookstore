# Half-life Bookstore

Minimalist, mobile-first bookstore built with Next.js App Router.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (`books`, `affiliate_products`, storage bucket `book-images`)

## Features

- Public marketplace page for used books and affiliate products
- Protected `/admin` dashboard with Supabase email/password sign-in
- Book inventory management with stock toggle and Supabase Storage image uploads
- Affiliate product management with title, affiliate URL, and direct image URL input
- Local Tiempos typography via `next/font/local`

## Setup

See [`setup.MD`](./setup.MD) for complete environment variables, SQL bootstrap script, and automation command.

## Run locally

```bash
npm install
npm run dev
```
