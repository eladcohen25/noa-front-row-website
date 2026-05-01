-- =============================================================
-- Expand site_content with granular keys for every editable bit
-- on About, Services, FW26 (Lookbook), and Contact.
--
-- The previous seed used a single "_headline" / "_body" per page,
-- which made the editor blank. This migration replaces those
-- under-specified placeholders with granular keys whose default
-- VALUES are the actual current page copy. So when TFR opens
-- /admin/content/about she sees what's on the live site and can
-- type to edit it.
--
-- Safety: the destructive DELETE only removes the OLD seed rows
-- if their value is still null (i.e. she has never edited them).
-- Any edits she's made are preserved.
-- =============================================================

-- 1. Drop unused legacy seed rows (only if untouched)
delete from public.site_content
  where key in (
    'about_headline','about_body','about_image',
    'services_headline','services_body',
    'fw26_headline','fw26_body','fw26_image',
    'contact_email','contact_instagram'
  )
  and value is null;

delete from public.site_content
  where key = 'contact_instagram'
  and value = 'https://instagram.com/thefrontrowlv';

-- 2. About page (12 fields)
insert into public.site_content (key, page, label, type, value, description, sort_order) values
  ('about_title_part1', 'about', 'Headline — main', 'text',
    'A Fashion-First Production Studio Shaping ',
    'First half of the headline (regular weight). Trailing space is intentional.', 1),
  ('about_title_part2', 'about', 'Headline — italic', 'text',
    'Culture Through Experience.',
    'Second half of the headline (italic).', 2),
  ('about_studio_label', 'about', '"The Studio" label', 'text',
    'The Studio', null, 3),
  ('about_studio_body', 'about', 'Studio paragraph', 'textarea',
    'The Front Row is a creative studio specializing in fashion-led experiences, visual storytelling, and cultural moments. Blending runway, styling, and environment design into editorial-grade productions.',
    null, 4),
  ('about_image_1', 'about', 'First image (hero rack)', 'image', null,
    'Wide image shown above the founder block.', 5),
  ('about_founder_label', 'about', '"Founder" label', 'text', 'Founder', null, 6),
  ('about_founder_name', 'about', 'Founder name', 'text', 'Noa Cohen', null, 7),
  ('about_founder_role', 'about', 'Founder role', 'text', 'Creative Director & Stylist', null, 8),
  ('about_founder_email', 'about', 'Founder email', 'text', 'noa@thefrontrow.vegas', null, 9),
  ('about_founder_bio', 'about', 'Founder bio', 'textarea',
    'Noa Cohen is a creative director and stylist working at the intersection of fashion, experience, and visual storytelling. With a background in business and marketing, Noa founded The Front Row to create editorial-grade environments that bring runway energy into real-world spaces. Her work centers on narrative-driven styling, immersive production, and culturally relevant fashion experiences.',
    null, 10),
  ('about_image_2', 'about', 'Second image', 'image', null,
    'Wide image shown after the founder bio.', 11),
  ('about_dates', 'about', 'Event dates list', 'textarea',
    E'Oct 6 | Las Vegas | Fashion Week Watch Party\nJan 28 | Bel-Aire Lounge | A Style Experience',
    'One date per line. Format: "Date | Location | Title".', 12)
on conflict (key) do nothing;

-- 3. Services page (16 fields)
insert into public.site_content (key, page, label, type, value, description, sort_order) values
  ('services_headline_italic', 'services', 'Page heading', 'text', 'Services',
    'The italic "Services" heading at the top.', 1),
  ('services_intro', 'services', 'Intro line', 'textarea',
    'Rooted in fashion, executed like editorial, experienced in real life.',
    null, 2),

  ('services_s1_title', 'services', 'Section 1 — Title', 'text',
    'Experiential Production', null, 10),
  ('services_s1_bullets', 'services', 'Section 1 — Bullets', 'textarea',
    E'End-to-end concept + execution\nRunway integration\nGuest flow & environment design',
    'One bullet per line.', 11),
  ('services_s1_body', 'services', 'Section 1 — Description', 'textarea',
    'We oversee execution from idea to reality. The Front Row produces immersive experiences from concept to completion. Managing production, spatial design, and runway integration with precision.',
    null, 12),

  ('services_s2_title', 'services', 'Section 2 — Title', 'text',
    'Creative Direction', null, 20),
  ('services_s2_bullets', 'services', 'Section 2 — Bullets', 'textarea',
    E'Editorial concept development\nCampaign & shoot direction\nVisual identity & storytelling',
    'One bullet per line.', 21),
  ('services_s2_body', 'services', 'Section 2 — Description', 'textarea',
    'We develop the concept, narrative, and visual language behind each project — from brand campaigns and editorial shoots to full-scale experiences.',
    null, 22),

  ('services_s3_title', 'services', 'Section 3 — Title', 'text',
    'Experiential Programming', null, 30),
  ('services_s3_bullets', 'services', 'Section 3 — Bullets', 'textarea',
    E'On going and project based\nRunway & event programming\nGuest experience design',
    'One bullet per line.', 31),
  ('services_s3_body', 'services', 'Section 3 — Description', 'textarea',
    'We translate creative direction into live experiences — shaping how an event unfolds, from runway structure to pacing, energy, and audience interaction.',
    null, 32),

  ('services_s4_title', 'services', 'Section 4 — Title', 'text',
    'Brand & Runway Integration', null, 40),
  ('services_s4_bullets', 'services', 'Section 4 — Bullets', 'textarea',
    E'Runway Partners\nSponsor placements\nGuest activations\nStrategic partnerships',
    'One bullet per line.', 41),
  ('services_s4_body', 'services', 'Section 4 — Description', 'textarea',
    'We create opportunities for brands to live inside the experience — from runway partnerships and styled product placement to immersive activations and sponsor visibility woven throughout the event.',
    null, 42),

  ('services_closing_1', 'services', 'Closing line 1', 'textarea',
    'We assemble and direct creative teams — including models, hair and makeup artists, and production support — to execute each experience with editorial consistency and visual cohesion.',
    null, 50),
  ('services_closing_2', 'services', 'Closing line 2', 'textarea',
    'Designed to be felt in person and live beyond one moment',
    null, 51)
