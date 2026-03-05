
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id = "60064885204";

async function test(name, payload) {
    console.log(`\nTesting: ${name}`);
    try {
        const res = await fetch(`https://payments.zoho.in/api/v1/paymentlinks`, {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ account_id: id, ...payload })
        });
        const text = await res.text();
        console.log("Status:", res.status, "Resp:", text);
    } catch (e) { }
}

async function run() {
    await test("Minimal (amount/currency)", { amount: 100, currency: "INR" });
    await test("With Description", { amount: 100, currency: "INR", description: "Test" });
    await test("Full (with URLs)", {
        amount: 100,
        currency: "INR",
        description: "Test",
        return_url: "https://www.codekarx.com/payment-success",
        cancel_url: "https://www.codekarx.com/payment-failed"
    });
    await test("Reference ID", { amount: 100, currency: "INR", reference_id: "REF123" });
}

run();
