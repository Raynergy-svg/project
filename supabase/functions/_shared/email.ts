import { Buffer } from "https://deno.land/std@0.168.0/io/buffer.ts";
import { BufReader, BufWriter } from "https://deno.land/std@0.168.0/io/buffer.ts";
import { delay } from "https://deno.land/std@0.168.0/async/delay.ts";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class SmtpConnection {
  private conn: Deno.Conn | null = null;
  private reader: BufReader | null = null;
  private writer: BufWriter | null = null;

  async connect(hostname: string, port: number) {
    console.log(`Connecting to ${hostname}:${port}...`);
    this.conn = await Deno.connect({ hostname, port });
    this.reader = new BufReader(this.conn);
    this.writer = new BufWriter(this.conn);
    await this.readResponse(); // Read greeting
  }

  async startTLS() {
    await this.sendCommand("STARTTLS");
    this.conn = await Deno.startTls(this.conn!, {
      hostname: Deno.env.get("SMTP_HOST")!,
    });
    this.reader = new BufReader(this.conn);
    this.writer = new BufWriter(this.conn);
  }

  private async sendCommand(command: string) {
    console.log(`> ${command}`);
    const encoder = new TextEncoder();
    await this.writer!.write(encoder.encode(command + "\r\n"));
    await this.writer!.flush();
    return await this.readResponse();
  }

  private async readResponse(): Promise<string> {
    const decoder = new TextDecoder();
    const buffer = new Uint8Array(1024);
    const n = await this.reader!.read(buffer);
    if (n === null) throw new Error("Connection closed");
    const response = decoder.decode(buffer.subarray(0, n));
    console.log(`< ${response.trim()}`);
    if (!response.startsWith("2") && !response.startsWith("3")) {
      throw new Error(`SMTP error: ${response}`);
    }
    return response;
  }

  async authenticate(username: string, password: string) {
    await this.sendCommand("EHLO smartdebtflow.com");
    await this.startTLS();
    await this.sendCommand("EHLO smartdebtflow.com");
    await this.sendCommand("AUTH LOGIN");
    await this.sendCommand(btoa(username));
    await this.sendCommand(btoa(password));
  }

  async sendMail(from: string, to: string, subject: string, content: string) {
    await this.sendCommand(`MAIL FROM:<${from}>`);
    await this.sendCommand(`RCPT TO:<${to}>`);
    await this.sendCommand("DATA");
    
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="utf-8"',
      "",
      content,
      ".",
    ].join("\r\n");

    await this.sendCommand(message);
  }

  async quit() {
    try {
      await this.sendCommand("QUIT");
    } finally {
      this.conn?.close();
    }
  }
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(`Missing SMTP configuration: ${JSON.stringify({
      hasHost: !!smtpHost,
      hasUser: !!smtpUser,
      hasPass: !!smtpPass
    })}`);
  }

  console.log('Starting email send attempt:', {
    to,
    subject,
    smtpHost,
    smtpPort: 587,
    smtpUser,
    hasSmtpPass: true,
    timestamp: new Date().toISOString()
  });

  const smtp = new SmtpConnection();
  
  try {
    await retryWithBackoff(async () => {
      await smtp.connect(smtpHost, 587);
      await smtp.authenticate(smtpUser, smtpPass);
      
      console.log('Sending email...');
      await smtp.sendMail(smtpUser, to, subject, html);
      console.log('Email sent successfully:', {
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Failed to send email:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: {
        smtpHost,
        smtpPort: 587,
        smtpUser,
        hasSmtpPass: true
      }
    });
    throw error;
  } finally {
    try {
      await smtp.quit();
      console.log('SMTP connection closed');
    } catch (closeError) {
      console.error('Error closing SMTP connection:', {
        error: closeError.message,
        timestamp: new Date().toISOString()
      });
    }
  }
} 