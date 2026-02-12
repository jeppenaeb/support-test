import nodemailer from "nodemailer";

function required(name, v) {
  if (!v || !String(v).trim()) throw new Error(`Missing field: ${name}`);
  return String(v).trim();
}

export default async function handler(req, res) {
  // CORS (så GitHub Pages kan kalde API'en)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const email = required("email", req.body?.email);
    const area = required("area", req.body?.area);
    const topic = required("topic", req.body?.topic);
    const body = required("body", req.body?.body);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // typisk false for 587
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });

    const to = "support.e-grant@ufm.dk";
    const subject = `[${area}] ${topic}`;

    const text =
`Fra: ${email}
Område: ${area}
Topic: ${topic}

${body}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@ufm.dk",
      to,
      replyTo: email,     // så support kan svare brugeren direkte
      subject,
      text
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Unknown error" });
  }
}
