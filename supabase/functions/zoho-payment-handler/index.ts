import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ZohoTokenResponse {
    access_token: string;
    expires_in: number;
    api_domain: string;
    token_type: string;
}

async function getZohoAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    console.log('Token Refresh Check:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRefreshToken: !!refreshToken,
        tokenPrefix: refreshToken?.slice(0, 5)
    });

    if (!refreshToken || refreshToken === 'your_refresh_token') {
        throw new Error('ZOHO_REFRESH_TOKEN is not configured.');
    }

    const hasClientCredentials = clientId && !clientId.includes('your_') && !clientId.includes('<') &&
        clientSecret && !clientSecret.includes('your_') && !clientSecret.includes('<');

    if (hasClientCredentials) {
        const domains = ['in', 'com'];
        for (const domain of domains) {
            try {
                console.log(`Attempting Zoho OAuth refresh on .${domain} domain...`);
                const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

                const response = await fetch(tokenUrl, { method: 'POST' });
                const data: any = await response.json();

                if (response.ok && data.access_token) {
                    console.log(`OAuth refresh SUCCESSFUL on .${domain}`);
                    return data.access_token;
                }

                console.warn(`OAuth refresh FAILED on .${domain} (Status ${response.status}). Body:`, JSON.stringify(data));
            } catch (err) {
                console.warn(`OAuth refresh EXCEPTION on .${domain}:`, err);
            }
        }
    }

    // Direct Key Mode
    if (refreshToken.startsWith('1003.') || refreshToken.startsWith('1002.')) {
        console.log('Using static Zoho API Key directly');
        return refreshToken;
    }

    throw new Error(`Valid Zoho token not found. Refresh failed or key type ${refreshToken.slice(0, 5)} not supported in static mode.`);
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json();
        const { action, amount, currency = 'INR', customer_name, order_id, email, return_url } = body;
        const orgId = Deno.env.get('ZOHO_USER_ID');

        console.log(`Action requested: ${action}`);

        if (action === 'health-check') {
            return new Response(
                JSON.stringify({
                    status: 'ok',
                    message: 'Codekar Edge function OK',
                    env_check: {
                        has_refresh_token: !!Deno.env.get('ZOHO_REFRESH_TOKEN'),
                        has_client_id: !!Deno.env.get('ZOHO_CLIENT_ID'),
                        has_client_secret: !!Deno.env.get('ZOHO_CLIENT_SECRET'),
                        has_user_id: !!orgId,
                        has_account_id: !!Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID')
                    }
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (action === 'create-link') {
            const accessToken = await getZohoAccessToken();
            const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID') || orgId;

            console.log('Request body:', JSON.stringify(body));

            // Try all possible Zoho API combinations
            async function tryZohoRequest(id: string, domain: string, headerName: string, prefix: string, service: 'payments' | 'books') {
                const baseUrl = service === 'payments'
                    ? `https://payments.zoho.${domain}/api/v1/paymentlinks?account_id=${id}`
                    : `https://books.zoho.${domain}/api/v3/paymentlinks?organization_id=${id}`;

                const authValue = prefix ? `${prefix} ${accessToken}` : accessToken;

                let p;
                if (service === 'books') {
                    p = {
                        amount: Number(parseFloat(amount || '0').toFixed(2)),
                        currency_code: currency,
                        description: `Codekar Registration - ${customer_name || 'Participant'}`,
                        email: email || 'participant@codekar.in',
                    };
                } else {
                    let sanitizedReturnUrl = return_url || req.headers.get('origin') || 'https://codekar.in';

                    // Zoho Payments REQUIRES HTTPS and a real domain for return_url.
                    // Local IPs (192.168.x.x) or http://localhost will trigger an error.
                    if (sanitizedReturnUrl.includes('localhost') || sanitizedReturnUrl.includes('127.0.0.1') || sanitizedReturnUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
                        console.warn(`[ZOHO] Local or IP return_url detected (${sanitizedReturnUrl}). Zoho may reject this. Using fallback for API call.`);
                        // Most Zoho accounts require a real domain. 
                        // If it fails, we will tell the user to use an HTTPS tunnel.
                    }

                    p = {
                        amount: parseFloat(amount || '0'),
                        currency: currency,
                        email: email || 'participant@codekar.in',
                        return_url: sanitizedReturnUrl,
                        reference_id: `${order_id || 'codekar'}_${Date.now()}`,
                        description: `Codekar Registration - ${customer_name || 'Participant'}`
                    };
                }

                try {
                    const res = await fetch(baseUrl, {
                        method: 'POST',
                        headers: {
                            [headerName]: authValue,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(p),
                    });

                    const text = await res.text();
                    let data;
                    try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

                    const logPrefix = `[${service.toUpperCase()}][${domain}][${id.slice(-4)}][${headerName}]`;
                    if (res.ok) {
                        console.log(`${logPrefix} SUCCESS!`);
                        return { res, data, service };
                    } else {
                        const msg = data?.message || data?.error || text || 'Error';
                        console.log(`${logPrefix} Failed: ${msg.slice(0, 100)}`);
                        return null;
                    }
                } catch (err) {
                    console.error(`Fetch error:`, err);
                    return null;
                }
            }

            const services: ('payments' | 'books')[] = ['books', 'payments'];
            const domains = ['com', 'in'];
            const accountIds = [orgId, accountId].filter((v, i, a) => v && a.indexOf(v) === i);
            const strategies = [
                { h: 'apikey', p: '' },
                { h: 'Authorization', p: 'Zoho-oauthtoken' },
                { h: 'Authorization', p: 'Zoho-encapikey' },
                { h: 'X-ZPAY-API-KEY', p: '' }
            ];

            let finalResult: any = null;

            for (const service of services) {
                for (const domain of domains) {
                    for (const id of accountIds) {
                        for (const s of strategies) {
                            if (service === 'books' && s.h.includes('ZPAY')) continue;
                            const result = await tryZohoRequest(id as string, domain, s.h, s.p, service);
                            if (result) {
                                finalResult = result;
                                break;
                            }
                        }
                        if (finalResult) break;
                    }
                    if (finalResult) break;
                }
                if (finalResult) break;
            }

            if (!finalResult) {
                return new Response(JSON.stringify({
                    error: 'All Zoho authentication strategies failed.',
                    details: 'This usually means your Client ID, Secret, or Refresh Token are invalid for the .in or .com domains. Check Supabase Edge logs for the specific error from Zoho.',
                    hint: 'Run the secrets command again with correct values and re-deploy.'
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401
                });
            }

            const { data, service } = finalResult;
            const paymentLink = data.payment_link ||
                data.paymentlink?.payment_link ||
                data.payment_links?.url ||
                data.link_url ||
                data.data?.payment_link ||
                data.url;

            if (!paymentLink) {
                console.error('Zoho SUCCESS but link mapping failed. Response:', JSON.stringify(data));
                return new Response(JSON.stringify({ error: 'Link mapping failed', details: data }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500
                });
            }

            console.log(`✅ SUCCESS! Returning link: ${paymentLink}`);

            return new Response(
                JSON.stringify({
                    payment_link: paymentLink,
                    payment_url: paymentLink,
                    link_id: data.link_id || data.paymentlink?.link_id,
                    order_id: order_id,
                    service_type: service
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('CRITICAL Edge Function Error:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                stack: error.stack,
                details: 'Check Supabase Edge logs for full trace'
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
