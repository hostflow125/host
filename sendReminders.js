const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendReminders() {
  const now = new Date();

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
    if (!client.next_due_date) continue;
    if (client.reminder_sent) continue;

    const dueDate = new Date(client.next_due_date);

    const diffDays =
      (dueDate - now) / (1000 * 60 * 60 * 24);

    // ONLY send if within 7-day window
    if (diffDays <= 7 && diffDays > 0) {
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

            <p>Your hosting for <b>${client.website}</b> is due soon.</p>

            <p><b>Amount:</b> ₦${client.amount}</p>

            <p>Please renew before the due date to avoid interruption.</p>
          `
        })
      });

      // mark as sent
      await fetch(
        `${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString()
          })
        }
      );

      console.log(`Sent to ${client.email}`);
    }
  }
}

sendReminders();
