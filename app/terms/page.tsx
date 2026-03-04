export const metadata = {
  title: 'Terms of Service - Carve',
  description: 'Terms and conditions for using the Carve fitness tracking app.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
        <h1 className="text-4xl font-bold text-ink mb-4">Terms of Service</h1>
        <p className="text-sm text-ink-secondary mb-8">Last updated: January 11, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">1. Acceptance of Terms</h2>
            <p className="text-ink leading-relaxed mb-4">
              Welcome to Carve! These Terms of Service ("Terms") govern your access to and use of the Carve fitness tracking application, website, and related services (collectively, the "Service").
            </p>
            <p className="text-ink leading-relaxed">
              By accessing or using the Service, you agree to be bound by these Terms and our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>. If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">2. Eligibility</h2>
            <p className="text-ink mb-4">
              You must be at least 16 years old to use the Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>You are at least 16 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information you provide is accurate and truthful</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">3. Account Registration</h2>
            <p className="text-ink mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-ink mt-4">
              You may not create an account using a false identity, impersonate another person, or use an account that you are not authorized to use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">4. Acceptable Use</h2>
            <p className="text-ink mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Upload harmful, offensive, or inappropriate content</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Spam, phish, or engage in fraudulent activity</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use bots, scrapers, or automated tools without permission</li>
              <li>Circumvent security features or access restrictions</li>
              <li>Interfere with the Service's operation or other users' experience</li>
              <li>Collect or harvest user data without consent</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">5. User Content</h2>
            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">5.1 Your Content</h3>
            <p className="text-ink mb-4">
              You retain ownership of all content you submit to the Service ("User Content"), including workout data, photos, comments, and profile information.
            </p>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">5.2 License to Carve</h3>
            <p className="text-ink mb-4">
              By submitting User Content, you grant Carve a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely for the purpose of operating and improving the Service.
            </p>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">5.3 Public Content</h3>
            <p className="text-ink mb-4">
              If you choose to make your profile or content public (e.g., leaderboards, public workouts), you understand that:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Other users can view and interact with this content</li>
              <li>You can change privacy settings at any time</li>
              <li>Cached or shared content may persist even after deletion</li>
            </ul>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">5.4 Content Standards</h3>
            <p className="text-ink mb-4">
              All User Content must comply with our Community Guidelines. We reserve the right to remove content that violates these Terms or is otherwise objectionable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">6. Intellectual Property</h2>
            <p className="text-ink mb-4">
              The Service and its original content, features, and functionality are owned by Carve and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-ink">
              You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">7. Health and Fitness Disclaimer</h2>
            <p className="text-ink mb-4">
              <strong>IMPORTANT:</strong> The Service is for informational and tracking purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Always consult a physician before starting any exercise program</li>
              <li>Stop exercising and seek medical attention if you experience pain, dizziness, or discomfort</li>
              <li>The Service does not provide medical advice or diagnose conditions</li>
              <li>User-generated content may not be accurate or reliable</li>
              <li>We are not responsible for injuries or health issues resulting from using the Service</li>
            </ul>
            <p className="text-ink mt-4">
              <strong>You use the Service at your own risk.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">8. Subscription and Payments</h2>
            <p className="text-ink mb-4">
              Certain features may require a paid subscription (details to be announced at launch). By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Pay all fees associated with your subscription</li>
              <li>Automatic renewal unless you cancel before the renewal date</li>
              <li>No refunds for partial periods (except as required by law)</li>
              <li>Price changes with 30 days' notice</li>
            </ul>
            <p className="text-ink mt-4">
              You can cancel your subscription at any time from your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">9. Termination</h2>
            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">9.1 By You</h3>
            <p className="text-ink mb-4">
              You may delete your account at any time from your account settings. Upon deletion:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Your personal data will be deleted within 30 days</li>
              <li>Public content (e.g., leaderboard history) may be anonymized</li>
              <li>You can request a data export before deleting</li>
            </ul>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">9.2 By Carve</h3>
            <p className="text-ink mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Violate these Terms or our Community Guidelines</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Create security or legal risks for the Service</li>
              <li>Fail to pay subscription fees</li>
            </ul>
            <p className="text-ink mt-4">
              We will provide notice when possible, but may terminate immediately for severe violations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">10. Disclaimers</h2>
            <p className="text-ink mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Merchantability or fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security or freedom from viruses/malware</li>
            </ul>
            <p className="text-ink mt-4">
              We do not guarantee that the Service will meet your requirements or be available at all times.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">11. Limitation of Liability</h2>
            <p className="text-ink mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CARVE SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or goodwill</li>
              <li>Injuries or health issues resulting from using the Service</li>
              <li>Actions of other users or third parties</li>
              <li>Interruptions, errors, or data loss</li>
            </ul>
            <p className="text-ink mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months before the claim, or €100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">12. Indemnification</h2>
            <p className="text-ink">
              You agree to indemnify and hold Carve harmless from any claims, damages, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2 mt-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your User Content</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">13. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">13.1 Informal Resolution</h3>
            <p className="text-ink mb-4">
              Before filing a claim, please contact us at <a href="mailto:support@carve.wiki" className="text-blue-600 underline">support@carve.wiki</a> to attempt informal resolution.
            </p>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">13.2 Governing Law</h3>
            <p className="text-ink mb-4">
              These Terms are governed by the laws of the Netherlands, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-ink mb-3 mt-6">13.3 Arbitration</h3>
            <p className="text-ink">
              Any disputes shall be resolved through binding arbitration in accordance with Dutch arbitration rules, except where prohibited by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">14. Changes to Terms</h2>
            <p className="text-ink mb-4">
              We may modify these Terms at any time. Material changes will be communicated via:
            </p>
            <ul className="list-disc pl-6 text-ink space-y-2">
              <li>Email notification to your registered email address</li>
              <li>In-app notification</li>
              <li>Prominent notice on the website</li>
            </ul>
            <p className="text-ink mt-4">
              Your continued use of the Service after changes indicates acceptance. If you do not agree, you must stop using the Service and delete your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">15. Severability</h2>
            <p className="text-ink">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">16. Entire Agreement</h2>
            <p className="text-ink">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Carve regarding the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink mb-4">17. Contact Us</h2>
            <p className="text-ink mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="list-none text-ink space-y-2">
              <li><strong>Email:</strong> <a href="mailto:legal@carve.wiki" className="text-blue-600 underline">legal@carve.wiki</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@carve.wiki" className="text-blue-600 underline">support@carve.wiki</a></li>
            </ul>
          </section>

          <div className="bg-surface border border-subtle rounded-lg p-6 mt-8">
            <p className="text-sm text-ink leading-relaxed">
              <strong>Summary (Not Legally Binding):</strong> By using Carve, you agree to be respectful, follow the rules, and take responsibility for your content. We'll do our best to provide a great service, but we can't guarantee it'll be perfect or always available. Your health and safety are your responsibility—always consult a doctor before starting new exercise routines. You can delete your account anytime. We may update these Terms, and we'll let you know when we do.
            </p>
          </div>
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
