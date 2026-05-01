-- =============================================================
-- Model casting submissions table + storage bucket + RLS.
-- Separate from tfr_inquiries: different audience, different fields.
-- =============================================================

create table if not exists public.tfr_model_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identity
  full_name text not null,
  email text not null,
  phone text not null,
  gender_identity text not null,
  city text not null,
  date_of_birth date not null,
  -- Age locked at submission time (computed in API). Plain int so it
  -- can be indexed; postgres rejects generated cols using age() because
  -- age() reads now() and is therefore not immutable.
  age_at_submission int not null,

  -- Stats (always stored in cm; UI handles unit toggle)
  height_cm numeric(5,2) not null,
  bust_cm numeric(5,2) not null,
  waist_cm numeric(5,2) not null,
  hips_cm numeric(5,2) not null,

  -- Sizing
  size_tops text not null,
  size_bottoms text not null,
  size_dress_suit text not null,
  shoe_size_us numeric(4,1) not null,

  -- Appearance
  hair_color text not null,
  eye_color text not null,

  -- Experience
  modeling_experience text not null,
  has_agency boolean not null,
  agency_name text,

  -- Photos
  headshot_url text not null,
  fullbody_url text not null,
  profile_left_url text not null,
  profile_right_url text not null,
  additional_photo_urls text[] default '{}',

  -- Links
  instagram_handle text not null,
  tiktok_handle text,
  portfolio_url text,

  -- Availability
  travel_availability text not null,

  -- Closing
  why_tfr text,
  how_heard text not null,
  additional_notes text,

  -- Admin / workflow
  status text not null default 'new'
    check (status in ('new','shortlisted','contacted','signed','passed','archived')),
  internal_notes text,
  tags text[] default '{}',
  contacted_at timestamptz,

  -- Honeypot
  flagged_spam boolean default false
);

create index if not exists tfr_model_submissions_created_idx
  on public.tfr_model_submissions (created_at desc);
create index if not exists tfr_model_submissions_status_idx
  on public.tfr_model_submissions (status);
create index if not exists tfr_model_submissions_age_idx
  on public.tfr_model_submissions (age_at_submission);
create index if not exists tfr_model_submissions_height_idx
  on public.tfr_model_submissions (height_cm);
create index if not exists tfr_model_submissions_city_idx
  on public.tfr_model_submissions (city);

-- Lock down: writes go through the service role; admins read/update via session.
revoke all on public.tfr_model_submissions from anon;
grant select, update on public.tfr_model_submissions to authenticated;
grant all on public.tfr_model_submissions to service_role;

alter table public.tfr_model_submissions enable row level security;

drop policy if exists "authenticated read models" on public.tfr_model_submissions;
drop policy if exists "authenticated update models" on public.tfr_model_submissions;

create policy "authenticated read models"
  on public.tfr_model_submissions for select
  to authenticated using (true);

create policy "authenticated update models"
  on public.tfr_model_submissions for update
  to authenticated using (true);

-- Storage bucket for model photos. Private read; signed URLs only.
insert into storage.buckets (id, name, public)
  values ('tfr-model-photos', 'tfr-model-photos', false)
on conflict (id) do nothing;

-- New permission keys default to true for the owner; team members
-- inherit only if they previously had no row.
update public.admin_users
  set permissions = permissions
    || '{"view_models": true, "edit_models": true}'::jsonb
  where role = 'owner' or permissions->>'view_models' is null;

-- CMS seed rows for the public /models page header.
insert into public.site_content (key, page, label, type, value, sort_order)
values
  ('models_intro_headline', 'models', 'Models page headline', 'text',
    'Cast with The Front Row', 1),
  ('models_intro_body', 'models', 'Models page body copy', 'richtext',
    'Submit your details and recent photos. We review every submission and reach out when there''s a fit for an upcoming production.', 2)
on conflict (key) do nothing;
