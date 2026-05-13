-- Half-life Bookstore Supabase bootstrap

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id bigserial primary key,
  title text not null,
  author text not null,
  price numeric(10,2) not null check (price >= 0),
  condition text not null,
  image_url text not null,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_products (
  id bigserial primary key,
  title text not null,
  affiliate_url text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id bigserial primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'delivered', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books
add column if not exists image_urls jsonb not null default '[]'::jsonb;

alter table public.affiliate_products
add column if not exists image_urls jsonb not null default '[]'::jsonb;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row
execute function public.set_updated_at();

drop trigger if exists affiliate_products_set_updated_at on public.affiliate_products;
create trigger affiliate_products_set_updated_at
before update on public.affiliate_products
for each row
execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.books enable row level security;
alter table public.affiliate_products enable row level security;
alter table public.invoices enable row level security;

-- Clean up old policies so script remains idempotent.
drop policy if exists "Admins can read own admin profile" on public.admin_users;
drop policy if exists "Public can read in-stock books" on public.books;
drop policy if exists "Admins can read all books" on public.books;
drop policy if exists "Admins can insert books" on public.books;
drop policy if exists "Admins can update books" on public.books;
drop policy if exists "Admins can delete books" on public.books;
drop policy if exists "Public can read affiliate products" on public.affiliate_products;
drop policy if exists "Admins can insert affiliate products" on public.affiliate_products;
drop policy if exists "Admins can update affiliate products" on public.affiliate_products;
drop policy if exists "Admins can delete affiliate products" on public.affiliate_products;
drop policy if exists "Public can insert invoices" on public.invoices;
drop policy if exists "Admins can read invoices" on public.invoices;
drop policy if exists "Admins can update invoices" on public.invoices;
drop policy if exists "Admins can delete invoices" on public.invoices;

create policy "Admins can read own admin profile"
on public.admin_users
for select
using (auth.uid() = user_id);

create policy "Public can read in-stock books"
on public.books
for select
to anon, authenticated
using (in_stock = true);

create policy "Admins can read all books"
on public.books
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can insert books"
on public.books
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can update books"
on public.books
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can delete books"
on public.books
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Public can read affiliate products"
on public.affiliate_products
for select
to anon, authenticated
using (true);

create policy "Admins can insert affiliate products"
on public.affiliate_products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can update affiliate products"
on public.affiliate_products
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can delete affiliate products"
on public.affiliate_products
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Public can insert invoices"
on public.invoices
for insert
to anon, authenticated
with check (true);

create policy "Admins can read invoices"
on public.invoices
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can update invoices"
on public.invoices
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins can delete invoices"
on public.invoices
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

update public.books
set image_urls = jsonb_build_array(image_url)
where image_url is not null and (image_urls is null or jsonb_array_length(image_urls) = 0);

update public.affiliate_products
set image_urls = jsonb_build_array(image_url)
where image_url is not null and (image_urls is null or jsonb_array_length(image_urls) = 0);

insert into storage.buckets (id, name, public)
values ('book-images', 'book-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read book images" on storage.objects;
drop policy if exists "Admins upload book images" on storage.objects;
drop policy if exists "Admins update book images" on storage.objects;
drop policy if exists "Admins delete book images" on storage.objects;

create policy "Public read book images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'book-images');

create policy "Admins upload book images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'book-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins update book images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'book-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
)
with check (
  bucket_id = 'book-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "Admins delete book images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'book-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
);
