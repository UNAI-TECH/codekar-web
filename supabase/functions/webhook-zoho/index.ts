// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const payload = await req.json();
        console.log('[WEBHOOK] Received payload:', JSON.stringify(payload));

        // Zoho reference_id is our registration ID
        const reference_id = payload.reference_id || payload.referenceId || payload.payload?.payment?.reference_id;
        const status = (payload.status || payload.payload?.payment?.status || "").toLowerCase();
        const transaction_id = payload.transaction_id || payload.payload?.payment?.payment_id;

        if (!reference_id) {
            console.error('[WEBHOOK] Missing reference_id in payload');
            return new Response(JSON.stringify({ error: 'Missing reference_id' }), { status: 400 });
        }

        // Handle Payment Success
        if (status === 'success' || status === 'captured' || status === 'completed') {
            console.log(`[WEBHOOK] Payment success for ID: ${reference_id}`);

            // Fetch registration type for code generation
            const { data: reg } = await supabase.from('registrations').select('registration_type, payment_status').eq('id', reference_id).single();

            if (reg && reg.payment_status !== 'paid') {
                const prefix = reg.registration_type === 'team' ? 'TEAM' : 'IND';
                const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
                const code = `${prefix}-2026-${randomStr}`;

                const { error: updateError } = await supabase
                    .from('registrations')
                    .update({
                        payment_status: 'paid',
                        zoho_payment_id: transaction_id,
                        transaction_id: transaction_id,
                        generated_code: code
                    })
                    .eq('id', reference_id);

                if (updateError) {
                    console.error('[WEBHOOK] DB Update Error:', updateError.message);
                    return new Response(JSON.stringify({ error: 'DB update failed' }), { status: 500 });
                }

                console.log(`[WEBHOOK] Successfully confirmed registration ${reference_id}. Code: ${code}`);
            }
        }
        else if (status === 'failed' || status === 'cancelled') {
            console.log(`[WEBHOOK] Payment ${status} for ${reference_id}`);
            await supabase
                .from('registrations')
                .update({ payment_status: 'failed' })
                .eq('id', reference_id)
                .not('payment_status', 'eq', 'paid');
        }

        return new Response(JSON.stringify({ status: 'received' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[WEBHOOK] Critical Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
