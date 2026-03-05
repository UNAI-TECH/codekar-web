
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const id1 = "60064885204";
const id2 = "60058565264";

async function test(name, payload) {
    console.log(`\nTesting: ${name}`);
    const res = await fetch("https://payments.zoho.in/api/v1/paymentlinks", {
        method: "POST",
        headers: {
            "Authorization": `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status, "Data:", JSON.stringify(data));
}

async function run() {
    await test("Amt string 1.00 + org_id 1", { amount: "1.00", currency: "INR", organization_id: id1, description: "T" });
    await test("Amt string 1.00 + acc_id 1", { amount: "1.00", currency: "INR", account_id: id1, description: "T" });
    await test("Amt string 1.00 + org_id 2", { amount: "1.00", currency: "INR", organization_id: id2, description: "T" });
    await test("Amt string 1.00 + acc_id 2", { amount: "1.00", currency: "INR", account_id: id2, description: "T" });
}

run();
