-- Global leaderboard for the website (GitHub Pages) version of Coin Crawl.
-- Run this once in your Supabase project: SQL Editor > New query > paste > Run.
-- Then copy the Project URL and the anon public key into site/config.js.
--
-- Players never write to the table directly. They call submit_score(),
-- which checks a per-device secret (so nobody can overwrite your row),
-- validates the name and rejects scores that can't be real.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.scores (
  player_id    uuid primary key,
  secret_hash  text not null,
  name         text not null check (name ~ '^[A-Za-z0-9 _.-]{2,16}$'),
  deepest      int  not null default 0 check (deepest between 0 and 5000),
  abyss        int  not null default 0 check (abyss between 0 and 1000),
  rush         int  not null default 0 check (rush between 0 and 10),
  titan        int  not null default 0 check (titan between 0 and 25),
  stars        int  not null default 0 check (stars between 0 and 100000),
  cls          text check (char_length(cls) <= 40),
  title        text check (char_length(title) <= 40),
  play_seconds int  not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.scores enable row level security;

-- Anyone can read the board, but not the secret hashes.
drop policy if exists "anyone can read scores" on public.scores;
create policy "anyone can read scores" on public.scores for select to anon, authenticated using (true);
revoke all on public.scores from anon, authenticated;
grant select (player_id, name, deepest, abyss, rush, titan, stars, cls, title, updated_at) on public.scores to anon, authenticated;

create or replace function public.submit_score(
  p_id uuid, p_secret text, p_name text,
  p_deepest int default null, p_abyss int default null, p_rush int default null, p_titan int default null,
  p_stars int default null, p_cls text default null, p_title text default null, p_play int default null
) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  h text := encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex');
  cur public.scores;
begin
  if p_secret is null or length(p_secret) < 32 then raise exception 'bad secret'; end if;
  if p_name is null or p_name !~ '^[A-Za-z0-9 _.-]{2,16}$' then raise exception 'bad name'; end if;
  -- a floor takes at least a few seconds, so very deep floors need real play time
  if coalesce(p_deepest, 0) > greatest(30, coalesce(p_play, 0) / 4) then raise exception 'implausible score'; end if;

  select * into cur from public.scores where player_id = p_id;
  if found then
    if cur.secret_hash <> h then raise exception 'not your score'; end if;
    if now() - cur.updated_at < interval '10 seconds' then return; end if; -- light rate limit
    update public.scores set
      name = p_name,
      deepest = greatest(cur.deepest, coalesce(p_deepest, 0)),
      abyss = greatest(cur.abyss, coalesce(p_abyss, 0)),
      rush = greatest(cur.rush, coalesce(p_rush, 0)),
      titan = greatest(cur.titan, coalesce(p_titan, 0)),
      stars = greatest(cur.stars, coalesce(p_stars, 0)),
      cls = coalesce(left(p_cls, 40), cur.cls),
      title = coalesce(left(p_title, 40), cur.title),
      play_seconds = greatest(cur.play_seconds, coalesce(p_play, 0)),
      updated_at = now()
    where player_id = p_id;
  else
    insert into public.scores (player_id, secret_hash, name, deepest, abyss, rush, titan, stars, cls, title, play_seconds)
    values (p_id, h, p_name, coalesce(p_deepest, 0), coalesce(p_abyss, 0), coalesce(p_rush, 0), coalesce(p_titan, 0),
            coalesce(p_stars, 0), left(p_cls, 40), left(p_title, 40), coalesce(p_play, 0));
  end if;
end $$;

revoke all on function public.submit_score from public;
grant execute on function public.submit_score to anon, authenticated;

-- Save transfer between devices: one device uploads its save and gets a
-- 6-character code; another device redeems the code within 30 minutes.
-- Codes work once. Nobody can list or read transfers directly.
create table if not exists public.transfers (
  code       text primary key,
  data       text not null check (length(data) <= 400000),
  created_at timestamptz not null default now()
);
alter table public.transfers enable row level security;
revoke all on public.transfers from anon, authenticated;

create or replace function public.create_transfer(p_data text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
  b bytea;
  i int;
begin
  if p_data is null or length(p_data) > 400000 then raise exception 'save too big'; end if;
  delete from public.transfers where created_at < now() - interval '30 minutes';
  if (select count(*) from public.transfers) > 5000 then raise exception 'busy, try again soon'; end if;
  loop
    b := extensions.gen_random_bytes(6);
    c := '';
    for i in 0..5 loop c := c || substr(alphabet, 1 + (get_byte(b, i) % 32), 1); end loop;
    exit when not exists (select 1 from public.transfers where code = c);
  end loop;
  insert into public.transfers (code, data) values (c, p_data);
  return c;
end $$;

create or replace function public.take_transfer(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare d text;
begin
  delete from public.transfers
  where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'))
    and created_at > now() - interval '30 minutes'
  returning data into d;
  return d; -- null when the code is wrong, used or expired
end $$;

revoke all on function public.create_transfer from public;
revoke all on function public.take_transfer from public;
grant execute on function public.create_transfer to anon, authenticated;
grant execute on function public.take_transfer to anon, authenticated;
