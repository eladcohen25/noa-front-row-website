-- Mark certain CMS fields as required so the editor blocks empty saves.
-- Idempotent; safe to re-run.

alter table public.site_content
  add column if not exists required boolean not null default false;

update public.site_content
  set required = true
  where key in (
    'home_hero_headline',
    'home_hero_cta_label',
    'home_hero_cta_link'
  );
