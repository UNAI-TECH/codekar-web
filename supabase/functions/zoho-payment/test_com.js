
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
        const text = await res.text();
        console.log("Status:", res.status, "Resp:", text.slice(0, 500));
    } catch (e) { console.log("Error:", e.message); }
}

async function run() {
    const payload = {
        amount: 1.0,
        currency: "INR",
        organization_id: orgId,
        description: "Com Test"
    };

    await test("Zohoapis.com Payments", "https://www.zohoapis.com/payments/v1/paymentlinks", payload);
    await test("Zoho.com Payments", "https://payments.zoho.com/api/v1/paymentlinks", payload);
}

run();