on conflict (key) do nothing;

-- 4. FW26 / Lookbook (12 fields)
insert into public.site_content (key, page, label, type, value, description, sort_order) values
  ('fw26_hero_label', 'fw26', 'Hero — small label', 'text', 'Show', null, 1),
  ('fw26_hero_title', 'fw26', 'Hero — main title', 'text', 'TFR FW26', null, 2),
  ('fw26_hero_cta', 'fw26', 'Hero — CTA text', 'text', 'Watch The TFR FW26 Film', null, 3),

  ('fw26_statement_p1', 'fw26', 'Editorial statement — paragraph 1', 'textarea',
    'A lesson in restraint.', null, 10),
  ('fw26_statement_p2', 'fw26', 'Editorial statement — paragraph 2', 'textarea',
    'Life teaches us many lessons, this runway curation explores the lesson in restraint or the journey (masa) one goes through to find their truly realized self.',
    null, 11),
  ('fw26_statement_p3', 'fw26', 'Editorial statement — paragraph 3', 'textarea',
    'Beginning guarded and undone to eventually finding a minimalistic sophistication. Knowing you carry the confidence not the clothes.',
    null, 12),
  ('fw26_statement_author', 'fw26', 'Statement byline', 'text', 'Noa Cohen', null, 13),

  ('fw26_fittings_date', 'fw26', 'Fittings — date', 'text', '01.21.2026', null, 20),
  ('fw26_fittings_title', 'fw26', 'Fittings — title', 'text', 'FITTINGS', null, 21),

  ('fw26_details_date', 'fw26', 'Details — date', 'text', '01.28.2026', null, 30),
  ('fw26_details_title', 'fw26', 'Details — title', 'text', 'DETAILS', null, 31),

  ('fw26_footer_text', 'fw26', 'Footer headline', 'textarea',
    'Editorial experiences in real life',
    'Big white headline at the bottom of the page.', 40)
on conflict (key) do nothing;

-- 5. Contact page (11 fields)
insert into public.site_content (key, page, label, type, value, description, sort_order) values
  ('contact_headline', 'contact', 'Page heading', 'text', 'Contact', null, 1),

  ('contact_c1_name', 'contact', 'Person 1 — Name', 'text', 'Noa Cohen', null, 10),
  ('contact_c1_role', 'contact', 'Person 1 — Role', 'text', 'Founder & Creative Director', null, 11),
  ('contact_c1_email', 'contact', 'Person 1 — Email', 'text', 'noa@thefrontrow.vegas', null, 12),
  ('contact_c1_instagram_handle', 'contact', 'Person 1 — Instagram handle', 'text', '@noacohen.23', null, 13),
  ('contact_c1_instagram_url', 'contact', 'Person 1 — Instagram URL', 'url',
    'https://www.instagram.com/noacohen.23', null, 14),

  ('contact_c2_name', 'contact', 'Person 2 — Name', 'text', 'THE FRONT ROW', null, 20),
  ('contact_c2_role', 'contact', 'Person 2 — Role', 'text', '', 'Leave blank to hide.', 21),
  ('contact_c2_email', 'contact', 'Person 2 — Email', 'text', 'info@thefrontrow.vegas', null, 22),
  ('contact_c2_instagram_handle', 'contact', 'Person 2 — Instagram handle', 'text', '@thefrontrowlv', null, 23),
  ('contact_c2_instagram_url', 'contact', 'Person 2 — Instagram URL', 'url',
    'https://www.instagram.com/thefrontrowlv', null, 24)
on conflict (key) do nothing;
