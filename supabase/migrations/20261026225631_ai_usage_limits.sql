-- No operational records, questions, answers or raw IPs are stored here.
create table public.demo_ai_usage (
  bucket text primary key,
  hits integer not null default 0 check (hits >= 0),
  expires_at timestamptz not null
);
create index demo_ai_usage_expiry_idx on public.demo_ai_usage (expires_at);
alter table public.demo_ai_usage enable row level security;
revoke all on public.demo_ai_usage from public, anon, authenticated;
grant select, insert, update, delete on public.demo_ai_usage to service_role;

create function public.consume_demo_ai_quota(p_client_hash text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_day timestamptz := date_trunc('day', v_now at time zone 'UTC') at time zone 'UTC';
  v_window timestamptz := to_timestamp(floor(extract(epoch from v_now) / 600) * 600);
  v_global text := 'salazar-demo-ai:day:' || extract(epoch from v_day)::bigint;
  v_client text;
  v_global_hits integer;
  v_client_hits integer;
  v_retry integer;
begin
  if p_client_hash is null or p_client_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid client hash' using errcode = '22023';
  end if;
  v_client := 'salazar-demo-ai:ip:' || p_client_hash || ':' || extract(epoch from v_window)::bigint;

  -- All calls lock the project bucket first; concurrent serverless instances cannot overspend.
  insert into public.demo_ai_usage (bucket, expires_at)
    values (v_global, v_day + interval '1 day') on conflict do nothing;
  select hits into v_global_hits from public.demo_ai_usage where bucket = v_global for update;
  if v_global_hits >= 200 then
    v_retry := greatest(1, ceil(extract(epoch from v_day + interval '1 day' - v_now))::integer);
    return jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry);
  end if;

  insert into public.demo_ai_usage (bucket, expires_at)
    values (v_client, v_window + interval '10 minutes') on conflict do nothing;
  select hits into v_client_hits from public.demo_ai_usage where bucket = v_client for update;
  if v_client_hits >= 12 then
    v_retry := greatest(1, ceil(extract(epoch from v_window + interval '10 minutes' - v_now))::integer);
    return jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry);
  end if;

  update public.demo_ai_usage set hits = hits + 1 where bucket in (v_global, v_client);
  delete from public.demo_ai_usage where expires_at < v_now - interval '1 day';
  return jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
end;
$$;

revoke all on function public.consume_demo_ai_quota(text) from public, anon, authenticated;
grant execute on function public.consume_demo_ai_quota(text) to service_role;
