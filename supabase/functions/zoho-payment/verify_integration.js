
const supabaseUrl = "https://bfbdsoslilmnkrpjabgg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYmRzb3NsaWxtbmtycGphYmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NTc4NTAsImV4cCI6MjA1NjUzMzg1MH0.K7oOeRxCSCgjmj-l7hzZOnfWsCdIhJ4e3J0T8V5H8ZE";

async function verify() {
    console.log("--- Starting Zoho Integration Verification ---");
    const uniqueEmail = `test_${Date.now()}@example.com`;

    const payload = {
        action: "create-link",
        name: "Test User",
        email: uniqueEmail,
        phone: "9876543210",
        registration_type: "individual",
        college: "Test College",
        department: "CS",
        year: 4, // Integer as required by DB
        track: "Web",
        project_name: "Test Project"
    };

    try {
        const res = await fetch(`${supabaseUrl}/functions/v1/zoho-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.payment_url) {
            console.log("\n✅ SUCCESS! Payment Link Generated:", data.payment_url);
        } else {
            console.log("\n❌ FAILED: No payment URL returned.");
        }
    } catch (e) {
        console.log("\n❌ EXCEPTION:", e.message);
    }
}

verify();
