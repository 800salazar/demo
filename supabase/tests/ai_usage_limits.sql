-- Run ONLY on a disposable local/test database after applying migrations.
-- Everything rolls back, including counters. Not intended for a production quota store.
begin;

do $$
begin
  if has_function_privilege('anon', 'public.consume_demo_ai_quota(text)', 'execute')
    or has_function_privilege('authenticated', 'public.consume_demo_ai_quota(text)', 'execute') then
    raise exception 'Public roles must not execute quota RPC';
  end if;
  if has_table_privilege('anon', 'public.demo_ai_usage', 'select')
    or has_table_privilege('authenticated', 'public.demo_ai_usage', 'update') then
    raise exception 'Public roles must not access quota counters';
  end if;
end;
$$;

set local role service_role;
delete from public.demo_ai_usage;
do $$
declare
  v_result jsonb;
  v_hash text := repeat('a', 64);
begin
  for i in 1..12 loop
    v_result := public.consume_demo_ai_quota(v_hash);
    if not (v_result->>'allowed')::boolean then raise exception 'Request % should pass', i; end if;
  end loop;
  v_result := public.consume_demo_ai_quota(v_hash);
  if (v_result->>'allowed')::boolean or (v_result->>'retry_after_seconds')::integer < 1 then
    raise exception 'Request 13 must be limited';
  end if;

  -- A second visitor is independent, while the project shares a hard request ceiling.
  v_result := public.consume_demo_ai_quota(repeat('b', 64));
  if not (v_result->>'allowed')::boolean then raise exception 'Independent visitor blocked'; end if;
  update public.demo_ai_usage set hits = 200 where bucket like 'salazar-demo-ai:day:%';
  v_result := public.consume_demo_ai_quota(repeat('c', 64));
  if (v_result->>'allowed')::boolean then raise exception 'Project daily cap not enforced'; end if;
end;
$$;
rollback;
