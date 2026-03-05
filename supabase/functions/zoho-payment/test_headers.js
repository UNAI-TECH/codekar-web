
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const ids = ["60064885204", "60058565264"];

async function test(name, url, headers) {
    console.log(`\nTesting: ${name}`);
    const payload = { amount: 100, currency: "INR", description: "Test" };
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    for (const id of ids) {
        // 1. Try Bearer
        await test(`Payments Bearer (ID: ${id})`, `https://payments.zoho.in/api/v1/paymentlinks?account_id=${id}`, {
            "Authorization": `Bearer ${accessToken}`
        });

        // 2. Try apikey (with OAuth token)
        await test(`Payments apikey header (ID: ${id})`, `https://payments.zoho.in/api/v1/paymentlinks?account_id=${id}`, {
            "apikey": accessToken
        });
    }
}

run();
