
-- Add lifetime_id column to custodio_validations table
ALTER TABLE public.custodio_validations ADD COLUMN IF NOT EXISTS lifetime_id TEXT;

-- Add an index on lifetime_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_custodio_validations_lifetime_id ON public.custodio_validations(lifetime_id);

-- Add a comment explaining the purpose of this field
COMMENT ON COLUMN public.custodio_validations.lifetime_id IS 'Unique lifetime identifier for validated custodios, format: CUS-YYYY-XXXXX';
