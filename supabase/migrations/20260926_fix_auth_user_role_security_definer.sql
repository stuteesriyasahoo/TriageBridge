-- Migration: fix_auth_user_role_security_definer
-- Description: Harden auth_user_role as SECURITY DEFINER with fixed search_path,
-- owner set to postgres, and execute restricted from PUBLIC.

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS public.user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role public.user_role;
  v_uid uuid;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = v_uid;

  RETURN v_role;
END;
$$;

-- Verify trusted owner
ALTER FUNCTION public.auth_user_role() OWNER TO postgres;

-- Restrict unnecessary PUBLIC and anon execute privileges
REVOKE ALL ON FUNCTION public.auth_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_user_role() FROM anon;

-- Preserve permissions required by authenticated RLS evaluation and backend service_role
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated, service_role;
