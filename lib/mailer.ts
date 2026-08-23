import "server-only";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function safeBaseUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported URL scheme");
    return url.toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

async function sendEmail(to: string[], subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM;
  if (!apiKey || !from) return { sent: false, reason: "Email provider not configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return response.ok ? { sent: true } : { sent: false, reason: "Email provider rejected the request" };
  } catch {
    return { sent: false, reason: "Email provider unavailable" };
  }
}

export async function sendConfirmation(email: string, token: string, baseUrl: string) {
  const link = `${safeBaseUrl(baseUrl)}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return sendEmail(
    [email],
    "Confirm your subscription",
    `<p>Confirm your subscription to Saifullah Suleman's engineering notes.</p><p><a href="${link}">Confirm subscription</a></p>`,
  );
}

export async function notifySubscriber(email: string, token: string, title: string, slug: string, baseUrl: string) {
  const root = safeBaseUrl(baseUrl);
  const link = `${root}/blog/${encodeURIComponent(slug)}`;
  const unsubscribe = `${root}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
  const safeTitle = escapeHtml(title);
  const subjectTitle = title.replace(/[\r\n]+/g, " ").slice(0, 180);
  return sendEmail(
    [email],
    `New engineering note: ${subjectTitle}`,
    `<p>A new engineering note is live:</p><p><strong>${safeTitle}</strong></p><p><a href="${link}">Read the post</a></p><p style="color:#666">You received this because you subscribed to Saifullah Suleman's engineering notes. <a href="${unsubscribe}">Unsubscribe</a></p>`,
  );
}
