
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id1 = "60064885204";
const id2 = "60058565264";

async function test(name, payload) {
    console.log(`\nTesting: ${name}`);
    const url = `https://payments.zoho.in/api/v1/paymentlinks`;
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
        console.log("Status:", res.status, "Data:", JSON.stringify(data).slice(0, 300));
    } catch (e) { console.log("Error:", e.message); }
}

async function run() {
    await test("ID1 + currency", { amount: 1.0, currency: "INR", organization_id: id1, description: "Test" });
    await test("ID1 + currency_code", { amount: 1.0, currency_code: "INR", organization_id: id1, description: "Test" });
    await test("ID2 + currency", { amount: 1.0, currency: "INR", organization_id: id2, description: "Test" });
    await test("ID2 + currency_code", { amount: 1.0, currency_code: "INR", organization_id: id2, description: "Test" });
}

run();
