# TFR Admin & CMS — Setup

A small admin area lives at `/admin` for managing inquiries, editing public site copy/images, previewing changes before they go live, and managing team members.

## 1. Run the migrations

Open the Supabase SQL editor and run, **in order**:

1. `supabase/migrations/20260430_admin_cms.sql`
   - Adds `status`, `internal_notes`, `contacted_at`, `tags` to `tfr_inquiries`.
   - Creates the `site_content` table + auto-updating `updated_at` trigger.
   - Enables RLS for both tables and grants the right base privileges.
   - Creates the `site-content-images` storage bucket.

2. `supabase/migrations/20260430_fix_admin_grants.sql`
   - Restores `select/update` on `tfr_inquiries` for the `authenticated` role.
   - Grants `select` on `site_content` to `anon` and `insert/update` to `authenticated`.

3. `supabase/migrations/20260430_expand_site_content.sql`
   - Adds granular CMS keys for every editable element on About, Services, FW26 (Lookbook), and Contact, populated with the actual current copy.
   - Safe to re-run.

4. `supabase/migrations/20260430_cms_required.sql` _(new)_
   - Adds the `required` boolean column to `site_content`.
   - Marks the home hero headline / CTA label / CTA link as required so the editor blocks empty saves.

5. `supabase/migrations/20260430_admin_users.sql` _(new)_
   - Creates the `admin_users` table + RLS policies.
   - Seeds the owner row for `info@thefrontrow.vegas` (no-op if that user doesn't exist yet — see step 2).

6. `supabase/migrations/20260430_fix_admin_users_rls.sql` _(new)_
   - Replaces a recursive RLS policy on `admin_users` with a `SECURITY DEFINER` helper. Run this if your owner shows "no permissions" even though the row exists.

7. `supabase/migrations/20260430_models_submissions.sql` _(new — model casting form)_
   - Creates the `tfr_model_submissions` table + indexes + RLS.
   - Creates the private `tfr-model-photos` storage bucket.
   - Adds `view_models` and `edit_models` permission keys to the owner row.
   - Seeds the `models_intro_headline` and `models_intro_body` CMS keys.

After this, opening `/admin/content/about` (or any page) shows the actual current text in the editor — TFR can read it, type to change it, and hit "Save changes."

## 2. Create the owner user

Supabase dashboard → **Authentication** → **Users** → **Add user**:

- Email: `info@thefrontrow.vegas`
- Password: a temporary one
- ✅ Auto-confirm user

Then re-run migration `20260430_admin_users.sql` (or just the `INSERT … on conflict do update` block at the bottom). That seeds the `admin_users` row with `role = 'owner'` and full permissions.

She signs in at `/admin/login`, then immediately changes her password in `/admin/settings`.

To add additional team members, the owner uses `/admin/team/new` from inside the app — no SQL needed. See section 6.

## 3. Environment variables

Already configured from the inquiry form prompt — nothing new.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — used by `/api/inquire`, `/api/admin/team/invite`, and `/api/admin/team/[id]` (auth.admin operations only). Never sent to the browser.
- `RESEND_API_KEY` + `TFR_EMAIL_FROM` — used to send the inquirer confirmation, the new-inquiry alert, and team-invite emails.

## 4. What's at /admin

| Route                          | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `/admin/login`                 | Sign in. Forgot-password sends a Supabase reset email.                  |
| `/admin`                       | Inquiry dashboard — filter, paginate, export CSV, change status.        |
| `/admin/inquiries/[id]`        | Detail view — notes, tags, signed file links, reply.                    |
| `/admin/content`               | Form-based CMS — list of editable pages.                                |
| `/admin/content/[page]`        | Edit fields for a page; **per-field validation** + **Preview** button.  |
| `/admin/edit`                  | New: visual editor index.                                               |
| `/admin/edit/[slug]`           | New: click-to-edit preview of the public page.                          |
| `/admin/team`                  | Owner-only: list, invite, remove team members.                          |
| `/admin/team/new`              | Owner-only: invite form (sends email via Resend).                       |
| `/admin/team/[id]`             | Owner-only: edit a member's display name, permissions, owner notes.     |
| `/admin/settings`              | Change password, view account, sign out.                                |
| `/api/admin/inquiries/export`  | CSV export honoring the dashboard filters.                              |
| `/api/admin/content/revalidate`| Triggers ISR after a form-editor save.                                  |
| `/api/admin/content/preview`   | Sets/clears the preview cookie consumed by public pages.                |
| `/api/admin/content/save`      | Batch upsert + revalidate for the visual editor.                        |
| `/api/admin/team/invite`       | Owner-only: creates auth user + admin_users row + sends invite email.   |
| `/api/admin/team/[id]`         | Owner-only: PATCH (update) and DELETE (remove + cascade auth user).     |

## 5. Permissions model

Stored in the `admin_users` table (`role` + `permissions` JSONB).

| Permission        | Grants                                                                |
| ----------------- | --------------------------------------------------------------------- |
| `view_inquiries`  | Inquiries dashboard + detail view (read-only when no `edit_inquiries`)|
| `edit_inquiries`  | Status, notes, tags, archive, mark-as-contacted                       |
| `view_models`     | Model submissions list + detail (read-only when no `edit_models`)     |
| `edit_models`     | Status, notes, tags, archive, mark-as-contacted on a submission       |
| `view_content`    | `/admin/content` and `/admin/edit` (form + visual editors, read-only) |
| `edit_content`    | Save/Preview in either editor; upload images                          |
| `manage_team`     | `/admin/team` invite, edit, remove                                    |

The owner row (`role = 'owner'`) bypasses every permission check.

Enforcement is layered:

- **Middleware** (`middleware.ts`) gates `/admin/team`, `/admin/inquiries`, `/admin/content`, `/admin/edit`. Unauthorized users redirect back to `/admin?denied=<perm>` and see a toast.
- **Server components** (admin pages) re-check via `getAdminProfile()` and pass `canEdit` to interactive children to render read-only fallbacks.
- **API routes** (`team/invite`, `team/[id]`, `content/save`) verify the caller is the owner (or has `edit_content`) before mutating.
- **RLS** on `admin_users` is the last line of defense: only owners can read others' rows or write to the table.

`owner_notes` is only ever rendered inside `/admin/team/[id]` (server component) and is never returned in any API response.

## 6. Inviting a team member

1. Owner opens `/admin/team` → "+ Add member".
2. Enters their email + display name + ticks the permissions they should have.
3. On submit:
   - A Supabase Auth user is created with a randomly-generated temp password.
   - An `admin_users` row is inserted.
   - An invite email is sent via Resend with login URL, email, and temp password.
4. The new member signs in at `/admin/login` and changes their password from `/admin/settings`.

If the user already exists, the invite endpoint just upserts their `admin_users` row with the new permissions and skips the email.

If `RESEND_API_KEY` isn't configured, the temp password is shown to the owner once on the success screen so they can share it manually.

## 7. CMS hardening

- **Safe defaults**: `getPageContent()` returns a `Proxy` so any unknown key reads as `''`. Public pages also fall back to their hardcoded defaults when a CMS value is blank — empty saves cannot crash the site.
- **Per-field validation** in the form editor: required fields, URL fields (auto-prepends `https://`), image fields. The Save button is disabled while errors exist; a red message appears under each invalid field.
- **Preview before save**: the form editor's "Preview" button calls `/api/admin/content/preview` to set a short-lived `tfr_preview` cookie with the staged values, then opens the live page in a new tab. The public page reads the cookie server-side, but only applies it if the visitor has an authenticated admin session — so a stale cookie can never affect anonymous traffic. A yellow banner appears at the top of the previewed page with a "Stop preview" button.

## 8. Visual editor (`/admin/edit`)

- A click-to-edit mirror of the public page. Hovering any text or image wrapped in `<Editable>` shows a dashed gold outline; clicking opens an inline popover matched to the field type.
- Edits stage in `EditModeProvider` context. The bottom-right toolbar shows the unsaved-change count, "Discard all", and "Save all" → batch upsert via `/api/admin/content/save` + automatic ISR revalidation.
- v1 wraps every text/image field on Home, About, Services, and FW26. The full live design (the spotlight video, animation chrome, image columns, etc.) renders on the live page; the visual editor focuses on the editable bits and links out to "View live ↗".
- For arrays, layout, or fields not yet wrapped, the form editor at `/admin/content/[page]` remains the fallback.

## 9. Model casting form (`/models`)

Public talent-submission form, separate flow from `/inquire`.

- **Public route**: `/models` — multi-step form using the same step/transition pattern as `/inquire`. Headline + intro copy are CMS-driven (`models_intro_headline`, `models_intro_body`).
- **API**: `POST /api/models` — accepts `multipart/form-data`. Validates with Zod + re-derives age from DOB server-side; rejects under-18. Honeypot (`website` field) silently flags spam.
- **Photos**: 4 required slots (headshot / fullbody / profile L / profile R) plus up to 4 additional. Stored in the **private** `tfr-model-photos` bucket under `{submissionId}/{slot}.{ext}`. Admin views generate fresh 1-hour signed URLs every page load.
- **Stats**: persisted in cm + US shoe regardless of UI toggle. Form has ft/in ↔ cm and US/EU/UK toggles. The admin detail view has the same toggles.
- **Admin list (`/admin/models`)**: filters for status, agency, hair, eye, travel availability, age range, height range (cm), city contains, and full-text search (name / email / IG handle / city). Shows headshot thumbnail per row.
- **Admin detail (`/admin/models/[id]`)**: 2-column layout — left has the photo gallery (lightbox on click) plus identity / stats / sizing / appearance / experience / links / availability / closing. Right has status pill, "Mark as contacted", "Reply via email", archive, tags, and autosaving notes.
- **Permission gating**: `view_models` and `edit_models` (defined above). Owner gets both automatically. Team members get them by default unless toggled off in `/admin/team/[id]`.
- **Emails**: TFR receives a structured submission email with photo links (signed for 14 days) via Resend. Submitter receives the editorial confirmation.

## 10. Notes on choices

- **`@supabase/ssr`** is used in place of the deprecated `@supabase/auth-helpers-nextjs`.
- **Rich text** is a textarea that allows raw HTML (`<em>`, `<strong>`, `<a>`). TipTap was deemed overkill for a single-author CMS.
- **Inquiry attachments** are private. Detail views generate fresh 1-hour signed URLs every page load.
- **CSV export** flattens every detail key it finds across the result set into `details.<field>` columns.
- **Default inquiries date filter** is now "All time" so a fresh login shows everything; date / type / status / search filters can be combined and a "Clear all filters" button appears whenever any filter is active.
