
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  email: string;
  name: string;
  verificationLink: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verificationLink }: VerifyEmailRequest = await req.json();

    if (!email || !name || !verificationLink) {
      throw new Error("Missing required fields: email, name, or verificationLink");
    }

    // Extract host from request URL to build correct verification link
    const requestUrl = new URL(req.url);
    const host = `${requestUrl.protocol}//${requestUrl.host}`;
    
    // Make sure the verification link is a complete URL with https://
    const finalVerificationLink = verificationLink.startsWith('http') 
      ? verificationLink 
      : `${host}${verificationLink}`;

    console.log(`Sending verification email to ${email} with link ${finalVerificationLink}`);

    const emailResponse = await resend.emails.send({
      from: "CustodiosCRM <onboarding@resend.dev>",
      to: [email],
      subject: "Verifica tu correo electrónico - CustodiosCRM",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333366;">CustodiosCRM</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333366; margin-top: 0;">Verifica tu correo electrónico</h2>
            <p>Hola ${name},</p>
            <p>Gracias por registrarte en CustodiosCRM. Para verificar tu correo electrónico, haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalVerificationLink}" style="background-color: #333366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar mi correo electrónico</a>
            </div>
            <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
            <p>Este enlace expirará en 24 horas.</p>
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
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
