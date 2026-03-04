'use client';

import { useState } from 'react';
import { Mail, MessageSquare, HelpCircle, Send, CheckCircle, AlertCircle, User, Dumbbell, Apple, Trophy, Users, Smartphone, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FaqCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  faqs: { question: string; answer: string }[];
};

const faqCategories: FaqCategory[] = [
  {
    id: 'account',
    title: 'Account',
    icon: <User className="w-4 h-4" />,
    faqs: [
      {
        question: 'Hoe maak ik een account aan?',
        answer: 'Download Carve uit de App Store en kies je registratiemethode: Apple Sign-In, Google Sign-In, e-mail of telefoonnummer. Bij e-mail registratie ontvang je een verificatielink. Na verificatie kun je direct beginnen met het instellen van je profiel en fitnessdoelen.'
      },
      {
        question: 'Kan ik op meerdere apparaten inloggen?',
        answer: 'Ja, je kunt op meerdere iOS apparaten tegelijk ingelogd zijn. Je data wordt automatisch gesynchroniseerd via de cloud zodat je workouts en voortgang overal up-to-date zijn.'
      },
      {
        question: 'Hoe reset ik mijn wachtwoord?',
        answer: 'Tik op het inlogscherm op "Wachtwoord vergeten". Voer je e-mailadres in en je ontvangt een link om een nieuw wachtwoord in te stellen. Check ook je spam folder als je de e-mail niet ziet.'
      },
      {
        question: 'Hoe verwijder ik mijn account?',
        answer: 'Ga naar Settings → Account → Delete Account. Je moet bevestigen dat je dit wilt. Let op: dit is permanent en al je data (workouts, voeding, voortgang) wordt definitief verwijderd. Er is geen optie om je account tijdelijk te pauzeren.'
      }
    ]
  },
  {
    id: 'workouts',
    title: 'Workouts',
    icon: <Dumbbell className="w-4 h-4" />,
    faqs: [
      {
        question: 'Hoe start ik een workout?',
        answer: 'Ga naar de Workout tab en tik op "Start Workout". Je kunt kiezen uit 6 workout templates (Full Body, Upper/Lower, Push Pull Legs, Arnold Split, Bro Split, of Custom) of direct oefeningen toevoegen aan een lege workout.'
      },
      {
        question: 'Hoeveel oefeningen zijn er beschikbaar?',
        answer: 'Carve bevat meer dan 130 oefeningen in de database. Je kunt zoeken op naam of filteren op spiergroep: Chest, Back, Shoulders, Arms, Legs en Core. Elke oefening heeft een icoon en form tips.'
      },
      {
        question: 'Wat kan ik loggen tijdens een workout?',
        answer: 'Per set log je het gewicht en aantal reps. Je kunt ook notities toevoegen per oefening. Sets kun je toevoegen of verwijderen tijdens de workout. Je ziet je vorige prestaties in je workout history zodat je weet wat je moet verslaan.'
      },
      {
        question: 'Kan ik workouts achteraf bewerken of verwijderen?',
        answer: 'Ja, je kunt voltooide workouts bewerken en verwijderen. Na het afronden zie je een samenvatting met totale duur, volume en verdiende XP. Je volledige workout geschiedenis blijft altijd beschikbaar.'
      },
      {
        question: 'Worden mijn Personal Records bijgehouden?',
        answer: 'Ja, Carve houdt automatisch je PRs bij per oefening. Je ziet ze op je dashboard en bij de oefening details. Je krijgt een notificatie wanneer je een nieuw PR zet!'
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Voeding',
    icon: <Apple className="w-4 h-4" />,
    faqs: [
      {
        question: 'Hoe log ik mijn maaltijden?',
        answer: 'Er zijn drie manieren: zoek in de database (Open Food Facts + FatSecret), gebruik de AI foto-analyse om eten te scannen, of voeg handmatig voeding toe. Je kunt ook eigen recepten en voedingsmiddelen opslaan.'
      },
      {
        question: 'Hoe werkt de AI foto-analyse?',
        answer: 'Maak een foto van je maaltijd en de AI herkent het voedsel, schat portiegroottes en kan zelfs barcodes op verpakkingen lezen. Je krijgt een confidence score (0.0-1.0) en kunt de suggestie altijd handmatig aanpassen.'
      },
      {
        question: 'Wat zijn de standaard voedingsdoelen?',
        answer: 'De standaard doelen zijn: 2500 kcal, 180g eiwit, 280g koolhydraten, 80g vet en 3000ml water. Je kunt al deze doelen aanpassen naar je eigen behoeftes in de instellingen.'
      },
      {
        question: 'Is er water tracking?',
        answer: 'Ja! Je kunt je waterinname loggen met quick-add knoppen (250ml, 500ml) of een aangepaste hoeveelheid invoeren. Je dagelijkse voortgang wordt visueel weergegeven met een progress bar.'
      }
    ]
  },
  {
    id: 'score',
    title: 'Score & Levels',
    icon: <Trophy className="w-4 h-4" />,
    faqs: [
      {
        question: 'Wat is de Carve Score?',
        answer: 'De Carve Score is een ELO-gebaseerde rating tussen 1000 en 2800 die je algehele fitness voortgang meet. De score wordt berekend uit: Consistency (35%), Training (30%), Nutrition (20%) en Movement (15%).'
      },
      {
        question: 'Welke tiers/ranks zijn er?',
        answer: 'Er zijn 9 tiers: Rookie (1000-1199), Bronze (1200-1399), Silver (1400-1599), Gold (1600-1799), Platinum (1800-1999), Diamond (2000-2199), Master (2200-2299), Grandmaster (2300-2399) en Legend (2400-2800). Elke tier heeft een eigen icoon en kleur.'
      },
      {
        question: 'Hoe werkt het skill/level systeem?',
        answer: 'Je hebt 6 skills (Chest, Back, Shoulders, Arms, Core, Legs) die elk tot level 99 kunnen. Je verdient 500 XP per voltooide set. Je totale max level is 594 (6 × 99). Op je dashboard zie je een visueel overzicht van je spiergroep levels.'
      },
      {
        question: 'Hoe werken streaks?',
        answer: 'Een streak telt het aantal opeenvolgende dagen dat je actief bent geweest. Een "actieve dag" betekent een workout voltooien OF je voedingsdoelen halen. Als je een dag mist, reset je streak naar 0.'
      }
    ]
  },
  {
    id: 'social',
    title: 'Social',
    icon: <Users className="w-4 h-4" />,
    faqs: [
      {
        question: 'Hoe voeg ik vrienden toe?',
        answer: 'Zoek op username in de Social tab. De ander moet je vriendschapsverzoek accepteren. Er is geen maximum aantal vrienden.'
      },
      {
        question: 'Wat kunnen vrienden van mij zien?',
        answer: 'Standaard kunnen vrienden je workouts, Carve Score, steps en PRs zien in de activity feed. Je kunt in Privacy Settings instellen wat je wilt delen of je profiel volledig privé maken.'
      },
      {
        question: 'Hoe werken de leaderboards?',
        answer: 'Er zijn leaderboards voor je vriendengroep en globaal. Je kunt filteren op weekly, monthly of all-time. De rankings zijn gebaseerd op Carve Score, workout volume en streaks.'
      },
      {
        question: 'Kan ik vrienden uitdagen?',
        answer: 'Ja! Via Challenges kun je competities starten met vrienden. Dit zijn leaderboard-gebaseerde uitdagingen waarbij je tegen elkaar strijdt op specifieke metrics.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technisch',
    icon: <Smartphone className="w-4 h-4" />,
    faqs: [
      {
        question: 'Wat is het verschil tussen Free en Pro?',
        answer: 'Free geeft toegang tot basis workout tracking, beperkte AI scans en standaard analytics. Pro ontgrendelt onbeperkte AI foto-analyse, geavanceerde analytics, de AI Coach met gepersonaliseerde adviezen, en priority support.'
      },
      {
        question: 'Welke apparaten worden ondersteund?',
        answer: 'Carve vereist iOS 17.0 of hoger. Android ondersteuning is in ontwikkeling. De app werkt op iPhone en iPad.'
      },
      {
        question: 'Werkt de app offline?',
        answer: 'Ja, Carve heeft een read-only offline modus tot maximaal 30 dagen. Je kunt je data bekijken maar nieuwe workouts worden gesynchroniseerd zodra je weer online bent.'
      },
      {
        question: 'Hoe werkt de Apple Health integratie?',
        answer: 'Carve synchroniseert met HealthKit voor steps, workouts, slaap en hartslag data. Ga naar Settings → Health om te kiezen welke data je wilt delen. Dit telt mee voor de Movement component van je Carve Score.'
      },
      {
        question: 'De app synchroniseert niet, wat nu?',
        answer: 'Check eerst je internetverbinding. Probeer de app te sluiten en opnieuw te openen. Ga naar Settings → Sync → Force Sync om handmatig te synchroniseren. Blijft het probleem? Neem contact op via het formulier hieronder.'
      }
    ]
  }
];

export default function SupportPage() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'general',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          type: formData.type === 'general' ? 'other' : formData.type,
          message: formData.message
        })
      });

      if (response.ok) {
        setFormState('success');
        setFormData({ name: '', email: '', type: 'general', message: '' });
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Support Center</h1>
          <p className="text-xl text-ink-secondary max-w-2xl mx-auto">
            Vind antwoorden op veelgestelde vragen of neem contact op met ons team.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="mailto:support@carve.wiki"
            className="block p-6 bg-surface border border-subtle rounded-xl hover:bg-surface hover:border-subtle transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink">Email Support</h3>
                <p className="text-ink-secondary text-sm">support@carve.wiki</p>
                <span className="inline-block mt-2 px-2 py-1 bg-subtle text-ink text-xs rounded-md">
                  Reactie binnen 24-48 uur
                </span>
              </div>
            </div>
          </a>

          <div className="p-6 bg-surface border border-subtle rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink">In-App Support</h3>
                <p className="text-ink-secondary text-sm">Settings → Help → Contact</p>
                <span className="inline-block mt-2 px-2 py-1 bg-subtle text-ink text-xs rounded-md">
                  Direct vanuit de Carve app
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="p-8 bg-surface border border-subtle rounded-xl">
          <h2 className="text-2xl font-bold text-ink mb-2">Veelgestelde Vragen</h2>
          <p className="text-ink-secondary mb-6">
            Selecteer een categorie om de bijbehorende vragen te bekijken.
          </p>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
              {faqCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-subtle bg-white text-ink data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {faqCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-subtle">
                      <AccordionTrigger className="text-left hover:no-underline text-ink">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-ink-secondary">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Contact Form */}
        <div id="contact" className="p-8 bg-surface border border-subtle rounded-xl">
          <h2 className="text-2xl font-bold text-ink mb-2">Contact Support</h2>
          <p className="text-ink-secondary mb-6">
            Kun je het antwoord niet vinden? Stuur ons een bericht.
          </p>

          {formState === 'success' ? (
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Bericht Verzonden!</p>
                <p className="text-green-700 text-sm">
                  We hebben je bericht ontvangen en reageren binnen 24-48 uur.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-ink">Je Naam</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jan Jansen"
                    className="bg-white border-subtle text-ink placeholder:text-ink-tertiary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-ink">E-mailadres</Label>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan@voorbeeld.nl"
                    className="bg-white border-subtle text-ink placeholder:text-ink-tertiary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-ink">Waar kunnen we mee helpen?</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-white border-subtle text-ink">
                    <SelectValue placeholder="Selecteer een onderwerp" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="general">Algemene vraag</SelectItem>
                    <SelectItem value="bug">Bug melden</SelectItem>
                    <SelectItem value="feature">Feature verzoek</SelectItem>
                    <SelectItem value="account">Account probleem</SelectItem>
                    <SelectItem value="billing">Abonnement vraag</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-ink">Je Bericht</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
                  className="bg-white border-subtle text-ink placeholder:text-ink-tertiary resize-none"
                />
              </div>

              {formState === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">
                    Er ging iets mis. Probeer opnieuw of mail ons direct.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={formState === 'loading'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {formState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Verstuur Bericht
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* App Info */}
        <div className="p-8 bg-surface border border-subtle rounded-xl">
          <h2 className="text-2xl font-bold text-ink mb-2">Over Carve</h2>
          <p className="text-ink-secondary mb-6">
            Technische specificaties en app features.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-ink">Systeemvereisten</h3>
              <ul className="text-ink-secondary text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">iOS</span>
                  iOS 17.0 of hoger
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">Devices</span>
                  iPhone en iPad
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Coming Soon</span>
                  Android
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-ink">Features</h3>
              <ul className="text-ink-secondary text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">130+</span>
                  Oefeningen
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">AI</span>
                  Voedingsanalyse
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">Health</span>
                  HealthKit integratie
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-subtle text-ink text-xs rounded">Offline</span>
                  30 dagen offline modus
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="p-8 bg-surface border border-subtle rounded-xl">
          <h2 className="text-2xl font-bold text-ink mb-6">Meer Informatie</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/privacy"
              className="p-4 bg-white border border-subtle rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-ink">Privacy Policy</h3>
              <p className="text-ink-secondary text-sm mt-1">Hoe we je data beschermen</p>
            </a>
            <a
              href="/terms"
              className="p-4 bg-white border border-subtle rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-ink">Gebruiksvoorwaarden</h3>
              <p className="text-ink-secondary text-sm mt-1">Terms of Service</p>
            </a>
            <a
              href="/"
              className="p-4 bg-white border border-subtle rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-ink">Fitness Wiki</h3>
              <p className="text-ink-secondary text-sm mt-1">Oefeningen en tips</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
