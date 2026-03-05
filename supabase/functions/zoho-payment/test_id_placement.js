
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const ids = ["60064885204", "60058565264"];

async function run() {
    console.log("--- Account ID Placement Test (Payments API) ---");

    for (const id of ids) {
        // 1. In Query
        console.log(`\nTesting ID in QUERY: ${id}`);
        try {
            const res = await fetch(`https://payments.zoho.in/api/v1/paymentlinks?account_id=${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ amount: 100, currency: "INR", description: "Test" })
            });
            console.log("Status:", res.status, "Resp:", await res.text());
        } catch (e) { }

        // 2. In Body
        console.log(`\nTesting ID in BODY: ${id}`);
        try {
            const res = await fetch(`https://payments.zoho.in/api/v1/paymentlinks`, {
                method: "POST",
                headers: {
                    "Authorization": `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ account_id: id, amount: 100, currency: "INR", description: "Test" })
            });
            console.log("Status:", res.status, "Resp:", await res.text());
        } catch (e) { }
    }
}

run();
