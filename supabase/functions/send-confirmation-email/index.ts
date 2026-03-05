// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
    // CORS HEADERS (Must return these on OPTIONS request)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            }
        })
    }

    try {
        const { name, email, unique_code } = await req.json()

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: "CodeKar <akash.o@storyseed.in>",
                to: email,
                subject: "🎉 Congratulations! You're Registered for CodeKar 2026",
                html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Congratulations ${name}! 🚀</h2>
            <p>You have successfully registered for <b>CodeKar 2026</b>.</p>
            <p>Your Unique Participation Code:</p>
            <h1 style="color: #4CAF50;">${unique_code}</h1>
            <p>Please save this code carefully.</p>
            <p>You will use this code on:</p>
            <a href="https://codekar.vercel.app/">
              Our Platform
            </a>
            <br/><br/>
            <p>Best Regards,<br/>Team CodeKar</p>
          </div>
        `
            })
        })

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
        )
    }
})
