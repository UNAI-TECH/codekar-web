
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";

async function explore(name, url) {
    console.log(`\n--- Exploring: ${name} ---`);
    console.log(`URL: ${url}`);
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 1000)}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    // 1. Check Books Organizations
    await explore("Zoho Books Orgs (.in)", "https://books.zoho.in/api/v3/organizations");

    // 2. Check Payments Accounts (.in)
    await explore("Zoho Payments Accounts (.in)", "https://payments.zoho.in/api/v1/accounts");

    // 3. Check Payments Accounts (.com)
    await explore("Zoho Payments Accounts (.com)", "https://payments.zoho.com/api/v1/accounts");

    // 4. Check Zoho APIs Domain Info
    await explore("Zoho APIs Info", "https://www.zohoapis.in/api/v1/info");
}

run();
