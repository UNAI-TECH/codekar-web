
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";

async function explore(name, url) {
    console.log(`\n--- Exploring: ${name} ---`);
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Zoho-oauthtoken ${accessToken}` }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 1000)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    await explore("Payments Accounts (zohoapis.in)", "https://www.zohoapis.in/payments/v1/accounts");
    await explore("Books Orgs (zohoapis.in)", "https://www.zohoapis.in/books/v3/organizations");
    await explore("Payments Details (zohoapis.in)", "https://www.zohoapis.in/payments/v1/info");
}

run();
