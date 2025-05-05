
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Mock tweets data - replace with actual Twitter API integration when API keys are available
const MOCK_TWEETS = [
  {
    id: '1',
    text: '⚠️ #CAPUFE informa: Cierre parcial en la autopista México-Puebla por mantenimiento preventivo.',
    date: 'Hace 30 min'
  },
  {
    id: '2',
    text: '🚧 Obras de mantenimiento en el km 32 de la carretera Querétaro-Irapuato. Precaución al conducir.',
    date: 'Hace 2 horas'
  },
  {
    id: '3',
    text: '📢 Flujo vehicular intenso en la México-Cuernavaca. Tome previsiones y tiempo adicional para su viaje.',
    date: 'Hace 3 horas'
  },
  {
    id: '4',
    text: '⛅ Neblina densa reduce visibilidad en autopista Puebla-Veracruz. Conduzca con precaución.',
    date: 'Hace 5 horas'
  },
  {
    id: '5',
    text: '🚦 Servicio de abanderamiento activo en el km 78 de la carretera Mérida-Cancún por vehículo averiado.',
    date: 'Hace 7 horas'
  },
  {
    id: '6',
    text: '🔧 Trabajo de bacheo en la autopista Guadalajara-Tepic del km 15 al 20. Reduzca velocidad en la zona.',
    date: 'Hace 10 horas'
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // NOTE: This function currently returns mock data
    // To implement actual Twitter API integration, you would need:
    // 1. Twitter API keys configured as secrets
    // 2. OAuth authentication flow
    // 3. API call to Twitter's v2 API to fetch tweets from @CAPUFE
    
    // In a production environment, you would replace this with actual Twitter API integration
    // For example:
    // const tweets = await fetchTwitterData();
    
    // Log the request for debugging
    console.log("Twitter feed requested");
    
    // Return mock data with success status
    return new Response(
      JSON.stringify({ 
        tweets: MOCK_TWEETS,
        success: true,
        message: "Note: Using mock data. Integrate with Twitter API for live data." 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    
    return new Response(
      JSON.stringify({ 
        tweets: [], 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
