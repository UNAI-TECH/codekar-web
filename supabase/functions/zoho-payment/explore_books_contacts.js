
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const orgId = "60064885204";

async function run() {
    console.log("--- Listing Books Contacts ---");
    const url = `https://books.zoho.in/api/v3/contacts?organization_id=${orgId}`;
    try {
        const res = await fetch(url, {
            headers: { "Authorization": `Zoho-oauthtoken ${accessToken}` }
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) { console.log("Error:", e.message); }
}

run();
