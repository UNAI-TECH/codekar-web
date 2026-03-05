// @ts-nocheck
// Supabase Edge Function: zoho-payment
// Final Production Version - Enforced constraints: www domain, 100 INR min, numeric amt.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

const PROD_DOMAIN = "https://www.codekarx.com";

function getSupabaseAdmin() {
    return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

/**
 * Resolves Zoho access token (OAuth with static fallback)
 */
async function getZohoAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
    const backupApiKey = Deno.env.get('ZOHO_PAYMENTS_API_KEY');

    // OAuth Refresh Logic
    if (clientId && clientSecret && refreshToken && refreshToken.startsWith('1000.')) {
        try {
            for (const domain of ["in", "com"]) {
                const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
                const response = await fetch(tokenUrl, { method: 'POST' });
                const data = await response.json();

                if (response.ok && data.access_token) {
                    return data.access_token;
                }
            }
        } catch (err) {
            console.warn('[AUTH] OAuth refresh EXCEPTION:', err);
        }
    }

    // Static API Key Fallback
    if (refreshToken?.startsWith('1003.') || refreshToken?.startsWith('1002.')) return refreshToken;
    if (backupApiKey?.startsWith('1003.') || backupApiKey?.startsWith('1002.')) return backupApiKey;

    throw new Error("Zoho authentication failed. No valid token or API key found.");
}

/**
 * Creates a Zoho Payment Link with exhaustive retry strategies
 */
async function createPaymentLink(params: {
    amount: number;
    currency: string;
    email: string;
    name: string;
    registrationId: string;
    description: string;
}) {
    const accessToken = await getZohoAccessToken();
    const orgId = Deno.env.get('ZOHO_USER_ID') || "60058565264";
    const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID') || orgId;

    // Enforce Production Return URL
    const returnUrl = `${PROD_DOMAIN}/payment-success?registration_id=${params.registrationId}`;

    async function tryZohoRequest(id: string, domain: string, headerName: string, prefix: string, service: 'payments' | 'books', amtVal: number) {
        const baseUrl = service === 'payments'
            ? `https://payments.zoho.${domain}/api/v1/paymentlinks?account_id=${id}`
            : `https://books.zoho.${domain}/api/v3/paymentlinks?organization_id=${id}`;

        const authValue = prefix ? `${prefix} ${accessToken}` : accessToken;

        const payload = service === 'books' ? {
            amount: amtVal,
            currency_code: params.currency,
            description: params.description,
            email: params.email || 'customer@codekarx.in',
            payment_gateways: [{ gateway_name: "razorpay" }]
        } : {
            amount: amtVal,
            currency: params.currency,
            email: params.email || 'customer@codekarx.in',
            return_url: returnUrl,
            reference_id: params.registrationId,
            description: params.description
        };

        try {
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    [headerName]: authValue,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

            const logPrefix = `[${service.toUpperCase()}][${domain}][${headerName}]`;

            if (res.ok) {
                console.log(`${logPrefix} ✅ SUCCESS`);
                return { data, service };
            } else {
                // DETAILED DIAGNOSTICS
                console.log(`${logPrefix} ✗ FAILED (Status: ${res.status})`);
                console.log(`${logPrefix} Error Body:`, text.slice(0, 500));
                return null;
            }
        } catch (err) {
            console.error(`[${service.toUpperCase()}] Fetch Exception:`, err.message);
            return null;
        }
    }

    const services: ('payments' | 'books')[] = ['books', 'payments'];
    const domains = ['in', 'com'];
    const accountIds = [orgId, accountId, "60064885204", "60058565264"].filter((v, i, a) => v && a.indexOf(v) === i);
    const authStrategies = [
        { h: 'apikey', p: '' },
        { h: 'Authorization', p: 'Zoho-oauthtoken' },
        { h: 'Authorization', p: 'Zoho-encapikey' },
        { h: 'X-ZPAY-API-KEY', p: '' }
    ];

    // Enforce 100 INR Minimum
    const finalAmount = Math.max(params.amount, 100);

    for (const service of services) {
        for (const domain of domains) {
            for (const id of accountIds) {
                for (const auth of authStrategies) {
                    if (service === 'books' && auth.h.includes('ZPAY')) continue;
                    const result = await tryZohoRequest(id as string, domain, auth.h, auth.p, service, finalAmount);
                    if (result) {
                        const { data } = result;
                        const link = data.payment_link || data.paymentlink?.payment_link || data.payment_links?.url || data.link_url || data.url;
                        if (link) return { url: link, link_id: data.link_id || data.paymentlink?.link_id };
                    }
                }
            }
        }
    }
    throw new Error("Failed to create Zoho payment link. All strategies exhausted.");
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { status: 200, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { action } = body;

        if (action === "health-check") {
            return new Response(JSON.stringify({ status: "ok" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (action === "create-link") {
            const { name, email, phone, registration_type = "individual", amount = 299, team_name, college, department, year, project_track, project_name, member_2, member_3, member_4 } = body;

            if (!name || !phone) throw new Error("Name and phone are required.");

            const supabase = getSupabaseAdmin();

            // Email Uniqueness Check
            if (email) {
                const { data: existingReg } = await supabase.from("registrations").select("id, payment_status").eq("email", email).in("payment_status", ["paid", "pending"]).maybeSingle();
                if (existingReg) throw new Error(`A registration with email ${email} is already ${existingReg.payment_status}.`);
            }

            // Enforce ₹100 minimum for production safety
            const chargeAmount = Math.max(Number(amount) || 0, 100);

            // Save Registration
            const { data: reg, error: regErr } = await supabase.from("registrations").insert({
                full_name: name,
                email: email || null,
                phone: phone,
                college: college || null,
                department: department || null,
                year_of_study: year || null,
                track: project_track || null,
                project_name: project_name || null,
                registration_type: registration_type,
                team_name: team_name || null,
                amount: chargeAmount,
                payment_status: "pending",
                member_2_name: member_2 || null,
                member_3_name: member_3 || null,
                member_4_name: member_4 || null,
                team_leader_name: name,
                leader_phone: phone,
                leader_email: email || null,
            }).select("id").single();

            if (regErr) throw new Error(`Registration Save Failed: ${regErr.message}`);

            try {
                const { url, link_id } = await createPaymentLink({
                    amount: chargeAmount,
                    currency: "INR",
                    email: email || "",
                    name,
                    registrationId: reg.id,
                    description: `CodeKar 2026 - ${registration_type === "team" ? (team_name || name) : name}`
                });

                if (link_id) await supabase.from("registrations").update({ zoho_payment_link_id: link_id }).eq("id", reg.id);

                return new Response(JSON.stringify({ success: true, payment_url: url, registration_id: reg.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) {
                await supabase.from("registrations").update({ payment_status: "link_failed" }).eq("id", reg.id);
                throw err;
            }
        }
        throw new Error("Invalid action provided.");
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
