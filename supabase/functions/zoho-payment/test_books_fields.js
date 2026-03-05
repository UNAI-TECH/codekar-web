
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgIds = ["60064885204", "60058565264"];

async function test(name, orgId, payload) {
    console.log(`\nTesting ${name} (Org: ${orgId})`);
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
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) { console.log("Error:", e.message); }
}

async function run() {
    for (const id of orgIds) {
        await test("amount (number)", id, { amount: 100, currency_code: "INR", description: "Test" });
        await test("payment_amount", id, { payment_amount: 100, currency_code: "INR", description: "Test" });
        await test("total_amount", id, { total_amount: 100, currency_code: "INR", description: "Test" });
    }
}

run();
