# Half-life Bookstore

Minimalist, mobile-first bookstore built with Next.js App Router.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (`books`, `affiliate_products`, storage bucket `book-images`)

## Features

- Public marketplace page for used books and affiliate products
- Shared header/footer with mobile hamburger navigation
- Shopping cart with multi-item checkout and invoice creation
- Protected `/admin` dashboard with Supabase email/password sign-in
- Book inventory management with stock toggle/delete and multi-image uploads
- Affiliate product management with title, affiliate URL, multi-image URLs, and delete
- Invoice queue in admin for delivery status management
- Local Tiempos typography via `next/font/local`

## Setup

See [`setup.MD`](./setup.MD) for complete environment variables, SQL bootstrap script, and automation command.

## Run locally

```bash
npm install
npm run dev
```
