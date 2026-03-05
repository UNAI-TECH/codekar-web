
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";

async function test(name, url, payload, headers) {
    console.log(`\nTesting: ${name} (${url})`);
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
    const headers = { "apikey": apiKey };

    // Test 12: zohoapis.in
    await test("zohoapis.in",
        `https://payments.zohoapis.in/api/v1/paymentlinks?account_id=${accountId}`,
        payload, headers);

    // Test 13: zoho.com (just in case)
    await test("zoho.com",
        `https://payments.zoho.com/api/v1/paymentlinks?account_id=${accountId}`,
        payload, headers);
}

run();
