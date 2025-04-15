
/**
 * Handles test connection requests
 */
export function handleTestConnection(corsHeaders: HeadersInit) {
  console.log("Test connection request detected");
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Test connection successful. The webhook is properly configured." 
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
