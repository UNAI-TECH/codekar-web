
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id = "60064885204";

const headersToTest = [
    { name: "Authorization", value: `Zoho-oauthtoken ${accessToken}` },
    { name: "Authorization", value: `Bearer ${accessToken}` },
    { name: "Authorization", value: `Zoho-encapikey ${accessToken}` },
    { name: "apikey", value: accessToken },
    { name: "X-ZPAY-API-KEY", value: accessToken },
];

async function run() {
    console.log("--- Brute Forcing Headers (Payments API) ---");
    const url = `https://payments.zoho.in/api/v1/paymentlinks?account_id=${id}`;
    const payload = { amount: 100, currency: "INR", description: "Test" };

    for (const h of headersToTest) {
        console.log(`\nTesting Header: ${h.name} = ${h.value.slice(0, 20)}...`);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    [h.name]: h.value,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            console.log("Status:", res.status);
            console.log("Response:", text.slice(0, 200));
        } catch (e) { console.log("Error:", e.message); }
    }
}

run();
