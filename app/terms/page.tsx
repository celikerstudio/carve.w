import { LegalPage } from '@/components/carve/LegalPage';

export const metadata = {
  title: 'Terms of Service - Carve',
  description: 'Terms and conditions for using the Carve app.',
};

// @ai-why: Herschreven op 2026-09-05 met dezelfde feiten als de privacyverklaring.
// De vorige versie (januari 2025) sprak van een abonnement "dat bij lancering
// bekend wordt gemaakt", van Community Guidelines die niet bestaan, en van
// leaderboards en publieke profielen die de app niet meer aanbiedt. Wat hier
// staat over betalen klopt met de code: Pro loopt via Apple (RevenueCat), de
// gratis proefperiode is 30 dagen (database-trigger), opzeggen gaat via je
// Apple ID en niet via de app.
// @ai-sync: ~/Developer/Carve-AI/supabase/migrations/20260903170000_restore_signup_trial_trigger.sql (de 30 dagen)
// @ai-sync: app/privacy/page.tsx (zelfde datum, zelfde contactadressen)
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 5, 2026"
      intro="These are the rules for using Carve. They are short on purpose. The bit that matters most is section 6: Carve tracks, it does not treat."
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms govern your use of the Carve iOS app and the website carve.wiki (together, the &ldquo;Service&rdquo;), made by Carve AI in Amsterdam, the Netherlands. By using the Service you agree to these Terms and to our <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Who can use it</h2>
        <p>You must be at least 16 years old. By using the Service you confirm that you are, that you can enter into this agreement, and that what you tell us about yourself is true.</p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <ul>
          <li>Keep your sign-in details to yourself and tell us if someone else gets in.</li>
          <li>You are responsible for what happens under your account.</li>
          <li>Do not create an account under a false identity or use someone else&apos;s account.</li>
          <li>You can delete your account at any time from Settings in the app. Your data is deleted within 30 days.</li>
        </ul>
      </section>

      <section>
        <h2>4. What you may not do</h2>
        <ul>
          <li>Break the law or someone else&apos;s rights while using the Service</li>
          <li>Upload content that is harmful, offensive or not yours to upload</li>
          <li>Reverse engineer, scrape or attack the Service, or get around its security</li>
          <li>Interfere with the Service or with other people&apos;s use of it</li>
          <li>Use the Service for anything it was not meant for</li>
        </ul>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          What you log stays yours: meals, photos, workouts, measurements, messages. You give Carve a licence to store, process and display it so that the Service works, including sending parts of it to the AI providers named in the Privacy Policy. That licence ends when you delete the content or your account, except for backups that are cleared within 30 days.
        </p>
        <p>We may remove content that breaks these Terms.</p>
      </section>

      <section>
        <h2>6. Health disclaimer</h2>
        <p>
          <strong>Carve is a tracking tool, not medical advice.</strong> The calorie and macro estimates come from a photo or a database and can be wrong. The coach answers from what you logged and is not a doctor, dietitian or trainer.
        </p>
        <ul>
          <li>Talk to a physician before you start or change a diet or training programme, especially if you have a medical condition</li>
          <li>Stop and seek medical help if you feel pain, dizziness or discomfort</li>
          <li>Do not rely on the estimates for medical decisions, for example insulin dosing or allergies</li>
        </ul>
        <p><strong>You use the Service at your own risk.</strong></p>
      </section>

      <section>
        <h2>7. Pro subscription</h2>
        <ul>
          <li>Carve is free to download. Some features are part of <strong>Carve Pro</strong>, a subscription sold through the Apple App Store.</li>
          <li>New accounts get 30 days of Pro for free. After that, Pro only continues if you subscribe.</li>
          <li>Payment, renewal, cancellation and refunds are handled by Apple under the App Store terms. You cancel in your Apple ID settings, at least 24 hours before the renewal date.</li>
          <li>Prices are shown in the app before you buy. If a price changes, Apple notifies you and asks you to agree before the next renewal.</li>
        </ul>
      </section>

      <section>
        <h2>8. Ending the agreement</h2>
        <p>You can stop at any time by deleting your account. We may suspend or close your account if you break these Terms, use the Service for something illegal, or create a security or legal risk. We give notice where we can, but may act immediately for serious cases.</p>
      </section>

      <section>
        <h2>9. Intellectual property</h2>
        <p>The Service, its design, its illustrations and its code belong to Carve AI. You may not copy, sell or redistribute any part of it without our written permission.</p>
      </section>

      <section>
        <h2>10. No warranty</h2>
        <p>
          The Service is provided as is. We do not promise that it is free of errors, always available, or right for your purpose, and we do not promise that food estimates are accurate.
        </p>
      </section>

      <section>
        <h2>11. Limitation of liability</h2>
        <p>
          To the extent the law allows, Carve AI is not liable for indirect or consequential damages, for loss of data, or for injury or health problems that result from using the Service. Our total liability is limited to what you paid us in the 12 months before the claim, or &euro;100, whichever is more. Nothing here limits liability that cannot be limited under Dutch law.
        </p>
      </section>

      <section>
        <h2>12. Disputes and law</h2>
        <p>
          These Terms are governed by Dutch law. If something goes wrong, email <a href="mailto:support@carve.wiki">support@carve.wiki</a> first and we will try to sort it out. If we cannot, the courts of Amsterdam have jurisdiction, unless the law gives you the right to go to a court closer to home.
        </p>
      </section>

      <section>
        <h2>13. Changes</h2>
        <p>
          When these Terms change, the date at the top changes with it. For material changes we notify you in the app or by email at least 14 days before they take effect. If you keep using the Service after that, the new Terms apply.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <ul>
          <li><strong>Support:</strong> <a href="mailto:support@carve.wiki">support@carve.wiki</a></li>
          <li><strong>Privacy:</strong> <a href="mailto:privacy@carve.wiki">privacy@carve.wiki</a></li>
        </ul>
      </section>
    </LegalPage>
  );
}
