import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        // Zoho sends webhooks as POST with JSON body
        // Note: You should ideally verify the Zoho signature here if they provide one.
        const payload = await req.json();
        console.log('[WEBHOOK] Received payload:', JSON.stringify(payload));

        // The key field is reference_id which we mapped to order_id
        const {
            reference_id,
            status,
            transaction_id,
            payment_method,
            payment_time
        } = payload;

        if (!reference_id) {
            console.error('[WEBHOOK] Missing reference_id');
            return new Response(JSON.stringify({ error: 'Missing reference_id' }), { status: 400 });
        }

        // We only care about success
        if (status === 'success' || status === 'captured' || status === 'Completed') {
            console.log(`[WEBHOOK] Payment success for Order: ${reference_id}`);

            // Update the registration record
            const { error: updateError } = await supabase
                .from('registrations')
                .update({
                    payment_status: 'success',
                    confirmed: true,
                    transaction_id: transaction_id,
                    payment_method: payment_method,
                    payment_time: payment_time ? new Date(payment_time).toISOString() : new Date().toISOString()
                })
                .eq('order_id', reference_id);

            if (updateError) {
                console.error('[WEBHOOK] DB Update Error:', updateError);
                return new Response(JSON.stringify({ error: 'DB update failed' }), { status: 500 });
            }

            console.log(`[WEBHOOK] Successfully confirmed registration for: ${reference_id}`);

            // Trigger confirmation email if you have that logic elsewhere
            // try {
            //     await supabase.functions.invoke('send-confirmation-email', { body: { orderId: reference_id } });
            // } catch (e) {
            //     console.error('[WEBHOOK] Email trigger failed:', e);
            // }
        } else {
            console.log(`[WEBHOOK] Payment status for ${reference_id} is: ${status}`);

            // Update to failed if appropriate
            await supabase
                .from('registrations')
                .update({ payment_status: status.toLowerCase() })
                .eq('order_id', reference_id);
        }

        return new Response(JSON.stringify({ status: 'received' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[WEBHOOK] Critical Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
