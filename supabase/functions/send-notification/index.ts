
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  email: string;
  subject: string;
  message: string;
  name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message, name = "" }: NotificationEmailRequest = await req.json();

    if (!email || !subject || !message) {
      throw new Error("Missing required fields: email, subject, or message");
    }

    console.log(`Sending notification email to ${email} with subject "${subject}"`);

    const emailResponse = await resend.emails.send({
      from: "CustodiosCRM <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333366;">CustodiosCRM</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333366; margin-top: 0;">${subject}</h2>
            ${name ? `<p>Hola ${name},</p>` : ""}
            <div style="margin: 20px 0;">
              ${message}
            </div>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} CustodiosCRM. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
