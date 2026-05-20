async function sendMessage(req, res) {
  try {
    const { name, email, message } = req.body;

    // Log the message server-side (extend this to send email via Resend/SendGrid etc.)
    console.log(`[Contact] From: ${name} <${email}>\n${message}`);

    // If you add an email provider, call it here.
    // Example with Resend:
    //   await resend.emails.send({ from: 'noreply@kairoshop.com', to: 'support@kairoshop.com', ... })

    res.json({ message: 'Message received. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { sendMessage };
