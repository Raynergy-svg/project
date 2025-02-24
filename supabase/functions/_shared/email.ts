interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!;
  const DEFAULT_FROM_EMAIL = 'notifications@smartdebtflow.com';

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
      }],
      from: { email: from || DEFAULT_FROM_EMAIL },
      subject,
      content: [{
        type: 'text/html',
        value: html,
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }

  return response;
} 