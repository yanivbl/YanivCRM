alter table public.leads enable row level security;

create policy "leads_select_own"
  on public.leads for select
  using (user_id = auth.uid());

create policy "leads_insert_own"
  on public.leads for insert
  with check (user_id = auth.uid());

create policy "leads_update_own"
  on public.leads for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "leads_delete_own"
  on public.leads for delete
  using (user_id = auth.uid());
