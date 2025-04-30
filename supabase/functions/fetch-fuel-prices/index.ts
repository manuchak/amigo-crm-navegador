
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching fuel prices from petrointelligence.com");
    
    // Fetch the webpage content
    const response = await fetch("https://petrointelligence.com/precios-de-la-gasolina-y-diesel-hoy.php");
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract prices using regex patterns
    const regularPattern = /<span class="large-pesos">\$([\d.]+)<\/span>\s*<span class="centavos">(\d+)<\/span>\s*<div class="gasolina">Regular<\/div>/;
    const premiumPattern = /<span class="large-pesos">\$([\d.]+)<\/span>\s*<span class="centavos">(\d+)<\/span>\s*<div class="gasolina">Premium<\/div>/;
    const dieselPattern = /<span class="large-pesos">\$([\d.]+)<\/span>\s*<span class="centavos">(\d+)<\/span>\s*<div class="gasolina">Diésel<\/div>/;
    
    // Extract regular price
    const regularMatch = html.match(regularPattern);
    const regularPrice = regularMatch ? parseFloat(`${regularMatch[1]}.${regularMatch[2]}`) : null;
    
    // Extract premium price
    const premiumMatch = html.match(premiumPattern);
    const premiumPrice = premiumMatch ? parseFloat(`${premiumMatch[1]}.${premiumMatch[2]}`) : null;
    
    // Extract diesel price
    const dieselMatch = html.match(dieselPattern);
    const dieselPrice = dieselMatch ? parseFloat(`${dieselMatch[1]}.${dieselMatch[2]}`) : null;
    
    const result = {
      regular: regularPrice,
      premium: premiumPrice,
      diesel: dieselPrice,
      fetchedAt: new Date().toISOString(),
    };
    
    console.log("Extracted prices:", result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
