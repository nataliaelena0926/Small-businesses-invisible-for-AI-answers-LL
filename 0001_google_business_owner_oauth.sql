CREATE TABLE public.google_business_connections (user_id uuid PRIMARY KEY, refresh_token_ciphertext text NOT NULL, connected_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.google_business_connections TO service_role;
ALTER TABLE public.google_business_connections ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.google_business_oauth_requests (state_hash text PRIMARY KEY, user_id uuid NOT NULL, verifier_ciphertext text NOT NULL, redirect_uri text NOT NULL, expires_at timestamptz NOT NULL);
GRANT ALL ON public.google_business_oauth_requests TO service_role;
ALTER TABLE public.google_business_oauth_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX google_business_oauth_requests_user ON public.google_business_oauth_requests(user_id);
COMMENT ON TABLE public.google_business_connections IS 'Server-only encrypted owner OAuth grants. No Google review content is persisted.';