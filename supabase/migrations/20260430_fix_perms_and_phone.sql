-- Run this against an existing tfr_inquiries table to:
-- 1) Grant the service_role explicit privileges (fixes "permission denied for table")
-- 2) Make phone optional

grant all on public.tfr_inquiries to service_role;
revoke all on public.tfr_inquiries from anon, authenticated;

alter table public.tfr_inquiries
  alter column phone drop not null;
