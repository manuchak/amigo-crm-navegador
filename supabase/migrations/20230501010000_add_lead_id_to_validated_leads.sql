
-- Add lead_id column to validated_leads table to link with leads table
ALTER TABLE public.validated_leads ADD COLUMN IF NOT EXISTS lead_id BIGINT REFERENCES public.leads(id);

-- Add call_id column to validated_leads table to store the VAPI call ID
ALTER TABLE public.validated_leads ADD COLUMN IF NOT EXISTS call_id TEXT;

-- Add vapi_call_data column to store additional data from the VAPI call
ALTER TABLE public.validated_leads ADD COLUMN IF NOT EXISTS vapi_call_data JSONB;

-- Ensure validated_leads has RLS enabled
ALTER TABLE public.validated_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to select from validated_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'validated_leads' AND policyname = 'Allow all users to view validated leads'
  ) THEN
    CREATE POLICY "Allow all users to view validated leads" 
      ON public.validated_leads 
      FOR SELECT 
      USING (true);
  END IF;
END
$$;

-- Create policy to allow service role to insert/update validated_leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'validated_leads' AND policyname = 'Allow service role to modify validated leads'
  ) THEN
    CREATE POLICY "Allow service role to modify validated leads" 
      ON public.validated_leads 
      FOR ALL 
      USING (auth.jwt() -> 'role' = 'service_role');
  END IF;
END
$$;
