
const apiKey = "1003.62fb0a871087635784042d0400d3e25a.09ccf657aa5c7cd6719e98b4028c220d";
const id = "60064885204";

async function run() {
    console.log(`\n--- Testing Static Key with ID: ${id} ---`);
    const payload = {
        amount: 1.0,
        currency_code: "INR",
        organization_id: id,
        email: "test@codekarx.com",
        description: "Static Key Test"
    };

    const res = await fetch("https://payments.zoho.in/api/v1/paymentlinks", {
        method: "POST",
        headers: {
            "apikey": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Resp:", text);
}

run();
