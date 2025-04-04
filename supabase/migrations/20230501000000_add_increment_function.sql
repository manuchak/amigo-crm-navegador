
-- Function to safely increment a counter field
CREATE OR REPLACE FUNCTION increment_call_count(row_id BIGINT)
RETURNS INTEGER
LANGUAGE SQL
AS $$
  UPDATE leads
  SET call_count = COALESCE(call_count, 0) + 1
  WHERE id = row_id
  RETURNING call_count;
$$;
