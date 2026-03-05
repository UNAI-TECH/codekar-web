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
 * Resolves Zoho access token with multi-domain check and API key fallback
 */
async function getZohoAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
    const backupApiKey = Deno.env.get('ZOHO_PAYMENTS_API_KEY');

    // Strategy 1: OAuth Refresh (Try .in and .com)
    if (clientId && clientSecret && refreshToken && refreshToken.startsWith('1000.')) {
        for (const domain of ["in", "com"]) {
            try {
                const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
                const response = await fetch(tokenUrl, { method: 'POST' });
                const data = await response.json();
                if (response.ok && data.access_token) return data.access_token;
            } catch (err) {
                console.warn(`[AUTH] OAuth refresh failed for domain ${domain}:`, err.message);
            }
        }
    }

    // Strategy 2: Static Token Fallback
    if (refreshToken?.includes('.') && !refreshToken.startsWith('1000.')) return refreshToken;
    if (backupApiKey?.includes('.')) return backupApiKey;

    throw new Error("Zoho authentication failed. Ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN are set correctly.");
}

/**
 * Exhaustive strategy for creating a payment link
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

    const returnUrl = `https://www.codekar.in/payment-success?registration_id=${params.registrationId}`;

    async function tryRequest(domain: string, service: 'payments' | 'books', header: string, prefix: string, id: string) {
        const url = service === 'payments'
            ? `https://payments.zoho.${domain}/api/v1/paymentlinks?account_id=${id}`
            : `https://books.zoho.${domain}/api/v3/paymentlinks?organization_id=${id}`;

        const authValue = prefix ? `${prefix} ${accessToken}` : accessToken;

        // Precision Formatting: Zoho often requires exactly 2 decimal places for amounts
        const formattedAmount = Number(params.amount).toFixed(2);

        const payload = service === 'books' ? {
            amount: parseFloat(formattedAmount), // Numerically 299.00
            currency_code: params.currency,
            description: params.description,
            email: params.email || 'customer@codekar.in',
            payment_gateways: [{ gateway_name: "razorpay" }]
        } : {
            amount: formattedAmount, // String "299.00"
            currency: params.currency,
            email: params.email || 'customer@codekar.in',
            return_url: returnUrl,
            reference_id: params.registrationId,
            description: params.description,
            customer_name: params.name || 'Participant',
            purpose: 'CODEKAR-REGISTRATION-2026'
        };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { [header]: authValue, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

            if (res.ok) return data;
            console.warn(`[ZOHO][${service}][${domain}][${header}] ✗ ${res.status}: ${JSON.stringify(data)}`);
            return null;
        } catch (e) {
            return null;
        }
    }

    // Strategy Parameters
    const domains = ['in', 'com'];
    const services: ('payments' | 'books')[] = ['payments', 'books'];
    const auths = [
        { h: 'Authorization', p: 'Zoho-oauthtoken' },
        { h: 'apikey', p: '' },
        { h: 'X-ZPAY-API-KEY', p: '' }
    ];
    const ids = [accountId, orgId].filter((v, i, a) => v && a.indexOf(v) === i);

    for (const service of services) {
        for (const domain of domains) {
            for (const id of ids) {
                for (const auth of auths) {
                    const data = await tryRequest(domain, service, auth.h, auth.p, id);
                    if (data) {
                        const link = data.payment_link || data.paymentlink?.payment_link || data.url;
                        const linkId = data.link_id || data.paymentlink?.link_id;
                        if (link) return { url: link, link_id: linkId };
                    }
                }
            }
        }
    }

    throw new Error("Failed to create Zoho payment link after trying all regions and services. Check if ZOHO_PAYMENTS_ACCOUNT_ID is correct.");
}

/**
 * Creates a Zoho Checkout Session for the widget
 */
async function createPaymentSession(params: {
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

    // Zoho Checkout Session URL
    const url = `https://payments.zoho.in/api/v1/paymentsessions?account_id=${accountId}`;

    const payload = {
        amount: Number(params.amount),
        currency: params.currency,
        reference_number: params.registrationId,
        description: params.description,
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        const session = data.payments_session || data;

        if (res.ok && session.payments_session_id) {
            return {
                payment_session_id: session.payments_session_id,
                ...session
            };
        }

        console.warn(`[ZOHO][SESSION][ERROR] ${res.status}: ${JSON.stringify(data)}`);
        throw new Error(data.message || "Failed to create payment session");
    } catch (err) {
        console.error('[ZOHO][SESSION][CRITICAL]:', err.message);
        throw err;
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

    try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const body = await req.json();
        console.log('[HANDLER][RAW_BODY]', JSON.stringify(body));

        const rawAction = body.action || "";
        const action = rawAction.toString().trim().toLowerCase();

        console.log(`[HANDLER][DEBUG] Normalized Action: "${action}"`);

        if (action === 'health-check') {
            return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'create-link' || action === 'create-session' || action === 'link' || action === 'session') {
            console.log('[HANDLER][FLOW] Entering creation block');
            const {
                name,
                email,
                phone,
                amount,
                registration_type,
                team_name,
                college,
                department,
                year,
                project_track,
                project_name,
                member_2,
                member_3,
                member_4
            } = body;


            // 1. Insert into Supabase first
            const { data: reg, error: dbError } = await supabase.from('registrations').insert({
                full_name: name || 'Unknown',
                email: email || null,
                phone: phone || '0000000000',
                college: college || null,
                department: department || null,
                year_of_study: year || null,
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
                if (action === 'create-session') {
                    // NEW: Create Session for Widget
                    const sessionData = await createPaymentSession({
                        amount: Math.max(Number(amount), 1),
                        currency: 'INR',
                        email: email || 'customer@codekar.in',
                        name: name || 'Participant',
                        registrationId: reg.id,
                        description: `CodeKar 2026 - ${name}`
                    });

                    // Save session ID to DB
                    await supabase.from('registrations').update({ zoho_session_id: sessionData.payment_session_id }).eq('id', reg.id);

                    return new Response(JSON.stringify({
                        success: true,
                        payment_session_id: sessionData.payment_session_id,
                        registration_id: reg.id
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } else {
                    // OLD: Create Legacy Link
                    const { url, link_id } = await createPaymentLink({
                        amount: Math.max(Number(amount), 1),
                        currency: 'INR',
                        email: email || 'customer@codekar.in',
                        name: name || 'Participant',
                        registrationId: reg.id,
                        description: `CodeKar 2026 - ${name}`
                    });

                    if (link_id) await supabase.from('registrations').update({ zoho_payment_link_id: link_id }).eq('id', reg.id);

                    return new Response(JSON.stringify({ success: true, payment_url: url, registration_id: reg.id }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            } catch (err: any) {
                console.error('[ZOHO CALL FAILED]:', err.message);
                await supabase.from('registrations').update({ payment_status: 'link_failed' }).eq('id', reg.id);
                throw err;
            }
        }
        throw new Error("Invalid action");

    } catch (err: any) {
        console.error('Edge Function Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
