
const accessToken = "1000.9c2f180bdbcc60d82cd03c76bdb502a1.3b935f89d969a1867b1ab6f76c572a1e";
const ids = ["60064885204", "60058565264"];

async function run() {
    const variations = [];
    for (const id of ids) {
        for (const curKey of ["currency", "currency_code"]) {
            for (const curVal of ["INR", "inr"]) {
                for (const amt of [1, 1.0, "1", "1.00", 100]) {
                    variations.push({ id, curKey, curVal, amt });
                }
            }
        }
    }

    console.log(`Starting ${variations.length} variations on Payments API...`);
    for (const v of variations) {
        const payload = {
            amount: v.amt,
            [v.curKey]: v.curVal,
            organization_id: v.id,
            description: "HyperTest"
        };
        try {
            const res = await fetch("https://www.zohoapis.in/payments/v1/paymentlinks", {
                method: "POST",
                headers: { "Authorization": `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                console.log("!!! SUCCESS !!!", JSON.stringify(v), data);
                return;
            } else if (data.message !== "Invalid data provided." && data.message !== "Please ensure that the currency is valid.") {
                console.log("Interesting Result:", JSON.stringify(v), data.message);
            }
        } catch (e) { }
    }
    console.log("HyperTest Payments Done.");
}

run();
