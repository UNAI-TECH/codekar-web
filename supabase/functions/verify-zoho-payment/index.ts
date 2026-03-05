// @ts-nocheck
// Supabase Edge Function: verify-zoho-payment
// Called by frontend after Zoho redirect to verify payment server-side.
// Never trust the redirect URL alone — always verify with Zoho API.
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

// Priority 1: 1003.xxx API key → use directly as Zoho-encapikey
// Priority 2: 1003.xxx refresh token → use as static key
// Priority 3: Standard OAuth refresh
async function resolveZohoToken(): Promise<{ token: string; headerPrefix: string; domain: string }> {
    const paymentsApiKey = Deno.env.get("ZOHO_PAYMENTS_API_KEY");
    const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");

    if (paymentsApiKey && (paymentsApiKey.startsWith("1003.") || paymentsApiKey.startsWith("1002."))) {
        return { token: paymentsApiKey, headerPrefix: "Zoho-encapikey", domain: "in" };
    }
    if (refreshToken && (refreshToken.startsWith("1003.") || refreshToken.startsWith("1002."))) {
        return { token: refreshToken, headerPrefix: "Zoho-encapikey", domain: "in" };
    }
    if (clientId && clientSecret && refreshToken) {
        for (const domain of ["in", "com"]) {
            try {
                const tokenUrl = new URL(`https://accounts.zoho.${domain}/oauth/v2/token`);
                tokenUrl.searchParams.set("refresh_token", refreshToken);
                tokenUrl.searchParams.set("client_id", clientId);
                tokenUrl.searchParams.set("client_secret", clientSecret);
                tokenUrl.searchParams.set("grant_type", "refresh_token");
                const res = await fetch(tokenUrl.toString(), { method: "POST" });
                const data = await res.json();
                if (res.ok && data.access_token) {
                    console.log(`[AUTH] Successfully obtained access token from domain: ${domain}`);
                    return { token: data.access_token, headerPrefix: "Zoho-oauthtoken", domain };
                }
                console.warn(`[AUTH] Domain ${domain} refresh failed:`, JSON.stringify(data));
            } catch (e) {
                console.error(`[AUTH] OAuth refresh exception for domain ${domain}:`, e.message);
            }
        }
    }
    throw new Error("No valid Zoho auth token. Set ZOHO_PAYMENTS_API_KEY in Supabase secrets.");
}

// ── Check session status via Zoho API ─────────────────────────────────────────
async function checkZohoSessionStatus(sessionId: string): Promise<{
    status: "paid" | "pending" | "failed";
    zoho_payment_id?: string;
}> {
    const { token, headerPrefix, domain } = await resolveZohoToken();
    const accountId = Deno.env.get("ZOHO_PAYMENTS_ACCOUNT_ID");
    console.log(`[VERIFY][SESSION] Checking status for ${sessionId} using Account ID: ${accountId} on domain: ${domain}`);

    const apiUrl = `https://payments.zoho.${domain}/api/v1/paymentsessions/${sessionId}?account_id=${accountId}`;

    const res = await fetch(apiUrl, {
        headers: {
            Authorization: `${headerPrefix} ${token}`,
            "Content-Type": "application/json",
        },
    });

    const data = await res.json();
    if (!res.ok) {
        console.warn(`[VERIFY][SESSION][ERROR] Status ${res.status}:`, JSON.stringify(data));
        return { status: "pending" };
    }
    const sessionData = data.payments_session || data;
    const sessionStatus = (sessionData.status || "").toLowerCase();

    if (sessionStatus === "succeeded") {
        const payments = sessionData.payments || [];
        const lastPayment = payments[payments.length - 1];
        return { status: "paid", zoho_payment_id: lastPayment?.payment_id };
    } else if (sessionStatus === "failed") {
        return { status: "failed" };
    }

    return { status: "pending" };
}

