import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ZohoTokenResponse {
    access_token: string;
    expires_in: number;
    api_domain: string;
}

// Helper to refresh Zoho token (India Only)
async function getZohoAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Zoho OAuth credentials in environment variables.');
    }

    const tokenUrl = `https://accounts.zoho.in/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

    const response = await fetch(tokenUrl, { method: 'POST' });
    const data: any = await response.json();

    if (!response.ok || !data.access_token) {
        console.error('Zoho OAuth Refresh Error:', data);
        throw new Error('Failed to refresh Zoho Access Token.');
    }

    return data.access_token;
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const body = await req.json();
        const { action } = body;

        console.log(`Action: ${action}`);

        if (action === 'health-check') {
            return new Response(JSON.stringify({ status: 'ok', region: 'India' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'create-link') {
            const {
                amount,
                customer_name,
                email,
                return_url,
                phone,
                registration_data // Nested object containing all form fields
            } = body;

            // 1. Generate a unique Order ID
            const orderId = `CK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // 2. Insert PENDING registration into Supabase first
            const { error: dbError } = await supabase
                .from('registrations')
                .insert([{
                    name: customer_name,
                    email: email,
                    phone: phone,
                    order_id: orderId,
                    payment_status: 'pending',
                    ...registration_data // Spread other fields (college, department, etc)
                }]);

            if (dbError) {
                console.error('Database Insert Error:', dbError);
                throw new Error('Internal error creating registration record.');
            }

            // 3. Get Zoho Access Token
            const accessToken = await getZohoAccessToken();
            const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID');

            // 4. Create Zoho Payment Link
            // Note: reference_id is how we match the webhook back to this order.
            const zohoPayload = {
                amount: parseFloat(amount),
                currency: 'INR',
                email: email,
                customer_name: customer_name,
                return_url: return_url || 'https://www.codekarx.com?status=success',
                reference_id: orderId,
                description: `CodeKar Registration - ${customer_name}`
            };

            console.log('[ZOHO] Payload:', JSON.stringify(zohoPayload));

            const zohoRes = await fetch(`https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(zohoPayload),
            });

            const zohoData = await zohoRes.json();

            if (!zohoRes.ok) {
                console.error('[ZOHO] Error Response:', zohoData);
                throw new Error(zohoData.message || 'Zoho API rejected the payment link request.');
            }

            const paymentLink = zohoData.payment_link;
            console.log(`✅ Success! Payment Link: ${paymentLink}`);

            return new Response(JSON.stringify({
                payment_url: paymentLink,
                order_id: orderId
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('Edge Function Error:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Internal Server Error',
            hint: 'Check Supabase logs for full details.'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
