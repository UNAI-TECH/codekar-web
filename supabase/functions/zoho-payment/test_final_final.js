
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id = "60064885204";

async function run() {
    const tests = [
        { name: "Payments + account_id + currency", url: "https://www.zohoapis.in/payments/v1/paymentlinks", p: { amount: 100, currency: "INR", account_id: id, description: "T" } },
        { name: "Payments + organization_id + currency", url: "https://www.zohoapis.in/payments/v1/paymentlinks", p: { amount: 100, currency: "INR", organization_id: id, description: "T" } },
        { name: "Books + JSONString + amt 100", url: "https://www.zohoapis.in/books/v3/paymentlinks?organization_id=" + id, p: { amount: 100, currency_code: "INR", description: "T" }, form: true },
        { name: "Books + JSONString + amt 1.00", url: "https://www.zohoapis.in/books/v3/paymentlinks?organization_id=" + id, p: { amount: 1.00, currency_code: "INR", description: "T" }, form: true },
        { name: "Payments + JSONString", url: "https://www.zohoapis.in/payments/v1/paymentlinks", p: { amount: 100, currency: "INR", account_id: id, description: "T" }, form: true }
    ];

    for (const t of tests) {
        console.log(`\nTesting: ${t.name}`);
        try {
            let body, headers = { "Authorization": `Zoho-oauthtoken ${accessToken}` };
            if (t.form) {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                body = "JSONString=" + encodeURIComponent(JSON.stringify(t.p));
            } else {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(t.p);
            }
            const res = await fetch(t.url, { method: "POST", headers, body });
            const text = await res.text();
            console.log("Status:", res.status, "Resp:", text.slice(0, 300));
        } catch (e) { }
    }
}

run();
