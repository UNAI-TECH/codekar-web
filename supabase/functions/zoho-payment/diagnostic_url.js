
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";

async function test(name, url, payload, headers = {}) {
    console.log(`\nTesting: ${name}`);
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
    const payload = { amount: 100, currency: "INR", description: "Test" };

    // Test 14: apikey in query string
    await test("apikey in query string",
        `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}&apikey=${apiKey}`,
        payload);

    // Test 15: apikey in query string (no account_id in query)
    await test("apikey in query string (no account_id in query)",
        `https://payments.zoho.in/api/v1/paymentlinks?apikey=${apiKey}`,
        { ...payload, account_id: accountId });

    // Test 16: Extra param check (from step 245 result)
    await test("Extra param check",
        `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}&apikey=${apiKey}`,
        payload);
}

run();
