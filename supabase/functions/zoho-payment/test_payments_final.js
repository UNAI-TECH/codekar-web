
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id = "60064885204";

async function run() {
    console.log("--- Final Payments API Test (Higher Amount) ---");
    const url = `https://payments.zoho.in/api/v1/paymentlinks`;
    const payload = {
        account_id: id,
        amount: 100, // INR 100 (assuming integer rupees)
        currency: "INR",
        description: "CodeKar Registration payment for test"
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
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) { console.log("Error:", e.message); }
}

run();
