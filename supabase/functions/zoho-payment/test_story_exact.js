
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const ids = ["60064885204", "60058565264"];

async function test(id) {
    console.log(`\n--- Testing with ID: ${id} ---`);
    const payload = {
        amount: 1.0,
        currency_code: "INR",
        organization_id: id,
        email: "test@codekarx.com",
        return_url: "https://www.codekarx.com/payment-success",
        reference_id: "REF_" + Date.now(),
        description: "Exact Story Seeds Logic Test"
    };

    const res = await fetch("https://payments.zoho.in/api/v1/paymentlinks", {
        method: "POST",
        headers: {
            "Authorization": `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Resp:", text);
}

async function run() {
    for (const id of ids) {
        await test(id);
    }
}

run();
