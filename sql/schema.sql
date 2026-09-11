-- =========================================================
-- Certificate Studio — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- 1. certificates
--    One row per certificate ever generated
-- =========================================================

create table if not exists public.certificates (
  id                 uuid primary key default gen_random_uuid(),

  -- Auto-incrementing certificate reference number
  ref_no             bigserial,

  -- Example: 000001, 000002, 000003
  ref_id             text generated always as (
    '' || lpad(ref_no::text, 6, '0')
  ) stored,

  -- Certificate information
  participant_name   text not null,
  user_id            text not null,
  course_title       text not null,
  certificate_date   text not null,

  -- Snapshot of the wording used when the certificate was created.
  -- Editing the shared wording later will NOT change old certificates.
  presented_text     text not null default 'This certificate is presented to',

  completing_text    text not null default 'for completing the course titled',

  on_text            text not null default 'On:',

  by_text            text not null default 'conducted by',

  facility_text      text not null default 'Sarawak Energy Learning Centre',

  div_text           text not null default 'Learning & Development and Capability Management Division',

  -- Certificate status
  -- ACTIVE  = normal certificate
  -- DELETED = certificate has been deleted/voided but record is retained
  status             text not null default 'ACTIVE'
                     check (status in ('ACTIVE', 'DELETED')),

  -- Record creation time
  created_at         timestamptz not null default now()
);


-- =========================================================
-- 2. Add new columns to an existing certificates table
--    Safe to run even if the columns already exist
-- =========================================================

alter table public.certificates
  add column if not exists user_id text;

alter table public.certificates
  add column if not exists certificate_date text;

alter table public.certificates
  add column if not exists on_text text
  not null default 'On:';

alter table public.certificates
  add column if not exists facility_text text
  not null default 'Sarawak Energy Learning Centre';

-- Add status column for soft delete
alter table public.certificates
  add column if not exists status text
  not null default 'ACTIVE';


-- =========================================================
-- 3. Make sure existing status values are valid
-- =========================================================

update public.certificates
set status = 'ACTIVE'
where status is null
   or status not in ('ACTIVE', 'DELETED');


-- =========================================================
-- 4. Add status constraint
-- =========================================================

alter table public.certificates
  drop constraint if exists certificates_status_check;

alter table public.certificates
  add constraint certificates_status_check
  check (status in ('ACTIVE', 'DELETED'));


-- =========================================================
-- 5. Index
-- =========================================================

create index if not exists certificates_created_at_idx
  on public.certificates (created_at desc);


-- Index for certificate status
create index if not exists certificates_status_idx
  on public.certificates (status);


-- =========================================================
-- 6. Row Level Security — certificates
-- =========================================================

alter table public.certificates enable row level security;

drop policy if exists "internal tool full access"
  on public.certificates;

create policy "internal tool full access"
  on public.certificates
  for all
  using (true)
  with check (true);


-- =========================================================
-- 7. certificate_settings
--    Single shared row for the
--    "Change other wordings" screen
-- =========================================================

create table if not exists public.certificate_settings (
  id                int primary key default 1,

  presented_text    text not null
    default 'This certificate is presented to',

  completing_text   text not null
    default 'for completing the course titled',

  on_text           text not null
    default 'On:',

  by_text           text not null
    default 'conducted by',

  facility_text     text not null
    default 'Sarawak Energy Learning Centre',

  div_text          text not null
    default 'Learning & Development and Capability Management Division',

  updated_at        timestamptz not null default now(),

  constraint certificate_settings_single_row
    check (id = 1)
);


-- =========================================================
-- 8. Add new wording columns to an existing
--    certificate_settings table
-- =========================================================

alter table public.certificate_settings
  add column if not exists on_text text
  not null default 'On:';

alter table public.certificate_settings
  add column if not exists facility_text text
  not null default 'Sarawak Energy Learning Centre';


-- =========================================================
-- 9. Create the single settings row
-- =========================================================

insert into public.certificate_settings (id)
values (1)
on conflict (id) do nothing;


-- =========================================================
-- 10. Row Level Security — certificate_settings
-- =========================================================

alter table public.certificate_settings enable row level security;

drop policy if exists "internal tool full access"
  on public.certificate_settings;

create policy "internal tool full access"
  on public.certificate_settings
  for all
  using (true)
  with check (true);


-- =========================================================
-- 11. OPTIONAL — Create a helper function for soft delete
-- =========================================================

create or replace function public.soft_delete_certificate(
  certificate_id uuid
)
returns void
language sql
security invoker
as $$
  update public.certificates
  set status = 'DELETED'
  where id = certificate_id;
$$;