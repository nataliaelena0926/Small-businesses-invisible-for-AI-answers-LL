REVOKE ALL ON public.google_business_connections FROM anon, authenticated;
REVOKE ALL ON public.google_business_oauth_requests FROM anon, authenticated;
REVOKE ALL ON public.feedback_ai_state FROM anon, authenticated;
GRANT ALL ON public.google_business_connections TO service_role;
GRANT ALL ON public.google_business_oauth_requests TO service_role;
GRANT ALL ON public.feedback_ai_state TO service_role;