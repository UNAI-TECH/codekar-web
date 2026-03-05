
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";
const orgId = "60058565264";

async function test(name, payload, headers, accId = accountId) {
    console.log(`\nTesting: ${name} (ID: ${accId})`);
    const url = `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accId}`;
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

    // Test 5: Full payload with orgId
    await test("Full Payload (OrgId)",
        {
            amount: 100,
            currency: "INR",
            description: "Test",
            email: "test@example.com",
            reference_id: ref,
            return_url: "https://www.codekarx.com/ps"
        },
        { "apikey": apiKey }, orgId);

    // Test 6: Full payload minus return_url
    await test("Full Payload minus return_url",
        {
            amount: 100,
            currency: "INR",
            description: "Test",
            email: "test@example.com",
            reference_id: ref
        },
        { "apikey": apiKey });

    // Test 7: Full payload minus reference_id
    await test("Full Payload minus reference_id",
        {
            amount: 100,
            currency: "INR",
            description: "Test",
            email: "test@example.com",
            return_url: "https://www.codekarx.com/ps"
        },
        { "apikey": apiKey });

    // Test 8: Full payload with X-ZPAY-API-KEY
    await test("Full Payload (X-ZPAY-API-KEY)",
        {
            amount: 100,
            currency: "INR",
            description: "Test",
            email: "test@example.com",
            reference_id: ref,
            return_url: "https://www.codekarx.com/ps"
        },
        { "X-ZPAY-API-KEY": apiKey });
}

run();
