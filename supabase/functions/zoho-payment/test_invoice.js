
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const id = "60064885204";

async function test(name, url, method = "GET", payload = null) {
    console.log(`\nTesting: ${name} (${url})`);
    try {
        const options = {
            method,
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        if (payload) {
            options.body = new URLSearchParams({ JSONString: JSON.stringify(payload) }).toString();
        }
        const res = await fetch(url, options);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    // 1. Zoho Invoice Organizations
    await test("Invoice Orgs", "https://invoice.zoho.in/api/v3/organizations");

    // 2. Zoho Invoice Payment Link
    await test("Invoice Create Link", `https://invoice.zoho.in/api/v3/paymentlinks?organization_id=${id}`, "POST", {
        amount: 100,
        currency_code: "INR",
        description: "Test"
    });

    // 3. Zoho Payments My Info
    await test("Payments My Info", "https://payments.zoho.in/api/v1/myinfo");
}

run();
