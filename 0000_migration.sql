CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  tax_id text,
  industry text NOT NULL,
  answers jsonb,
  score int,
  plan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.businesses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.businesses FOR DELETE TO authenticated USING (auth.uid() = user_id);