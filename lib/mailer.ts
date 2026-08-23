import "server-only";

async function sendEmail(to: string[], subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM;
  if (!apiKey || !from) return { sent: false, reason: "Email provider not configured" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return response.ok ? { sent: true } : { sent: false, reason: `Email provider returned ${response.status}` };
}

export async function sendConfirmation(email: string, token: string, baseUrl: string) {
  const link = `${baseUrl.replace(/\/$/, "")}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return sendEmail(
    [email],
    "Confirm your subscription",
    `<p>Confirm your subscription to Saifullah Suleman's engineering notes.</p><p><a href="${link}">Confirm subscription</a></p>`,
  );
}

export async function notifySubscriber(email: string, token: string, title: string, slug: string, baseUrl: string) {
  const root = baseUrl.replace(/\/$/, "");
  const link = `${root}/blog/${slug}`;
  const unsubscribe = `${root}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
  return sendEmail(
    [email],
    `New engineering note: ${title}`,
    `<p>A new engineering note is live:</p><p><strong>${title}</strong></p><p><a href="${link}">Read the post</a></p><p style="color:#666">You received this because you subscribed to Saifullah Suleman's engineering notes. <a href="${unsubscribe}">Unsubscribe</a></p>`,
  );
}
