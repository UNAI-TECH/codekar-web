
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";

async function run() {
    console.log("--- Exploring zohoapis.in with New Token ---");

    const explore = async (name, url) => {
        console.log(`\nTesting: ${name} (${url})`);
        try {
            const res = await fetch(url, {
                headers: { "Authorization": `Zoho-oauthtoken ${accessToken}` }
            });
            const data = await res.json();
            console.log("Status:", res.status);
            console.log("Data:", JSON.stringify(data, null, 2));
        } catch (e) { console.log("Error:", e.message); }
    };

    await explore("Payments Accounts (zohoapis.in)", "https://www.zohoapis.in/payments/v1/accounts");
    await explore("Books Orgs (zohoapis.in)", "https://www.zohoapis.in/books/v3/organizations");
}

run();
