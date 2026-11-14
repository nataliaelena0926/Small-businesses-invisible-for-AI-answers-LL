CREATE OR REPLACE FUNCTION public.guard_business_plan()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(current_setting('app.plan_change', true), '') = 'on' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' AND NEW.plan IS NOT NULL THEN
    RAISE EXCEPTION 'Plan can only be set through checkout';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Plan can only be set through checkout';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER businesses_guard_plan BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.guard_business_plan();

CREATE OR REPLACE FUNCTION public.choose_plan(_plan text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _plan NOT IN ('basic','pro','premium') THEN RAISE EXCEPTION 'Unknown plan'; END IF;
  PERFORM set_config('app.plan_change', 'on', true);
  UPDATE public.businesses SET plan = _plan, updated_at = now() WHERE user_id = auth.uid();
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('app.plan_change', 'off', true);
  RETURN n > 0;
END $$;

REVOKE ALL ON FUNCTION public.choose_plan(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.choose_plan(text) TO authenticated;