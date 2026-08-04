import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NOTIFY_TO_EMAIL = process.env["NOTIFY_TO_EMAIL"] || "";

router.post("/notify", async (req, res) => {
  const { subject, message } = req.body as { subject?: string; message?: string };

  if (!subject || !message) {
    res.status(400).json({ error: "subject and message are required" });
    return;
  }

  if (!NOTIFY_TO_EMAIL) {
    // Not configured — respond OK so the frontend never surfaces an error
    res.json({ ok: true, skipped: true, reason: "NOTIFY_TO_EMAIL not configured" });
    return;
  }

  try {
    // Formsubmit.co — free, no account, no domain verification required.
    // The very first submission triggers a one-time "click to activate" email
    // to NOTIFY_TO_EMAIL; after that, every notification goes straight through.
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(NOTIFY_TO_EMAIL)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          _captcha: "false",
          // Send the body as a single "message" field so it renders cleanly
          message,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Formsubmit.co error:", response.status, text);
      res.status(502).json({ error: "Email service returned an error" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Notify fetch failed:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

export default router;
