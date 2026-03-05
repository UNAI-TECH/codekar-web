// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Helper to refresh Zoho token (India Only)
async function getZohoAccessToken() {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Zoho OAuth credentials in environment variables.');
    }

    // User specifically requested .in domain for India
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
    // ✅ FIX: Handle CORS preflight FIRST — must return 200 with null body
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        })
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
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'create-link') {
            // Mapping fields from RegistrationModal.astro to database columns
            const {
                amount,
                name,
                email,
                phone,
                college,
                department,
                year,
                project_track,
                project_name,
                registration_type,
                team_name,
                member_2,
                member_3,
                member_4
            } = body;

            // 1. Generate a unique Order ID (using timestamp + random)
            const orderId = `CK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // 2. Insert PENDING registration into Supabase first
            // We use the column names from the existing database schema
            console.log(`[DB] Attempting insert for ${email} with Order ID: ${orderId}`);

            const insertData: any = {
                full_name: name,
                email: email || null,
                phone: phone,
                college: college || null,
                department: department || null,
                year_of_study: year || null,
                track: project_track || null,
                project_name: project_name || null,
                registration_type: registration_type || 'individual',
                team_name: team_name || null,
                amount: Number(amount),
                payment_status: 'pending',
                member_2_name: member_2 || null,
                member_3_name: member_3 || null,
                member_4_name: member_4 || null,
                team_leader_name: name,
                leader_phone: phone,
                leader_email: email || null,
            };

            const { data: reg, error: dbError } = await supabase
                .from('registrations')
                .insert([insertData])
                .select('id')
                .single();

            if (dbError) {
                console.error('[DB] Insert Error:', dbError);
                return new Response(JSON.stringify({
                    error: 'Database Insert Failed',
                    details: dbError.message,
                    hint: dbError.hint,
                    code: dbError.code
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 3. Get Zoho Access Token
            const accessToken = await getZohoAccessToken();
            const accountId = Deno.env.get('ZOHO_PAYMENTS_ACCOUNT_ID');

            // 4. Create Zoho Payment Link
            // We use the Supabase ID (reg.id) as the reference_id for better tracking
            const zohoPayload = {
                amount: parseFloat(amount),
                currency: 'INR',
                email: email,
                customer_name: name,
                return_url: `https://www.codekarx.com/payment-success?registration_id=${reg.id}`,
                reference_id: reg.id,
                description: `CodeKar Registration - ${name}`
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

            // Handle both possible structures of zohoData
            const paymentLink = zohoData.payment_link || zohoData.paymentlink?.payment_link;
            const linkId = zohoData.link_id || zohoData.paymentlink?.link_id;

            console.log(`✅ Success! Payment Link: ${paymentLink}`);

            if (linkId) {
                await supabase.from('registrations').update({ zoho_payment_link_id: linkId }).eq('id', reg.id);
            }

            return new Response(JSON.stringify({
                success: true,
                payment_url: paymentLink,
                registration_id: reg.id
            }), {
                status: 200,
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
