// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

function getSupabaseAdmin() {
    return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function resolveZohoToken(): Promise<{ token: string; headerPrefix: string; domain: string }> {
    const apiKey = Deno.env.get("ZOHO_PAYMENTS_API_KEY");
    const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");

    if (apiKey) return { token: apiKey, headerPrefix: "Zoho-encapikey", domain: "in" };

    if (clientId && clientSecret && refreshToken) {
        for (const domain of ["in", "com"]) {
            try {
                const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
                const res = await fetch(tokenUrl, { method: "POST" });
                const data = await res.json();
                if (res.ok && data.access_token) {
                    return { token: data.access_token, headerPrefix: "Zoho-oauthtoken", domain };
                }
            } catch (e) { }
        }
    }
    throw new Error("No valid Zoho auth token found in secrets.");
}

async function checkStatus(id: string, type: 'session' | 'link'): Promise<{ status: string; paymentId?: string }> {
    const { token, headerPrefix, domain } = await resolveZohoToken();
    const accountId = Deno.env.get("ZOHO_PAYMENTS_ACCOUNT_ID");

    const url = type === 'session'
        ? `https://payments.zoho.${domain}/api/v1/paymentsessions/${id}?account_id=${accountId}`
        : `https://payments.zoho.${domain}/api/v1/paymentlinks/${id}?account_id=${accountId}`;

    const res = await fetch(url, {
        headers: { Authorization: `${headerPrefix} ${token}`, "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) return { status: 'pending' };

    const info = data.payments_session || data.paymentlink || data;
    const zStatus = (info.status || "").toLowerCase();

    if (zStatus === 'succeeded' || zStatus === 'paid' || zStatus === 'payment_done') {
        const p = info.payments || [];
        return { status: 'paid', paymentId: p[p.length - 1]?.payment_id || info.payment_id };
    }

    return { status: zStatus === 'failed' ? 'failed' : 'pending' };
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

    try {
        const { registration_id } = await req.json();
        if (!registration_id) throw new Error("registration_id is required");

        const supabase = getSupabaseAdmin();
        const { data: reg } = await supabase.from("registrations").select("*").eq("id", registration_id).single();

        if (!reg) throw new Error("Registration not found");
        if (reg.payment_status === "paid") return new Response(JSON.stringify({ status: "paid", registration: reg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

        let result = { status: 'pending' };
        if (reg.zoho_session_id) {
            result = await checkStatus(reg.zoho_session_id, 'session');
        } else if (reg.zoho_payment_link_id) {
            result = await checkStatus(reg.zoho_payment_link_id, 'link');
        }

        if (result.status === "paid") {
            const prefix = reg.registration_type === "team" ? "TEAM" : "IND";
            const code = `${prefix}-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            const { data: updated } = await supabase.from("registrations").update({
                payment_status: "paid",
                zoho_payment_id: result.paymentId,
                generated_code: code,
            }).eq("id", registration_id).select().single();

            return new Response(JSON.stringify({ status: "paid", registration: updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ status: result.status, registration: reg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
