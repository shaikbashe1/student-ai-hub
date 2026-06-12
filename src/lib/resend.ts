/**
 * Lazy-initialized Resend Email Client
 * Safely falls back to terminal log output if no RESEND_API_KEY is found.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "Student AI Hub <newsletter@studentaihub.dev>"
}: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  console.info(`[Email Dispatch Engine] Preparing mail out:`);
  console.info(`- From: ${from}`);
  console.info(`- To: ${to}`);
  console.info(`- Subject: ${subject}`);
  console.info(`- Body preview size: ${html.length} chars`);

  if (!apiKey) {
    console.warn(`[Email Warning]: RESEND_API_KEY environment variable is absent. Simulating successful dispatch.`);
    return {
      success: true,
      simulated: true,
      id: `sim_${Math.random().toString(36).substring(3, 11)}`,
      html
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      simulated: false,
      id: data.id
    };
  } catch (error) {
    console.error("[Email Dispatch Failure]:", error);
    throw error;
  }
}
