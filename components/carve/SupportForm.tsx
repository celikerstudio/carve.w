'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Het contactformulier op /support.
 *
 * @ai-why: Slaat op in de `feedback`-tabel via /api/contact, net als het oude
 * formulier. Het type-veld kent daar alleen bug, feature, wiki en other; het
 * oude formulier stuurde standaard 'general' en kreeg dus een 400 terug zonder
 * dat je dat zag. De drie keuzes hier zijn alle drie geldig.
 * @ai-sync: app/api/contact/route.ts (validTypes)
 */
export function SupportForm() {
  const [state, setState] = useState<FormState>('idle');
  const [form, setForm] = useState({ name: '', email: '', type: 'bug', message: '' });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('success');
      setForm({ name: '', email: '', type: 'bug', message: '' });
    } catch {
      setState('error');
    }
  }

  const field =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/25';

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 text-center">
        <p className="font-semibold text-white">Sent.</p>
        <p className="mt-1 text-sm text-white/50">We read everything and reply by email, usually within a day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={field}
          placeholder="Your name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={field}
          type="email"
          placeholder="Your email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <select className={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="bug">Something is broken</option>
        <option value="feature">A suggestion</option>
        <option value="other">Something else</option>
      </select>
      <textarea
        className={`${field} min-h-[140px] resize-y`}
        placeholder="What happened, and on which screen? If a meal or workout is involved, the date helps."
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {state === 'loading' ? 'Sending…' : 'Send'}
        </button>
        {state === 'error' ? (
          <p className="text-sm text-white/50">
            That didn&apos;t go through. Email us instead at <a className="text-white underline underline-offset-4" href="mailto:support@carve.wiki">support@carve.wiki</a>.
          </p>
        ) : null}
      </div>
    </form>
  );
}
