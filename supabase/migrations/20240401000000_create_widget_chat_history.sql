
-- Create widget_chat_history table
CREATE TABLE widget_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE widget_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous insert" ON widget_chat_history
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select own session" ON widget_chat_history
  FOR SELECT TO anon
  USING (session_id = current_setting('request.jwt.claims')::json->>'session_id');
