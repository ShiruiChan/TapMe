-- ============================================================
-- TapMe v2 — Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cards    enable row level security;
alter table public.events   enable row level security;
alter table public.tabs     enable row level security;
alter table public.orgs     enable row level security;

-- orgs: любой авторизованный видит свою org
create policy "orgs_select_member" on public.orgs for select
  using (id in (select org_id from public.profiles where id = auth.uid()));

-- profiles: видишь только коллег своей org
create policy "profiles_select_same_org" on public.profiles for select
  using (
    org_id is not null and
    org_id = (select org_id from public.profiles where id = auth.uid())
    or id = auth.uid()
  );
create policy "profiles_insert_self" on public.profiles for insert
  with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- cards: владелец — полный доступ; публичные — чтение для всех
create policy "cards_owner_all" on public.cards for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cards_public_read" on public.cards for select
  using (is_public = true);

-- events: вставка — любой (анонимный трекинг), чтение — только владелец карточки
create policy "events_insert_any" on public.events for insert
  with check (true);
create policy "events_owner_read" on public.events for select
  using (
    card_id in (select id from public.cards where user_id = auth.uid())
  );

-- tabs: чтение конфигурации вкладок для своей org (или глобальных)
create policy "tabs_select_org" on public.tabs for select
  using (
    org_id is null or
    org_id = (select org_id from public.profiles where id = auth.uid())
  );
