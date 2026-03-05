
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const accountId = "60064885204";

async function test(name, payload, headers) {
    console.log(`\nTesting: ${name}`);
    const url = `https://payments.zoho.in/api/v1/paymentlinks?account_id=${accountId}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${text}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    // Test 9: Repro step 363 payload (Exactly)
    // This gave 400 "Please ensure that the description is valid."
    await test("Repro Step 363",
        { amount: 1.00, currency: "INR" },
        { "apikey": apiKey });

    // Test 10: Add minimal description
    await test("Add minimal description",
        { amount: 1.00, currency: "INR", description: "Registration" },
        { "apikey": apiKey });

    // Test 11: Add reference_id
    await test("Add reference_id",
        { amount: 1.00, currency: "INR", description: "Registration", reference_id: "T" + Date.now() },
        { "apikey": apiKey });
}

run();
