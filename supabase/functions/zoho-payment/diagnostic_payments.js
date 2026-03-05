
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";

async function test(name, payload, headers) {
    console.log(`\nTesting: ${name}`);
    const url = `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    const ref = "T" + Date.now();

    // Test 1: Minimal required fields
    await test("Minimal (apikey)",
        { amount: 100, currency: "INR", description: "Test" },
        { "apikey": apiKey });

    // Test 2: With X-ZPAY-API-KEY
    await test("Minimal (X-ZPAY-API-KEY)",
        { amount: 100, currency: "INR", description: "Test" },
        { "X-ZPAY-API-KEY": apiKey });

    // Test 3: With Zoho-encapikey
    await test("Minimal (Zoho-encapikey)",
        { amount: 100, currency: "INR", description: "Test" },
        { "Authorization": `Zoho-encapikey ${apiKey}` });

    // Test 4: Full payload as used in code
    await test("Full Payload",
        {
            amount: 100,
            currency: "INR",
            description: "CodeKar Registration Test",
            email: "test@example.com",
            reference_id: ref,
            return_url: "https://www.codekarx.com/payment-success",
            cancel_url: "https://www.codekarx.com/payment-failed"
        },
        { "apikey": apiKey });
}

run();
