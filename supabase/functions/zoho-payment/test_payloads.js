
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
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
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    await test("total_amount", { total_amount: 100, currency_code: "INR", description: "Test" });
    await test("payment_amount", { payment_amount: 100, currency_code: "INR", description: "Test" });
    await test("amount as string", { amount: "100", currency_code: "INR", description: "Test" });
    await test("full camelCase", { Amount: 100, CurrencyCode: "INR", Description: "Test" });
    await test("nested in data", { data: { amount: 100, currency_code: "INR", description: "Test" } });
}

run();
