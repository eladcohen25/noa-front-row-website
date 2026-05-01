-- Run once if you already created an older (slim) tfr_model_submissions
-- without these columns. Safe to re-run: skips when column exists (PG 11+).
-- If create table fails, add columns manually or drop table + re-run 20260430_models_submissions.sql.

alter table public.tfr_model_submissions add column if not exists pronouns text;
-- pronoun question removed from public form; allow null for new rows.
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column pronouns drop not null';
exception
  when others then null;
end $$;
alter table public.tfr_model_submissions add column if not exists state_region text;
-- state/region question removed from public form; allow null for new rows.
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column state_region drop not null';
exception
  when others then null;
end $$;
alter table public.tfr_model_submissions add column if not exists country text;
alter table public.tfr_model_submissions add column if not exists is_adult boolean;
alter table public.tfr_model_submissions add column if not exists heritage text;
alter table public.tfr_model_submissions add column if not exists unions text[];
alter table public.tfr_model_submissions add column if not exists special_skills text[];
alter table public.tfr_model_submissions add column if not exists special_skills_notes text;
alter table public.tfr_model_submissions add column if not exists markings_notes text;
alter table public.tfr_model_submissions add column if not exists earliest_available date;

-- If gender_identity incorrectly had NOT NULL, allow optional gender:
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column gender_identity drop not null';
exception
  when others then null;
end $$;

-- bust/waist now allow Not sure → null.
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column bust_cm drop not null';
exception
  when others then null;
end $$;
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column waist_cm drop not null';
exception
  when others then null;
end $$;
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column hips_cm drop not null';
exception
  when others then null;
end $$;

-- hair_color / eye_color questions removed; allow null.
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column hair_color drop not null';
exception
  when others then null;
end $$;
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column eye_color drop not null';
exception
  when others then null;
end $$;

-- why_tfr is now optional on the public form.
do $$
begin
  execute 'alter table public.tfr_model_submissions alter column why_tfr drop not null';
exception
  when others then null;
end $$;

create index if not exists tfr_model_submissions_state_idx
  on public.tfr_model_submissions (state_region);
