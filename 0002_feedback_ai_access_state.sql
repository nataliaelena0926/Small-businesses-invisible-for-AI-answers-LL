CREATE TABLE public.feedback_ai_state (user_id uuid PRIMARY KEY, blocked_status integer, blocked_message text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.feedback_ai_state TO service_role;
ALTER TABLE public.feedback_ai_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.feedback_ai_state IS 'Server-only AI access pause state; no feedback content or generated report is stored.';