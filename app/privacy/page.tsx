import { LegalPage } from '@/components/carve/LegalPage';
import { CookieSettings } from '@/components/analytics/cookie-settings';

export const metadata = {
  title: 'Privacy Policy - Carve',
  description: 'How Carve collects, uses, and protects your personal information.',
};

// @ai-why: Herschreven op 2026-09-05 op de feiten van de app van vandaag. De vorige
// versie (januari 2025) beschreef een wachtlijst en een app "die nog moest
// lanceren", en noemde niet dat foto's en chatberichten naar AI-leveranciers
// gaan. Dat laatste is precies wat Apple en de AVG willen zien. Wat hier staat
// is nagelopen tegen de code, niet tegen een wens:
// - AI: OpenAI en Anthropic via Supabase edge functions (openai-proxy, coach-chat)
// - voeding: FatSecret via fatsecret-proxy en food-search
// - HealthKit: alleen HKQuantityType(.stepCount), nergens slaap of hartslag
// - abonnementen: RevenueCat, betaling via Apple
// Wijzigt een van die vier, dan wijzigt deze pagina mee.
// @ai-sync: ~/Developer/Carve-AI/supabase/functions (welke leveranciers data zien)
// @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Services/Health/StepsService.swift (het enige HealthKit-type)
// @ai-sync: app/terms/page.tsx (zelfde datum, zelfde contactadressen)
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 5, 2026"
      intro="Carve logs your food and your training. To do that it stores what you log, and for some features it sends part of it to a service provider. This page says exactly what, to whom, and why."
    >
      <section>
        <h2>1. Who we are</h2>
        <p>
          Carve AI (&ldquo;Carve&rdquo;, &ldquo;we&rdquo;) is based in Amsterdam, the Netherlands, and makes the Carve iOS app and the website carve.wiki (together, the &ldquo;Service&rdquo;). This policy explains what personal data we collect, how we use it, and the rights you have. By using the Service you agree to this policy.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <h3>2.1 What you give us</h3>
        <ul>
          <li><strong>Account:</strong> your name, email address and profile photo. If you sign in with Apple or Google, we receive the identifier and email they share with us.</li>
          <li><strong>Food:</strong> the meals you log, including photos of food you take in the app, barcodes you scan, and portions and macros you enter or correct.</li>
          <li><strong>Training:</strong> workouts, exercises, sets, weights and the muscle groups they cover.</li>
          <li><strong>Body and goals:</strong> weight, height, target weight, calorie and protein targets, your training split and training days.</li>
          <li><strong>Coach messages:</strong> what you type to the coach in the app.</li>
        </ul>
        <h3>2.2 What we read with your permission</h3>
        <ul>
          <li><strong>Apple Health:</strong> your daily step count, and only that. We do not read sleep, heart rate, workouts or any other Health data. You can revoke this in the Health app at any time.</li>
          <li><strong>Camera:</strong> used to photograph food and scan barcodes. Photos are only stored when you log the meal.</li>
        </ul>
        <h3>2.3 What we collect automatically</h3>
        <ul>
          <li><strong>Usage data:</strong> which screens and features you use, and errors that occur.</li>
          <li><strong>Device data:</strong> device model, iOS version, app version and language.</li>
          <li><strong>Website analytics and advertising:</strong> which pages you visit on carve.wiki and which ad or link brought you here, via Google Analytics. This runs only after you accept cookies. Decline and we measure nothing.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use it</h2>
        <ul>
          <li><strong>To run the Service:</strong> store your log, show your muscle map and your week, and sync between your devices.</li>
          <li><strong>AI features:</strong> to recognise the food in a photo and to answer your coach questions, we send the photo or your message, together with the relevant parts of your log, to an AI provider (see section 4). The answer comes back to you; the provider does not use it to train its models under the API terms we use.</li>
          <li><strong>To improve the Service:</strong> understand which features are used and where the app fails.</li>
          <li><strong>To keep it safe:</strong> detect and prevent abuse and security incidents.</li>
          <li><strong>To reach you:</strong> account, security and support messages. No marketing email unless you ask for it.</li>
          <li><strong>To comply with the law</strong> and enforce our Terms of Service.</li>
        </ul>
      </section>

      <section>
        <h2>4. Who sees your data</h2>
        <p>We do not sell your personal data. We share it only with the providers we need to run the Service, and only what they need:</p>
        <ul>
          <li><strong>Supabase</strong> (database, authentication, file storage): everything you log. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>OpenAI</strong> and <strong>Anthropic</strong> (AI): food photos, coach messages and the parts of your log needed to answer. <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">OpenAI</a> · <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic</a></li>
          <li><strong>FatSecret</strong> (food database): the barcode or search term you look up. Not your identity. <a href="https://www.fatsecret.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>RevenueCat</strong> (subscriptions): an anonymous app user id and your purchase status. <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>Apple</strong> (App Store, Sign in with Apple, payments, push notifications, Apple Health). <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>Vercel</strong> (website hosting) and <strong>Cloudflare</strong> (bot protection on the website). <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel</a> · <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare</a></li>
          <li><strong>Google</strong> (Analytics and Ads, website only): which pages you visit and which ad brought you here, once you have accepted cookies. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
        </ul>
        <p>
          We may also disclose data if the law requires it, or as part of a merger or sale of the business, in which case we will tell you first.
        </p>
      </section>

      <section>
        <h2>5. Your rights</h2>
        <p>Under the GDPR you can:</p>
        <ul>
          <li><strong>Access</strong> a copy of your data</li>
          <li><strong>Correct</strong> data that is wrong or incomplete</li>
          <li><strong>Delete</strong> your account and all data in it, from Settings in the app or by emailing us</li>
          <li><strong>Export</strong> your data in a machine-readable format</li>
          <li><strong>Object</strong> to certain processing, and <strong>withdraw consent</strong> (for example Apple Health access) at any time</li>
          <li><strong>Complain</strong> to the Dutch data protection authority, the Autoriteit Persoonsgegevens</li>
        </ul>
        <p>
          To exercise a right, email <a href="mailto:privacy@carve.wiki">privacy@carve.wiki</a>. We respond within 30 days.
        </p>
      </section>

      <section>
        <h2>6. How long we keep it</h2>
        <ul>
          <li><strong>Account and log data:</strong> until you delete your account, plus up to 30 days in backups.</li>
          <li><strong>Food photos:</strong> as part of your log, until you delete the meal or your account.</li>
          <li><strong>AI requests:</strong> we do not keep a separate copy of what was sent; the provider&apos;s own retention applies (typically 30 days for abuse monitoring).</li>
          <li><strong>Website analytics:</strong> kept by Google Analytics for up to 14 months, and only if you accepted cookies.</li>
        </ul>
      </section>

      <section>
        <h2>7. Security</h2>
        <ul>
          <li>Encrypted in transit (HTTPS/TLS) and at rest in our database</li>
          <li>Row-level security so that one account can never read another&apos;s data</li>
          <li>Sign in with Apple and Google, or email with verification</li>
          <li>Bot protection via Cloudflare Turnstile on the website</li>
        </ul>
        <p>No system is perfectly secure. If we learn of a breach that affects you, we will tell you.</p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          Signing in and keeping the site secure needs a few cookies. Those are always on, because the site does not work without them.
        </p>
        <p>
          Google Analytics and Google Ads set cookies to measure which pages you visit and which ad brought you here. Those stay off until you accept them, and you can change your mind here at any time.
        </p>
        {/* @ai-why: De knop hoort in de verklaring zelf en niet alleen in de banner.
            De banner verdwijnt na één keuze en komt nooit meer terug, dus dit is de
            enige plek waar toestemming nog in te trekken is. De AVG eist dat dat net
            zo makkelijk gaat als het geven ervan.
            @ai-sync: components/analytics/cookie-settings.tsx */}
        <CookieSettings />
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          The Service is not for people under 16. We do not knowingly collect data from children under 16. If you believe a child has given us data, email <a href="mailto:privacy@carve.wiki">privacy@carve.wiki</a> and we will delete it.
        </p>
      </section>

      <section>
        <h2>10. International transfers</h2>
        <p>
          Some providers above process data outside the EU, notably in the United States. Where that happens we rely on the EU-US Data Privacy Framework or Standard Contractual Clauses.
        </p>
      </section>

      <section>
        <h2>11. Changes</h2>
        <p>
          When this policy changes, the date at the top changes with it. For material changes we notify you in the app or by email. Continuing to use the Service after that means you accept the new version.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <ul>
          <li><strong>Privacy questions:</strong> <a href="mailto:privacy@carve.wiki">privacy@carve.wiki</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@carve.wiki">support@carve.wiki</a></li>
        </ul>
      </section>
    </LegalPage>
  );
}
