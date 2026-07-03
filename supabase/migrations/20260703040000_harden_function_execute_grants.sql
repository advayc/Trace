-- Defense in depth: SECURITY DEFINER functions must not be callable by API roles.
-- rls_auto_enable is an event-trigger function (not directly invocable via PostgREST),
-- but revoking EXECUTE removes it from the attack surface entirely.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
