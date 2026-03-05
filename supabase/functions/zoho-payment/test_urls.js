
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const accountId = "60064885204";

async function test(name, url, method = "POST", body = null) {
    console.log(`\nTesting: ${name} (${url})`);
    try {
        const options = {
            method,
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json"
            }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(url, options);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    const payload = { amount: 100, currency: "INR", description: "Test" };

    // 1. Payments on zohoapis.in
    await test("Payments v1 (zohoapis.in)", `https://www.zohoapis.in/payments/v1/paymentlinks?account_id=${accountId}`, "POST", payload);

    // 2. Payments v1 (no /api prefix) on zoho.in
    await test("Payments v1 (no /api) on zoho.in", `https://payments.zoho.in/v1/paymentlinks?account_id=${accountId}`, "POST", payload);

    // 3. Info check on zohoapis.in
    await test("Info (zohoapis.in)", `https://www.zohoapis.in/api/v1/info`, "GET");
}

run();
