
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const orgId = "60064885204";

async function test(name, url) {
    console.log(`\nTesting: ${name}`);
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`
            }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 1000)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    await test("List Links", `https://books.zoho.in/api/v3/paymentlinks?organization_id=${orgId}`);
    await test("List Payments", `https://books.zoho.in/api/v3/payments?organization_id=${orgId}`);
}

run();
