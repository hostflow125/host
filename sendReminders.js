const SUPABASE_URL = "https://wkgzrlkamugqzmuadomf.supabase.co";

const SUPABASE_KEY = "sb_publishable_ylUwXg7SB-EQg1E1Qyriug_YWKo41KJ";

const RESEND_API_KEY = "re_YMw5NFvc_BzLYtJAwr7Nbn1YJm1ATvpA8";

async function sendReminders() {
  const today = new Date();

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const targetDate = sevenDaysLater.toISOString();

  // get clients due in ~7 days
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clients?select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const clients = await res.json();

  for (const client of clients) {
    const dueDate = new Date(client.next_due_date);

    const diffDays =
      (dueDate - today) / (1000 * 60 * 60 * 24);

    // only send if within 7 days window
    if (diffDays <= 7 && diffDays > 6) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "HostFlow <onboarding@resend.dev>",
          to: client.email,
          subject: "Hosting Renewal Reminder (7 Days Left)",

          html: `
            <h2>Hello ${client.name}</h2>

            <p>Your hosting for <b>${client.website}</b> is due in 7 days.</p>

            <p><b>Amount:</b> ₦${client.amount}</p>

            <p>Please ensure payment is made to avoid interruption.</p>

            <p>Thank you for trusting us.</p>
          `
        })
      });

      console.log(`Reminder sent to ${client.email}`);
    }
  }
}

sendReminders();
