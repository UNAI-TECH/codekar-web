
const clientId = "1000.VHBBIKU7S4QRKUDJ259VAVFH3GWZGD";
const clientSecret = "beb66c135660c8d4905550bcfa5565a18b7d3f2025";
const code = "1000.aca47482c4bf51853cab8da1426e2bf7.f80281e7ae2e641bcb5d786dc6fee258";

async function exchange(domain) {
    console.log(`\nExchanging on zoho.${domain} with Redirect URI...`);
    const url = `https://accounts.zoho.${domain}/oauth/v2/token`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "authorization_code",
                redirect_uri: "https://www.codekarx.com"
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function run() {
    await exchange("in");
    await exchange("com");
}

run();
