
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function run() {
    console.log("--- Listing Books Settings ---");

    const explore = async (name, url) => {
        console.log(`\nTesting: ${name}`);
        try {
            const res = await fetch(url, {
                headers: { "Authorization": `Zoho-oauthtoken ${accessToken}` }
            });
            const data = await res.json();
            console.log("Status:", res.status);
            console.log("Data:", JSON.stringify(data, null, 2));
        } catch (e) { console.log("Error:", e.message); }
    };

    await explore("Payment Gateways", `https://books.zoho.in/api/v3/settings/paymentgateways?organization_id=${orgId}`);
    await explore("Currencies", `https://books.zoho.in/api/v3/settings/currencies?organization_id=${orgId}`);
}

run();
