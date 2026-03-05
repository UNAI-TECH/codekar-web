
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";
const orgId = "60058565264";

const payloads = {
    payments_minimal: {
        amount: 1.00,
        currency: "INR",
        description: "CodeKar Registration"
    },
    payments_with_ref: () => ({
        amount: 1.00,
        currency: "INR",
        description: "CodeKar Registration",
        reference_id: "T" + Date.now()
    }),
    payments_full: () => ({
        amount: 1.00,
        currency: "INR",
        description: "CodeKar Registration",
        email: "test@example.com",
        return_url: "https://www.codekarx.com/ps",
        cancel_url: "https://www.codekarx.com/pf",
        reference_id: "T" + Date.now()
    }),
    payments_alt: {
        amount: 1,
        currency: "INR",
        product_description: "CodeKar Registration",
        customer_name: "Test User",
        customer_email: "test@example.com",
        reference_id: "T" + Date.now()
    }
};

const tests = [
    { url: `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, headers: { "apikey": apiKey }, payload: payloads.payments_minimal, name: "Payments minimal" },
    { url: `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, headers: { "apikey": apiKey }, payload: payloads.payments_with_ref, name: "Payments with ref" },
    { url: `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, headers: { "apikey": apiKey }, payload: payloads.payments_full, name: "Payments full" },

    // Payments API .in
    { url: `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, headers: { "X-ZPAY-API-KEY": apiKey }, payload: payloads.payments_full, name: "Payments .in X-ZPAY-API-KEY" },
    { url: `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`, headers: { "Authorization": `Zoho-encapikey ${apiKey}` }, payload: payloads.payments_full, name: "Payments .in Zoho-encapikey" },
    { url: `https://payments.zoho.in/api/v1/paymentlinks`, headers: { "apikey": apiKey, "X-com-zoho-payments-accountid": accountId }, payload: payloads.payments_full, name: "Payments .in apikey + X-com-header" },

    // Books API .in
    { url: `https://books.zoho.in/api/v3/paymentlinks?organization_id=${accountId}`, headers: { "apikey": apiKey }, payload: payloads.books, name: "Books .in apikey (org2)" },
    { url: `https://books.zoho.in/api/v3/paymentlinks?organization_id=${orgId}`, headers: { "Authorization": `Zoho-encapikey ${apiKey}` }, payload: payloads.books, name: "Books .in Zoho-encapikey" },
];

async function runTests() {
    for (const test of tests) {
        console.log(`\nTesting: ${test.name}`);
        try {
            const payload = typeof test.payload === 'function' ? test.payload() : test.payload;
            const res = await fetch(test.url, {
                method: "POST",
                headers: { ...test.headers, "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            console.log(`Status: ${res.status}`);
            console.log(`Response: ${text.slice(0, 500)}`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

runTests();
