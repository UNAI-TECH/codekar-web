
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function test(name, payload) {
    console.log(`\nTesting: ${name}`);
    const url = `https://www.zohoapis.in/payments/v1/paymentlinks`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status, "Data:", JSON.stringify(data));
    } catch (e) { }
}

async function run() {
    // Variations based on typical Zoho quirks
    await test("Amt number + currency", { amount: 1.0, currency: "INR", organization_id: orgId, description: "Test" });
    await test("Amt string + currency", { amount: "1.00", currency: "INR", organization_id: orgId, description: "Test" });
    await test("Amt number + currency_code", { amount: 1.0, currency_code: "INR", organization_id: orgId, description: "Test" });
    await test("Amt string + currency_code", { amount: "1.00", currency_code: "INR", organization_id: orgId, description: "Test" });
    await test("Account ID instead of Org ID", { amount: 1.0, currency: "INR", account_id: orgId, description: "Test" });
}

run();
