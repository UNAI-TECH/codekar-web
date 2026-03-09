// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

/**
 * Resolves Zoho access token with multi-domain check and region detection
 */
async function getZohoAccessToken(): Promise<{ token: string; prefix: string; domain: string }> {
    const apiKey = Deno.env.get("ZOHO_PAYMENTS_API_KEY");
    const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");

    if (apiKey) {
        console.log(`[AUTH] Priority: Using ZOHO_PAYMENTS_API_KEY.`);
        return { token: apiKey, prefix: "Zoho-encapikey", domain: "in" };
    }

    if (refreshToken && !refreshToken.startsWith("1000.")) {
        console.log(`[AUTH] Priority: Using static ZOHO_REFRESH_TOKEN.`);
        return { token: refreshToken, prefix: "Zoho-oauthtoken", domain: "in" };
    }

    if (clientId && clientSecret && refreshToken && refreshToken.startsWith("1000.")) {
        console.log(`[AUTH] Attempting OAuth refresh for token starting with: ${refreshToken.substring(0, 10)}...`);
        // Force India region first as per requirements
        for (const domain of ["in", "com"]) {
            try {
                const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
                const response = await fetch(tokenUrl, { method: "POST" });
                const data = await response.json();
                if (response.ok && data.access_token) {
                    console.log(`[AUTH] Successfully obtained access token from domain: ${domain}`);
                    return { token: data.access_token, prefix: "Zoho-oauthtoken", domain };
                }
                console.warn(`[AUTH] Domain ${domain} returned error:`, JSON.stringify(data));
            } catch (err) {
                console.warn(`[AUTH] OAuth refresh failed for domain ${domain}:`, err.message);
            }
        }
    }

    throw new Error("Zoho authentication failed. Ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN are set correctly for the 'in' region.");
}

/**
 * Creates a Zoho Payment Link (Legacy/Link Flow)
 */
async function createPaymentLink(params: {
    amount: number;
    currency: string;
    email: string;
    name: string;
    registrationId: string;
    description: string;
}) {
    const { token: accessToken, prefix: authHeader, domain } = await getZohoAccessToken();
    const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID');

    if (!accountId) {
        throw new Error("ZOHO_PAYMENTS_ACCOUNT_ID is required for link generation.");
    }

    const returnUrl = `https://www.codekarx.in/payment-success?registration_id=${params.registrationId}`;
    const apiUrl = `https://payments.zoho.${domain.toLowerCase()}/api/v1/paymentlinks?account_id=${accountId}`;

    const payload = {
        amount: Number(params.amount).toFixed(2),
        currency: params.currency,
        email: params.email || 'customer@codekar.in',
        return_url: returnUrl,
        reference_id: params.registrationId,
        description: params.description,
        customer_name: params.name || 'Participant',
        purpose: 'CODEKAR-REGISTRATION-2026'
    };

    console.log(`[ZOHO][LINK] Creating link on ${domain} using account ${accountId}`);

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `${authHeader} ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
        const link = data.payment_link || data.paymentlink?.payment_link || data.url;
        const linkId = data.link_id || data.paymentlink?.link_id;
        return { url: link, link_id: linkId };
    }

    console.error(`[ZOHO][LINK] Failed:`, JSON.stringify(data));
    throw new Error(data.message || "Failed to create Zoho payment link");
}

/**
 * Creates a Zoho Checkout Session (Widget Flow)
 */
async function createPaymentSession(params: {
    amount: number;
    currency: string;
    email: string;
    name: string;
    phone: string;
    registrationId: string;
}) {
    const { token: accessToken, prefix: authHeader, domain } = await getZohoAccessToken();
    const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID');

    if (!accountId) {
        throw new Error("ZOHO_PAYMENTS_ACCOUNT_ID is required for session generation.");
    }

    const payload = {
        amount: Math.round(Number(params.amount)).toString(),
        currency: params.currency,
        reference_number: params.registrationId,
        description: `CodeKar 2026 Registration - ${params.registrationId}`,
    };

    console.log(`[ZOHO][SESSION] Creating session on ${domain} using account ${accountId} with payload:`, JSON.stringify(payload));

    const url = `https://payments.zoho.${domain}/api/v1/paymentsessions?account_id=${accountId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `${authHeader} ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
        const session = data.payments_session || data;
        console.log(`[ZOHO][SESSION] Created session ID: ${session.payments_session_id || data.payment_session_id || data.id}`);
        return {
            payment_session_id: session.payments_session_id || data.payment_session_id || data.id,
            ...session
        };
    }

    // Handle "Authorized User" error specifically
    if (data.message === "Not An Authorized User") {
        console.error(`[ZOHO][SESSION] Authorization Error for Account ID: ${accountId}. Data:`, JSON.stringify(data));
        throw new Error(`Zoho Authorization Error: Account ID "${accountId}" is not authorized for this token in region "${domain}". Please verify the Account ID in Zoho Payments dashboard.`);
    }

    console.error(`[ZOHO][SESSION] Failed:`, JSON.stringify(data));
    throw new Error(data.message || "Failed to create payment session");
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

    try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const body = await req.json();

        const action = (body.action || "").toString().trim().toLowerCase();
        console.log(`[HANDLER] Action: "${action}"`);

        if (action === 'health-check') {
            return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const {
            name, email, phone, amount, registration_type,
            team_name, college, department, year,
            project_track, project_name, member_2, member_3, member_4
        } = body;

        console.log(`[HANDLER] Received amount: ${amount}, type: ${registration_type}, email: ${email}`);

        // 1. Insert into Supabase
        const { data: reg, error: dbError } = await supabase.from('registrations').insert({
            full_name: name || 'Unknown',
            email: email || null,
            phone: phone || '0000000000',
            college: college || null,
            department: department || null,
            year_of_study: year ? Number(year) : null,
            track: project_track || null,
            project_name: project_name || null,
            registration_type: registration_type || 'individual',
            team_name: team_name || null,
            amount: Number(amount) || 0,
            payment_status: 'pending',
            member_2_name: member_2 || null,
            member_3_name: member_3 || null,
            member_4_name: member_4 || null,
            team_leader_name: name || 'Unknown',
            leader_phone: phone || '0000000000',
            leader_email: email || null,
        }).select('id').single();

        if (dbError) throw new Error(`Database Insert Failed: ${dbError.message}`);

        try {
            if (action === 'create-session' || action === 'session') {
                const sessionData = await createPaymentSession({
                    amount: Number(amount),
                    currency: 'INR',
                    email: email || '',
                    name: name || 'Participant',
                    phone: phone || '',
                    registrationId: reg.id
                });

                await supabase.from('registrations').update({ zoho_session_id: sessionData.payment_session_id }).eq('id', reg.id);

                return new Response(JSON.stringify({
                    success: true,
                    payment_session_id: sessionData.payment_session_id,
                    registration_id: reg.id
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else {
                // Default to link flow
                const { url, link_id } = await createPaymentLink({
                    amount: Number(amount),
                    currency: 'INR',
                    email: email || '',
                    name: name || 'Participant',
                    registrationId: reg.id,
                    description: `CodeKar 2026 - ${name}`
                });

                if (link_id) await supabase.from('registrations').update({ zoho_payment_link_id: link_id }).eq('id', reg.id);

                return new Response(JSON.stringify({
                    success: true,
                    payment_url: url,
                    registration_id: reg.id
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        } catch (err: any) {
            console.error('[ZOHO CALL FAILED]:', err.message);
            await supabase.from('registrations').update({ payment_status: 'link_failed' }).eq('id', reg.id);
            throw err;
        }

    } catch (err: any) {
        console.error('Edge Function Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
