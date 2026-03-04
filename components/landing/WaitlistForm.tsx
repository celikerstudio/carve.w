'use client'

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { track } from '@/lib/analytics';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function WaitlistForm({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setError('');

    // Track signup initiation
    track('waitlist_signup_initiated', { source: source as 'hero' | 'footer' | 'demo' });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          turnstileToken: turnstileToken || 'dev-token', // Fallback for development
          consentGiven: consent,
          source
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setState('error');

        // Track failure
        track('waitlist_signup_failed', {
          source: source as 'hero' | 'footer' | 'demo',
          error_type: data.error || 'unknown'
        });
        return;
      }

      setState('success');
      setEmail('');
      setConsent(false);

      // Track success
      track('waitlist_signup_success', { source: source as 'hero' | 'footer' | 'demo' });
    } catch (err) {
      setError('Network error. Please try again.');
      setState('error');

      // Track network error
      track('waitlist_signup_failed', {
        source: source as 'hero' | 'footer' | 'demo',
        error_type: 'network_error'
      });
    }
  };

  if (state === 'success') {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-900">
          You're almost there! 🎉
        </h3>
        <p className="mt-2 text-sm text-green-700">
          Check your inbox and click the verification link to confirm your spot.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={state === 'loading'}
        className="h-12 text-base"
      />

      <div className="flex items-start gap-2">
        <Checkbox
          checked={consent}
          onCheckedChange={checked => setConsent(!!checked)}
          disabled={state === 'loading'}
          id="consent"
        />
        <label htmlFor="consent" className="text-sm text-ink-secondary leading-tight cursor-pointer">
          I agree to receive launch updates and accept the{' '}
          <a href="/privacy" className="underline hover:text-ink">Privacy Policy</a>
        </label>
      </div>

      {/* TODO: Enable Turnstile when keys are configured */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
        />
      )}

      <Button
        type="submit"
        disabled={!email || !consent || state === 'loading'}
        className="w-full h-12 text-base font-semibold"
      >
        {state === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </Button>

      {state === 'error' && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </form>
  );
}
