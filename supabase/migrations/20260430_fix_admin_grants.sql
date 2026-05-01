-- Run against the existing DB to fix:
--   "permission denied for table tfr_inquiries"
--   "permission denied for table site_content"
--
-- RLS policies need matching base-table privileges for the role.
-- These grants restore the privileges that an earlier `revoke all` removed,
-- and ensure site_content has the right grants for anon read + authenticated write.

-- Inquiries: admin (authenticated) reads + updates rows. The public POST API
-- still uses the service role and bypasses RLS.
grant select, update on public.tfr_inquiries to authenticated;

-- Site content: public reads, authenticated writes.
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
