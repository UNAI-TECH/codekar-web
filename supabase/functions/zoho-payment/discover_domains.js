
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const domains = ["in", "com", "eu", "au", "jp"];

async function run() {
    console.log("--- Exhaustive Domain Discovery ---");

    for (const d of domains) {
        const url = `https://payments.zoho.${d}/api/v1/accounts`;
        console.log(`\nTesting: .${d} (${url})`);
        try {
            const res = await fetch(url, {
                headers: { "Authorization": `Zoho-oauthtoken ${accessToken}` }
            });
            const text = await res.text();
            console.log("Status:", res.status);
            console.log("Response:", text.slice(0, 200));
        } catch (e) { console.log("Error:", e.message); }
    }
}

run();
