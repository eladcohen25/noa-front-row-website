-- =============================================================
-- TFR Admin & CMS migration (run after the tfr_inquiries table exists)
-- =============================================================

-- Migration 1: extend tfr_inquiries with status, notes, contacted_at, tags
alter table public.tfr_inquiries
  add column if not exists status text not null default 'new'
    check (status in ('new','in_progress','contacted','closed_won','closed_lost','archived')),
  add column if not exists internal_notes text,
  add column if not exists contacted_at timestamptz,
  add column if not exists tags text[] default '{}';

create index if not exists tfr_inquiries_status_idx
  on public.tfr_inquiries (status);

-- Migration 2: site_content table
create table if not exists public.site_content (
  key text primary key,
  page text not null,
  label text not null,
  description text,
  type text not null check (type in ('text','textarea','richtext','image','url','number')),
  value text,
  sort_order int default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists site_content_page_sort_idx
  on public.site_content (page, sort_order);

create or replace function update_site_content_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function update_site_content_timestamp();

-- Migration 3: seed initial keys
insert into public.site_content (key, page, label, type, value, description, sort_order) values
  -- Home
  ('home_hero_headline', 'home', 'Hero headline', 'text',
    'Creative Direction & Experiential Production Studio',
    'Main headline overlay on homepage', 1),
  ('home_hero_image', 'home', 'Hero background image', 'image', null,
    'Recommended 2560×1440 or larger, 16:9', 2),
  ('home_hero_cta_label', 'home', 'CTA button text', 'text', 'INQUIRE NOW', null, 3),
  ('home_hero_cta_link', 'home', 'CTA button link', 'url', '/inquire', null, 4),

  -- About
  ('about_headline', 'about', 'Headline', 'text', null, null, 1),
  ('about_body', 'about', 'Body copy', 'richtext', null, null, 2),
  ('about_image', 'about', 'Featured image', 'image', null, null, 3),

  -- Services
  ('services_headline', 'services', 'Headline', 'text', null, null, 1),
  ('services_body', 'services', 'Body copy', 'richtext', null, null, 2),

  -- FW26 @ Bel-Aire
  ('fw26_headline', 'fw26', 'Event headline', 'text', null, null, 1),
  ('fw26_body', 'fw26', 'Event description', 'richtext', null, null, 2),
  ('fw26_image', 'fw26', 'Event image', 'image', null, null, 3),

  -- Contact / Footer
  ('contact_email', 'contact', 'Public contact email', 'text', null, null, 1),
  ('contact_instagram', 'contact', 'Instagram URL', 'url', 'https://instagram.com/thefrontrowlv', null, 2)
on conflict (key) do nothing;

-- Migration 4: RLS policies

-- tfr_inquiries: authenticated users can read + update via the admin app.
-- (the public POST API uses the service role key which bypasses RLS.)
alter table public.tfr_inquiries enable row level security;

drop policy if exists "authenticated read inquiries" on public.tfr_inquiries;
drop policy if exists "authenticated update inquiries" on public.tfr_inquiries;

create policy "authenticated read inquiries"
  on public.tfr_inquiries for select
  to authenticated using (true);

create policy "authenticated update inquiries"
  on public.tfr_inquiries for update
  to authenticated using (true);

-- Base table privileges — RLS only filters rows that the role is already
-- allowed to touch. Without these GRANTs the policies above are dead code.
grant select, update on public.tfr_inquiries to authenticated;

-- site_content: public read, authenticated write
alter table public.site_content enable row level security;

drop policy if exists "public read site content" on public.site_content;
drop policy if exists "authenticated update site content" on public.site_content;
drop policy if exists "authenticated insert site content" on public.site_content;

create policy "public read site content"
  on public.site_content for select
  to anon, authenticated using (true);

create policy "authenticated update site content"
  on public.site_content for update
  to authenticated using (true);

create policy "authenticated insert site content"
  on public.site_content for insert
  to authenticated with check (true);

-- Base table privileges (anon read for the public site, authenticated write for the CMS).
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

-- Storage bucket for site content images (public read, authenticated write).
insert into storage.buckets (id, name, public)
  values ('site-content-images', 'site-content-images', true)
  on conflict (id) do nothing;

-- Storage RLS policies for site-content-images
drop policy if exists "public read site content images" on storage.objects;
drop policy if exists "authenticated write site content images" on storage.objects;
drop policy if exists "authenticated update site content images" on storage.objects;
drop policy if exists "authenticated delete site content images" on storage.objects;

create policy "public read site content images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-content-images');

create policy "authenticated write site content images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-content-images');

create policy "authenticated update site content images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-content-images');

create policy "authenticated delete site content images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-content-images');
