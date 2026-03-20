import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are all required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const recipientEmail = process.env.CONTACT_EMAIL || 'shubhamgohar@outlook.com';

    const { error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [recipientEmail],
      replyTo: email,
      subject: `Portfolio Contact: ${name}`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f0f0f5; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: white;">New Portfolio Message 📬</h1>
          </div>
          <div style="padding: 32px;">
            <div style="margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6b80; text-transform: uppercase; letter-spacing: 1px;">From</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${name}</p>
            </div>
            <div style="margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6b80; text-transform: uppercase; letter-spacing: 1px;">Email</p>
              <p style="margin: 0; font-size: 16px;"><a href="mailto:${email}" style="color: #7c3aed;">${email}</a></p>
            </div>
            <div style="margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6b80; text-transform: uppercase; letter-spacing: 1px;">Message</p>
              <div style="padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
            <p style="margin: 0; font-size: 12px; color: #6b6b80; text-align: center;">
              Sent from your portfolio at shubhamgohar.com
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
