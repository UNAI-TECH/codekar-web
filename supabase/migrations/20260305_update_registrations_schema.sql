-- ============================================================
-- CODEKARX — Full Registrations Table Schema
-- ============================================================

drop table if exists public.registrations CASCADE;

create table public.registrations (
  id uuid not null default gen_random_uuid (),
  registration_type text not null,
  generated_code text null,
  full_name text not null,
  email text null,
  phone text not null,
  college text null,
  department text null,
  year_of_study integer null,
  track text null,
  project_name text null,
  team_name text null,
  team_leader_name text null,
  leader_email text null,
  leader_phone text null,
  member_2_name text null,
  member_3_name text null,
  member_4_name text null,
  amount numeric not null,
  payment_status text not null default 'pending'::text,
  zoho_payment_id text null,
  transaction_id text null,
  payer_phone text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  member_2 text null,
  member_3 text null,
  member_4 text null,
  zoho_payment_link_id text null,
  zoho_session_id text null,
  constraint registrations_pkey primary key (id),
  constraint registrations_generated_code_key unique (generated_code)
) TABLESPACE pg_default;

create index IF not exists idx_registrations_payment_status on public.registrations using btree (payment_status) TABLESPACE pg_default;
create index IF not exists idx_registrations_zoho_link_id on public.registrations using btree (zoho_payment_link_id) TABLESPACE pg_default;
create index IF not exists idx_registrations_zoho_session_id on public.registrations using btree (zoho_session_id) TABLESPACE pg_default;
create index IF not exists idx_registrations_generated_code on public.registrations using btree (generated_code) TABLESPACE pg_default;
create index IF not exists idx_registrations_email on public.registrations using btree (email) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service_role) to do everything
CREATE POLICY "service_role_all" ON public.registrations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated users to insert their own registrations (optional, but good practice)
CREATE POLICY "authenticated_insert" ON public.registrations
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow anon to read by generated_code
CREATE POLICY "anon_read_by_code" ON public.registrations
  FOR SELECT TO anon USING (generated_code IS NOT NULL);

-- Allow authenticated users to see their own registrations
CREATE POLICY "authenticated_select" ON public.registrations
  FOR SELECT TO authenticated USING (email = auth.jwt()->>'email');
