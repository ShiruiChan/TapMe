-- ============================================================
-- TapMe v2 — Initial Schema
-- ============================================================

-- orgs: мультитенантность (одна компания = одна org)
create table public.orgs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  created_at timestamptz not null default now()
);

-- profiles: расширение auth.users
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  department  text,
  org_id      uuid references public.orgs(id),
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- cards: данные цифровой визитки
create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  slug        text unique not null default substr(md5(gen_random_uuid()::text), 1, 8),
  name        text,
  role        text,
  company     text default 'Lory.Lab',
  tagline     text,
  bio         text,
  location    text,
  skills      text,
  email       text,
  phone       text,
  website     text,
  telegram    text,
  vk          text,
  instagram   text,
  linkedin    text,
  github      text,
  behance     text,
  color_hex   text not null default '6366f1',
  avatar_url  text,
  is_public   boolean not null default true,
  updated_at  timestamptz not null default now(),
  unique(user_id)
);

-- events: аналитика просмотров, сохранений, шарингов
create table public.events (
  id          bigint generated always as identity primary key,
  card_id     uuid not null references public.cards(id) on delete cascade,
  type        text not null check (type in ('view', 'save', 'share')),
  source      text check (source in ('qr', 'link', 'nfc', 'directory', 'direct')),
  visitor_id  text,
  created_at  timestamptz not null default now()
);

create index events_card_idx on public.events(card_id, created_at desc);

-- tabs: конфигурация модульных вкладок
create table public.tabs (
  id       uuid primary key default gen_random_uuid(),
  org_id   uuid references public.orgs(id),
  key      text not null,
  title    text not null,
  icon     text,
  position int not null default 0,
  scope    text not null default 'both' check (scope in ('mobile', 'desktop', 'both')),
  enabled  boolean not null default true,
  config   jsonb not null default '{}'::jsonb,
  unique(org_id, key)
);

-- aggregated stats view
create view public.card_stats as
select
  card_id,
  count(*) filter (where type = 'view')  as views,
  count(*) filter (where type = 'save')  as saves,
  count(*) filter (where type = 'share') as shares,
  count(*) filter (where type = 'view' and created_at >= now() - interval '7 days') as views_week
from public.events
group by card_id;

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger cards_updated_at before update on public.cards
  for each row execute function public.update_updated_at();
