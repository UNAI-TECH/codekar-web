
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";

async function run() {
    console.log("--- Exploring Zoho Accounts with New Token ---");

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

    // Try both .in and .com
    await explore("Payments Accounts (.in)", "https://payments.zoho.in/api/v1/accounts");
    await explore("Payments Accounts (.com)", "https://payments.zoho.com/api/v1/accounts");
    await explore("Books Orgs (.in)", "https://books.zoho.in/api/v3/organizations");
}

run();
