
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function run() {
    console.log("--- Testing Minimal Books Payload ---");
    const url = `https://books.zoho.in/api/v3/paymentlinks?organization_id=${orgId}`;
    const payload = {
        amount: "100.00",
        currency_code: "INR",
        description: "Test Link"
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ JSONString: JSON.stringify(payload) }).toString()
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) { console.log("Error:", e.message); }
}

run();
