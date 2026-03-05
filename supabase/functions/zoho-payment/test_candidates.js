
const accessToken = "1000.5191a7a05527082df906f3461f962ab8.219a7fb22b6e39822948384d4c574cf95a";
const ids = ["60064885204", "60058565264"];

async function createLink(service, id) {
    const url = service === "payments"
        ? `https://payments.zoho.in/api/v1/paymentlinks?account_id=${id}`
        : `https://books.zoho.in/api/v3/paymentlinks?organization_id=${id}`;

    const payload = service === "payments"
        ? { amount: 100, currency: "INR", description: "Test" }
        : { amount: 100, currency_code: "INR", description: "Test" };

    console.log(`\n--- Testing ${service.toUpperCase()} ID: ${id} ---`);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
                "Content-Type": service === "books" ? "application/x-www-form-urlencoded" : "application/json"
            },
            body: service === "books"
                ? new URLSearchParams({ JSONString: JSON.stringify(payload) }).toString()
                : JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) { console.log(`Error: ${e.message}`); }
}

async function run() {
    for (const id of ids) {
        await createLink("payments", id);
        await createLink("books", id);
    }
}

run();
