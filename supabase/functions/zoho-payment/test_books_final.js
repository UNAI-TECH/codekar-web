
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function test(name, payload) {
    console.log(`\nTesting: ${name}`);
    const url = `https://books.zoho.in/api/v3/paymentlinks?organization_id=${orgId}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ JSONString: JSON.stringify(payload) }).toString()
        });
        const text = await res.text();
        console.log("Status:", res.status, "Resp:", text);
    } catch (e) { }
}

async function run() {
    await test("amount float", { amount: 10.0, currency_code: "INR", description: "Test" });
    await test("amount string float", { amount: "10.00", currency_code: "INR", description: "Test" });
    await test("total_amount float", { total_amount: 10.0, currency_code: "INR", description: "Test" });
    await test("payment_amount float", { payment_amount: 10.0, currency_code: "INR", description: "Test" });
    await test("amount Paisa", { amount: 1000, currency_code: "INR", description: "Test" });
}

run();
