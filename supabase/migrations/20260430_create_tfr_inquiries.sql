-- TFR inquiry submissions table

create table if not exists public.tfr_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  inquirer_type text not null check (inquirer_type in ('hotel','club','brand','creative','community')),

  -- Contact
  name text not null,
  email text not null,
  phone text,
  city text not null,
  how_heard text,

  -- Branch payload (flexible)
  details jsonb not null default '{}'::jsonb,

  -- Optional uploads
  file_urls text[] default '{}',

  -- Optional open note
  additional_notes text,

  -- Honeypot trip
  flagged_spam boolean default false
);

create index if not exists tfr_inquiries_created_at_idx
  on public.tfr_inquiries (created_at desc);
create index if not exists tfr_inquiries_inquirer_type_idx
  on public.tfr_inquiries (inquirer_type);

-- Lock down RLS — server writes via service role only.
alter table public.tfr_inquiries enable row level security;

-- No public insert/select policies. The service role bypasses RLS automatically.

-- Grant explicit privileges to the service_role (bypass RLS) and revoke from anon/authenticated.
grant all on public.tfr_inquiries to service_role;
revoke all on public.tfr_inquiries from anon, authenticated;

-- Storage bucket for uploads (private)
insert into storage.buckets (id, name, public)
  values ('tfr-inquiry-uploads', 'tfr-inquiry-uploads', false)
  on conflict (id) do nothing;
