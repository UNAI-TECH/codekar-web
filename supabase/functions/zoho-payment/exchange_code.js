
const clientId = "1000.Q4P9HYHNN2JCK2J9JKOUGTS6SOBHPF";
const clientSecret = "367846fbe02c74a14ff0ba556c96ebba6a03b2ec00";
const code = "1000.aca47482c4bf51853cab8da1426e2bf7.f80281e7ae2e641bcb5d786dc6fee258";

async function exchange(domain) {
    console.log(`\nExchanging on zoho.${domain}...`);
    const url = `https://accounts.zoho.${domain}/oauth/v2/token`;
    const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code"
    });

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
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
