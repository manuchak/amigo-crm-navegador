
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

-- Function to handle incoming webhook data and create a lead
-- This function can be called by external services like Make.com
CREATE OR REPLACE FUNCTION create_lead_from_webhook(
  webhook_data JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  new_lead_id BIGINT;
BEGIN
  INSERT INTO leads (
    nombre,
    email,
    telefono,
    empresa,
    estado,
    fuente,
    fecha_creacion,
    tienevehiculo,
    experienciaseguridad,
    esmilitar,
    credencialsedena,
    esarmado,
    anovehiculo,
    modelovehiculo,
    valor,
    call_count
  ) VALUES (
    COALESCE(webhook_data->>'nombre', 'Sin nombre'),
    webhook_data->>'email',
    webhook_data->>'telefono',
    COALESCE(webhook_data->>'empresa', 'Custodio'),
    COALESCE(webhook_data->>'estado', 'Nuevo'),
    COALESCE(webhook_data->>'fuente', 'Make.com Webhook'),
    COALESCE(webhook_data->>'fecha_creacion', now()),
    COALESCE(webhook_data->>'tienevehiculo', 'NO'),
    COALESCE(webhook_data->>'experienciaseguridad', 'NO'),
    COALESCE(webhook_data->>'esmilitar', 'NO'),
    COALESCE(webhook_data->>'credencialsedena', 'NO'),
    COALESCE(webhook_data->>'esarmado', 'NO'),
    webhook_data->>'anovehiculo',
    webhook_data->>'modelovehiculo',
    COALESCE((webhook_data->>'valor')::numeric, 0),
    0
  )
  RETURNING id INTO new_lead_id;
  
  RETURN new_lead_id;
END;
$$;