// ── Check payment link status via Zoho API ────────────────────────────────────
async function checkZohoPaymentLinkStatus(payment_link_id: string): Promise<{
    status: "paid" | "pending" | "failed" | "cancelled" | "expired";
    zoho_payment_id?: string;
}> {
    const { token, headerPrefix, domain } = await resolveZohoToken();
    const accountId = Deno.env.get("ZOHO_PAYMENTS_ACCOUNT_ID");

    if (!accountId) {
        throw new Error("ZOHO_PAYMENTS_ACCOUNT_ID is not configured.");
    }

    // Get payment link details from Zoho
    const apiUrl = `https://payments.zoho.${domain}/api/v1/paymentlinks/${payment_link_id}?account_id=${accountId}`;

    const res = await fetch(apiUrl, {
        headers: {
            Authorization: `${headerPrefix} ${token}`,
            "Content-Type": "application/json",
        },
    });

    const rawText = await res.text();
    console.log(`Zoho verify response (${res.status}):`, rawText);

    let data: any;
    try {
        data = JSON.parse(rawText);
    } catch {
        throw new Error(`Zoho verify returned non-JSON: ${rawText.slice(0, 200)}`);
    }

    if (!res.ok) {
        throw new Error(
            `Zoho verify API error ${res.status}: ${data?.message || rawText.slice(0, 200)}`
        );
    }

    // The payment link status from Zoho:
    // "active" - link exists but not yet paid
    // "paid" / "payment_done" - payment complete
    // "expired" - link expired
    const linkData = data.paymentlink || data.payment_link || data.data || data;
    const zohoStatus = (linkData.status || "").toLowerCase();
    const payments = linkData.payments || [];
    const lastPayment = payments[payments.length - 1];

    let status: "paid" | "pending" | "failed" | "cancelled" | "expired" =
        "pending";

    if (
        zohoStatus === "paid" ||
        zohoStatus === "payment_done" ||
        zohoStatus === "completed"
    ) {
        status = "paid";
    } else if (zohoStatus === "expired") {
        status = "expired";
    } else if (zohoStatus === "cancelled" || zohoStatus === "canceled") {
        status = "cancelled";
    } else if (lastPayment?.status === "success" || lastPayment?.status === "paid") {
        status = "paid";
    } else if (lastPayment?.status === "failed") {
        status = "failed";
    }

    const zoho_payment_id =
        lastPayment?.payment_id ||
        lastPayment?.id ||
        linkData.payment_id ||
        undefined;

    return { status, zoho_payment_id };
}

// ── Main Handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { registration_id } = body;

        if (!registration_id) {
            return new Response(
                JSON.stringify({ error: "registration_id is required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const supabase = getSupabaseAdmin();

        // 1. Get registration from Supabase
        const { data: registration, error: fetchError } = await supabase
            .from("registrations")
            .select("*")
            .eq("id", registration_id)
            .single();

        if (fetchError || !registration) {
            return new Response(
                JSON.stringify({ error: "Registration not found" }),
                {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // 2. Idempotency guard — if already paid/failed, return current status
        if (registration.payment_status === "paid") {
            return new Response(
                JSON.stringify({
                    status: "paid",
                    registration,
                    message: "Payment already verified",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (registration.payment_status === "failed") {
            return new Response(
                JSON.stringify({
                    status: "failed",
                    registration,
                    message: "Payment was failed/cancelled",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 3. If no Zoho payment link ID or Session ID, we can't verify — return pending
        if (!registration.zoho_payment_link_id && !registration.zoho_session_id) {
            console.warn(
                "No zoho_payment_link_id or zoho_session_id found for registration:",
                registration_id
            );

            return new Response(
                JSON.stringify({
                    status: "pending",
                    registration,
                    message: "Payment ID not found — waiting for creation",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 4. Verify with Zoho API
        let zohoStatus: string;
        let zoho_payment_id: string | undefined;

        if (registration.zoho_session_id) {
            const sessionResult = await checkZohoSessionStatus(registration.zoho_session_id);
            zohoStatus = sessionResult.status;
            zoho_payment_id = sessionResult.zoho_payment_id;
        } else {
            const linkResult = await checkZohoPaymentLinkStatus(registration.zoho_payment_link_id!);
            zohoStatus = linkResult.status;
            zoho_payment_id = linkResult.zoho_payment_id;
        }

        console.log(
            `Zoho status for registration ${registration_id}: ${zohoStatus}`
        );

        // 5. Update Supabase based on Zoho status
        if (zohoStatus === "paid" || zohoStatus === "completed") {
            // Generate unique participation code
            const prefix = registration.registration_type === "team" ? "TEAM" : "IND";
            const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
            const generatedCode = `${prefix}-2026-${randomStr}`;

            const { data: updated, error: updateError } = await supabase
                .from("registrations")
                .update({
                    payment_status: "paid",
                    zoho_payment_id: zoho_payment_id || null,
                    generated_code: generatedCode,
                })
                .eq("id", registration_id)
                .select()
                .single();

            if (updateError) {
                console.error("Supabase update error:", updateError);
                throw new Error(`Failed to update payment status: ${updateError.message}`);
            }

            // Send confirmation email (non-blocking)
            try {
                const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
                const supabaseAnonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
                fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${supabaseAnonKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: updated.team_name || updated.name,
                        email: updated.email,
                        unique_code: generatedCode,
                    }),
                }).catch(() => { });
            } catch { }

            return new Response(
                JSON.stringify({
                    status: "paid",
                    registration: updated,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (
            zohoStatus === "failed" ||
            zohoStatus === "cancelled" ||
            zohoStatus === "expired"
        ) {
            await supabase
                .from("registrations")
                .update({ payment_status: "failed" })
                .eq("id", registration_id);

            return new Response(
                JSON.stringify({
                    status: "failed",
                    registration: { ...registration, payment_status: "failed" },
                    message: `Payment ${zohoStatus}`,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Still pending
        return new Response(
            JSON.stringify({
                status: "pending",
                registration,
                message: "Payment not yet completed",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("verify-zoho-payment error:", error.message, error.stack);
        return new Response(
            JSON.stringify({
                error: error.message || "Internal server error",
                hint: "Check Supabase → Functions → verify-zoho-payment → Logs",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
