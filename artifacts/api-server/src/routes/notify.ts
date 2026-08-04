import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";

const router: IRouter = Router();

const GMAIL_USER = process.env["GMAIL_USER"] || "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] || "";
const NOTIFY_TO_EMAIL = process.env["NOTIFY_TO_EMAIL"] || "";

function createTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

router.post("/notify", async (req, res) => {
  const { subject, message } = req.body as { subject?: string; message?: string };

  if (!subject || !message) {
    res.status(400).json({ error: "subject and message are required" });
    return;
  }

  const toEmail = NOTIFY_TO_EMAIL;
  if (!toEmail) {
    // Not configured — respond OK so the frontend doesn't surface an error
    res.json({ ok: true, skipped: true, reason: "NOTIFY_TO_EMAIL not configured" });
    return;
  }

  const transporter = createTransporter();
  if (!transporter) {
    res.json({ ok: true, skipped: true, reason: "Gmail credentials not configured" });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Avalon Resource Hub" <${GMAIL_USER}>`,
      to: toEmail,
      subject,
      text: message,
    });
    res.json({ ok: true });
  } catch (err) {
    // Log but don't expose internal error details
    console.error("Email send failed:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
