
CREATE OR REPLACE FUNCTION increment(row_id bigint, field_name text)
RETURNS integer AS $$
DECLARE
  current_value integer;
  incremented_value integer;
BEGIN
  EXECUTE format('SELECT %I FROM leads WHERE id = $1', field_name)
  INTO current_value
  USING row_id;
  
  incremented_value := COALESCE(current_value, 0) + 1;
  
  RETURN incremented_value;
END;
$$ LANGUAGE plpgsql;
