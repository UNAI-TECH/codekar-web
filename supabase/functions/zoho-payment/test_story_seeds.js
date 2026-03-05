
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function run() {
    console.log("--- Testing Story Seeds Implementation Logic ---");
    const url = `https://payments.zoho.in/api/v1/paymentlinks`;

    const payload = {
        amount: 1.0,
        currency_code: "INR",
        organization_id: orgId,
        email: "test@codekarx.com",
        return_url: "https://www.codekarx.com/payment-success",
        reference_id: "TEST_" + Date.now(),
        description: "Test Payment from Story Seeds Logic"
    };

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
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) { console.log("Error:", e.message); }
}

run();
