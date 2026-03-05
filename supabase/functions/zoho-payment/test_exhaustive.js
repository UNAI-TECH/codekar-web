
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const ids = ["60064885204", "60058565264"];

async function test(name, id, payload) {
    console.log(`\nTesting: ${name} (ID: ${id})`);
    const url = `https://books.zoho.in/api/v3/paymentlinks?organization_id=${id}`;
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
    for (const id of ids) {
        await test("amount (number)", id, { amount: 100, currency_code: "INR", description: "Test" });
        await test("amount (string)", id, { amount: "100.00", currency_code: "INR", description: "Test" });
        await test("total", id, { total: 100, currency_code: "INR", description: "Test" });
        await test("price", id, { price: 100, currency_code: "INR", description: "Test" });
    }
}

run();
