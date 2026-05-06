const SUPABASE_URL = "https://wkgzrlkamugqzmuadomf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_ylUwXg7SB-EQg1E1Qyriug_YWKo41KJ";

const form = document.getElementById("registrationForm");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const clientData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    website: document.getElementById("website").value,
    plan: document.getElementById("plan").value,
    amount: document.getElementById("amount").value,
    notes: document.getElementById("notes").value,

    registration_date: new Date().toISOString(),

    next_due_date: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()
  };

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/clients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify(clientData)
      }
    );

    if (response.ok) {
      alert("Client registered successfully!");
      form.reset();
    } else {
      const errorText = await response.text();
      console.error(errorText);
      alert("Error saving client data.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error.");
  }
});
