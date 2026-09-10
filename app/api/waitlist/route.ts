import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const disposableDomains = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'throwaway.email'
];

const schema = z.object({
  email: z.string()
    .email('Invalid email format')
    .refine(email => {
      const domain = email.split('@')[1];
      return !disposableDomains.includes(domain);
    }, 'Disposable email addresses not allowed'),
  turnstileToken: z.string().min(1, 'Bot verification required'),
  consentGiven: z.literal(true).refine(val => val === true, {
    message: 'You must accept the privacy policy'
  }),
  source: z.enum(['hero', 'footer', 'demo']).default('hero')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, turnstileToken, source } = parsed.data;

    // Layer 1: Verify Turnstile token
    // TODO: Enable when TURNSTILE_SECRET_KEY is configured
    // For now, skip verification in development
    if (process.env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV === 'production') {
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken
          })
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return Response.json(
          { error: 'Bot verification failed' },
          { status: 403 }
        );
      }
    }

    // Layer 2: Insert to waitlist
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email,
        source,
        consent_version: 'privacy-v1.0',
        consent_timestamp: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select('id, verification_token')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return Response.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Layer 3: Send verification email
    await sendVerificationEmail(email, data.verification_token);

    // Layer 4: Track analytics
    // TODO: Uncomment when analytics is set up
    // await track('waitlist_signup_initiated', { source });

    return Response.json({
      success: true,
      message: 'Check your inbox to verify your email'
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, token: string) {
  // TODO: Implement with Resend or SendGrid when configured
  // For now, just log the verification link for development
  // @ai-why: `NEXT_PUBLIC_SITE_URL`, dezelfde als robots.ts, sitemap.ts en de metadata
  // in app/layout.tsx. Dit stond tot 2026-09-10 op een eigen `NEXT_PUBLIC_URL` met
  // `http://localhost:3000` als terugval. Zolang deze functie alleen logt is dat
  // onschuldig, maar zodra hier een mailservice achter komt is die terugval de link die
  // klanten krijgen als de variabele op de server ontbreekt.
  // @ai-gotcha: Wil je lokaal een werkende verificatielink, zet `NEXT_PUBLIC_SITE_URL`
  // in `.env.local` dan op `http://localhost:3000`.
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki';
  const verificationUrl = `${site}/api/waitlist/verify?token=${token}`;

  console.log('\n========================================');
  console.log('📧 VERIFICATION EMAIL (Development Mode)');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Link: ${verificationUrl}`);
  console.log('========================================\n');

  // TODO: Replace with actual email service
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'Carve <noreply@carve.wiki>',
  //   to: email,
  //   subject: 'Verify your Carve waitlist signup',
  //   html: `Click here to verify: <a href="${verificationUrl}">${verificationUrl}</a>`
  // });
}
