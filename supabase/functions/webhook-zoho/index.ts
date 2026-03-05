// @ts-nocheck
// Supabase Edge Function: webhook-zoho
// Receives webhook events from Zoho Payments and updates Supabase.
// This ensures payment status is updated even if user closes browser.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

function getSupabaseAdmin() {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    return createClient(url, key);
}

// ── Verify Zoho Webhook Signature ─────────────────────────────────────────────
async function verifyWebhookSignature(
    payload: string,
    signatureHeader: string | null
): Promise<boolean> {
    const webhookSecret = Deno.env.get("ZOHO_PAYMENTS_WEBHOOK_SECRET");

    if (!webhookSecret) {
        console.warn("ZOHO_PAYMENTS_WEBHOOK_SECRET not set — skipping signature check");
        return true; // In production, return false here!
    }

    if (!signatureHeader) {
        console.warn("No signature header received");
        return false;
    }

    // Zoho signature format: t=<timestamp>,v=<HMAC-SHA256-hex>
    const parts = signatureHeader.split(",");
    const tPart = parts.find((p) => p.startsWith("t="));
    const vPart = parts.find((p) => p.startsWith("v="));

    if (!tPart || !vPart) {
        console.warn("Invalid signature header format:", signatureHeader);
        return false;
    }

    const timestamp = tPart.split("=")[1];
    const signature = vPart.split("=")[1];
    const dataToSign = `${timestamp}.${payload}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const messageData = encoder.encode(dataToSign);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return expectedSignature === signature;
}

// ── Main Handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Always return 200 to Zoho (to prevent retry storm on any error)
    const ok = new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    try {
        const rawBody = await req.text();
        const signatureHeader = req.headers.get("X-Zoho-Webhook-Signature");

        console.log("Webhook received. Signature header:", signatureHeader);
        console.log("Webhook raw body:", rawBody.slice(0, 500));

        const isValid = await verifyWebhookSignature(rawBody, signatureHeader);

        if (!isValid) {
            console.error("❌ Invalid webhook signature — ignoring");
            // Return 200 but don't process
            return ok;
        }

        let event: any;
        try {
            event = JSON.parse(rawBody);
        } catch {
            console.log("Webhook body is not JSON — likely a verification ping");
            return ok;
        }

        const eventType = event.event || event.type || "";
        console.log("Webhook event type:", eventType);

        // Handle payment events
        if (!eventType) {
            console.warn("No event type in webhook payload:", JSON.stringify(event));
            return ok;
        }

        const supabase = getSupabaseAdmin();

        // Extract reference_id (our registration_id) from the event
        // Zoho webhooks include the reference_id in payment data
        const paymentData =
            event.payload?.payment ||
            event.payment ||
            event.data?.payment ||
            event.data?.paymentlink ||
            {};

        const referenceId =
            paymentData.reference_id ||
            paymentData.referenceId ||
            event.reference_id ||
            null;

        const zohoPaymentId =
            paymentData.payment_id ||
            paymentData.id ||
            event.payment_id ||
            null;

        console.log("Reference ID:", referenceId, "Payment ID:", zohoPaymentId);

        if (!referenceId) {
            console.warn("No reference_id in webhook event — cannot update DB");
            return ok;
        }

        // SUCCESS events
        if (
            eventType.includes("payment.captured") ||
            eventType.includes("payment.success") ||
            eventType.includes("paymentlink.paid") ||
            eventType === "payment_completed"
        ) {
            // Idempotency: only update if still pending
            const { data: reg } = await supabase
                .from("registrations")
                .select("id, payment_status, registration_type, name, team_name, email")
                .eq("id", referenceId)
                .single();

            if (reg && reg.payment_status !== "paid") {
                const prefix = reg.registration_type === "team" ? "TEAM" : "IND";
                const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
                const generatedCode = `${prefix}-2026-${randomStr}`;

                await supabase
                    .from("registrations")
                    .update({
                        payment_status: "paid",
                        zoho_payment_id: zohoPaymentId || null,
                        generated_code: generatedCode,
                    })
                    .eq("id", referenceId);

                console.log(`✅ Webhook: Registration ${referenceId} marked as paid`);

                // Send confirmation email (non-blocking)
                try {
                    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
                    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
                    fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${serviceKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: reg.team_name || reg.name,
                            email: reg.email,
                            unique_code: generatedCode,
                        }),
                    }).catch(() => { });
                } catch { }
            } else {
                console.log(`Skipping update — already ${reg?.payment_status || "unknown"}`);
            }
        }

        // FAILURE / CANCELLATION events
        else if (
            eventType.includes("payment.failed") ||
            eventType.includes("payment.cancelled") ||
            eventType.includes("paymentlink.expired")
        ) {
            await supabase
                .from("registrations")
                .update({ payment_status: "failed" })
                .eq("id", referenceId)
                .not("payment_status", "eq", "paid"); // Never downgrade from paid

            console.log(`❌ Webhook: Registration ${referenceId} marked as failed`);
        } else {
            console.log(`Unhandled event type: ${eventType}`);
        }

        return ok;
    } catch (error: any) {
        console.error("Webhook processing error:", error.message, error.stack);
        // Always return 200 to Zoho
        return ok;
    }
});
