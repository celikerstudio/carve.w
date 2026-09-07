import { LegalPage } from '@/components/carve/LegalPage';
import { SupportForm } from '@/components/carve/SupportForm';

// @ai-why: Herbouwd op 2026-09-05. De vorige versie was een Nederlandstalig
// "Support Center" in de app-chrome met een FAQ over XP, levels, slaapdata en een
// Android-versie die er niet komt. De antwoorden hier zijn nagelopen tegen de
// App Store-listing en de code: alleen wat de app vandaag doet. Engels, omdat
// de rest van de site en de store-listing Engels zijn.
// @ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (wat de app doet en niet doet)
// @ai-sync: app/terms/page.tsx (Pro, 30 dagen, opzeggen via Apple)
// @ai-sync: app/privacy/page.tsx (Apple Health: alleen stappen)
const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'How do I log a meal?',
    a: 'Open the camera in the app and take a photo of your plate. Carve works out the calories and macros. You can also scan a barcode, or type the meal to the coach ("two eggs and toast"). Adjust the portion or the macros afterwards if the estimate is off.',
  },
  {
    q: 'How accurate is the photo estimate?',
    a: 'It is an estimate. It is close for common foods and plates you can see clearly, and further off for mixed dishes, sauces and hidden oil. Use the portion buttons or "Adjust macros" to correct it. Packaged food is more precise via the barcode.',
  },
  {
    q: 'What does the muscle map show?',
    a: 'Every logged workout fills in the muscle groups it trained, front and back. A group that stays empty is one you have not trained recently.',
  },
  {
    q: 'What does the coach know about me?',
    a: 'Only what you logged: your meals, workouts, weight, goal and week plan. It does not read your sleep, heart rate or anything outside the app. Ask it what to train, whether you ate enough protein, or to add a workout by typing it.',
  },
  {
    q: 'Which Apple Health data does Carve use?',
    a: 'Your daily step count, and nothing else. You are asked for permission the first time, and you can change it in the Health app under Sharing.',
  },
  {
    q: 'What is Carve Pro, and what does it cost?',
    a: 'Carve is free to download. New accounts get 30 days of Pro for free. After that, Pro continues only if you subscribe through the App Store; the price is shown in the app. Cancel any time in your Apple ID settings under Subscriptions.',
  },
  {
    q: 'How do I delete my account?',
    a: 'In the app, go to Settings, then Account, then Delete account. Everything you logged is removed within 30 days. If you cannot get into the app, email support@carve.wiki from the address on the account and we will do it for you.',
  },
  {
    q: 'Is there an Android version?',
    a: 'No. Carve is for iPhone. There is no Android version and none is planned right now.',
  },
];

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      updated="September 5, 2026"
      intro="Most questions are answered below. If yours is not, send a message; a real person reads it."
    >
      <section>
        <h2>Frequently asked</h2>
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-white/30 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-white/60">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email <a href="mailto:support@carve.wiki">support@carve.wiki</a>, or use the form. Include the screen you were on and, for a meal or workout, the date. We reply within a day on weekdays.
        </p>
        <div className="mt-6">
          <SupportForm />
        </div>
      </section>

      <section>
        <h2>Requirements</h2>
        <ul>
          <li>iPhone with a recent version of iOS. The App Store page shows the exact minimum.</li>
          <li>An internet connection for photo recognition, barcode lookup and the coach. Your log itself is stored in the cloud and synced between devices.</li>
        </ul>
      </section>

      <section>
        <h2>Privacy and terms</h2>
        <p>
          What we store and who sees it is in the <a href="/privacy">Privacy Policy</a>. The rules for using Carve, including Pro and refunds, are in the <a href="/terms">Terms of Service</a>.
        </p>
      </section>
    </LegalPage>
  );
}
