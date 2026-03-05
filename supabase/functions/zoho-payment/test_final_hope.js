
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function test(name, url, payload) {
    console.log(`\nTesting: ${name} URL: ${url}`);
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
    const payload = {
        amount: 1.0,
        currency_code: "INR",
        organization_id: orgId,
        description: "Final Try"
    };

    await test("Zohoapis.in Payments", "https://www.zohoapis.in/payments/v1/paymentlinks", payload);
    await test("Zoho.in Payments", "https://payments.zoho.in/api/v1/paymentlinks", payload);
}

run();
