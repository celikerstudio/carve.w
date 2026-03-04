export const metadata = {
  title: 'Privacy Policy - Carve',
  description: 'How Carve collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-bold text-ink mb-4">Privacy Policy</h1>
        <p className="text-sm text-ink-secondary mb-8">Last updated: January 11, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">1. Introduction</h2>
            <p className="text-ink leading-relaxed mb-4">
              Carve ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fitness tracking application and website (collectively, the "Service").
            </p>
            <p className="text-ink leading-relaxed">
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-ink space-y-2 mb-4">
              <li><strong>Waitlist Registration:</strong> Email address, consent timestamp, and IP address for verification purposes</li>
              <li><strong>Account Information:</strong> Name, email, profile photo (when app launches)</li>
              <li><strong>Fitness Data:</strong> Workouts, exercises, personal records, body measurements, photos (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-ink space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, interactions</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
              <li><strong>Analytics:</strong> Aggregated, anonymized usage statistics via Plausible Analytics (privacy-first, no cookies)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">3. How We Use Your Information</h2>
            <p className="text-ink mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>Provide the Service:</strong> Enable core features like workout tracking, progress visualization, and social features</li>
              <li><strong>Waitlist Management:</strong> Send launch notifications and early access invitations</li>
              <li><strong>Improve the Service:</strong> Analyze usage patterns to enhance features and user experience</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Communication:</strong> Send important updates, security alerts, and support messages</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-ink mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>With Your Consent:</strong> When you explicitly opt-in to public profiles or social features</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Service (Supabase for database, Vercel for hosting, Plausible for analytics)</li>
              <li><strong>Legal Requirements:</strong> If required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you will be notified)</li>
              <li><strong>Public Features:</strong> Data you choose to make public (leaderboards, public profiles) is visible to other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">5. Your Privacy Rights (GDPR & CCPA)</h2>
            <p className="text-ink mb-4">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure ("Right to be Forgotten"):</strong> Request deletion of your data</li>
              <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Withdraw Consent:</strong> Opt-out of waitlist or delete your account anytime</li>
              <li><strong>Object to Processing:</strong> Object to certain types of data processing</li>
            </ul>
            <p className="text-ink mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@carve.wiki" className="text-blue-600 underline">privacy@carve.wiki</a>. We will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">6. Data Retention</h2>
            <p className="text-ink mb-4">We retain your data for the following periods:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>Waitlist Data:</strong> Until you verify your email or request deletion (whichever comes first)</li>
              <li><strong>Account Data:</strong> Until you delete your account + 30 days for backup retention</li>
              <li><strong>Workout Data:</strong> Until account deletion (you can export your data before deleting)</li>
              <li><strong>Analytics:</strong> Aggregated, anonymized data retained for up to 2 years</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">7. Security</h2>
            <p className="text-ink mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>End-to-end encryption for data in transit (HTTPS/TLS)</li>
              <li>Encrypted database storage via Supabase</li>
              <li>Row-level security (RLS) policies to prevent unauthorized access</li>
              <li>Regular security audits and updates</li>
              <li>Bot protection via Cloudflare Turnstile</li>
            </ul>
            <p className="text-ink mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">8. Cookies and Tracking</h2>
            <p className="text-ink mb-4">
              We use minimal tracking technologies:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and security (cannot be disabled)</li>
              <li><strong>Analytics:</strong> Plausible Analytics (privacy-first, no cookies, no cross-site tracking)</li>
              <li><strong>No Third-Party Advertising:</strong> We do not use advertising cookies or share data with ad networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">9. Children's Privacy</h2>
            <p className="text-ink">
              The Service is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal data, please contact us at <a href="mailto:privacy@carve.wiki" className="text-blue-600 underline">privacy@carve.wiki</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">10. International Data Transfers</h2>
            <p className="text-ink">
              Your data may be transferred to and processed in countries other than your country of residence. We ensure adequate safeguards are in place (such as Standard Contractual Clauses) to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-ink">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Material changes will be communicated via email or in-app notification. Your continued use of the Service after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">12. Contact Us</h2>
            <p className="text-ink mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none text-ink space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@carve.wiki" className="text-blue-600 underline">privacy@carve.wiki</a></li>
              <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@carve.wiki" className="text-blue-600 underline">dpo@carve.wiki</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">13. Third-Party Services</h2>
            <p className="text-ink mb-4">Our Service uses the following third-party providers:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li><strong>Supabase:</strong> Database and authentication (<a href="https://supabase.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Vercel:</strong> Hosting and deployment (<a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Plausible Analytics:</strong> Privacy-first analytics (<a href="https://plausible.io/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Cloudflare:</strong> Bot protection and CDN (<a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-subtle">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
