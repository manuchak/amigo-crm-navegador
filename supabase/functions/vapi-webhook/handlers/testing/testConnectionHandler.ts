
/**
 * Handle test connection requests
 */
export function handleTestConnection(corsHeaders: HeadersInit) {
  console.log("Processing test connection request");
  
  return new Response(
    JSON.stringify({
      success: true,
      message: "Test connection successful",
      timestamp: new Date().toISOString(),
      service: "VAPI Webhook"
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
