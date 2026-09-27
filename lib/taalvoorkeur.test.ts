import { describe, expect, it } from 'vitest';
import { marketingPadVoor } from '@/lib/taalvoorkeur';

describe('marketingPadVoor', () => {
  it('stuurt een Nederlandse browser naar /nl/app', () => {
    expect(marketingPadVoor('nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('/nl/app');
    expect(marketingPadVoor('nl')).toBe('/nl/app');
    expect(marketingPadVoor('nl-BE')).toBe('/nl/app');
  });

  it('houdt een Engelse browser op /app, ook als Nederlands verderop staat', () => {
    expect(marketingPadVoor('en-US,en;q=0.9,nl;q=0.8')).toBe('/app');
  });

  it('kiest op gewicht en niet op volgorde', () => {
    expect(marketingPadVoor('en;q=0.5,nl;q=0.9')).toBe('/nl/app');
  });

  // @ai-why: Googlebot en de AI-crawlers sturen meestal geen taalvoorkeur mee. Die moeten
  //   op /app blijven uitkomen, anders ziet de crawler iets anders dan wat TDR-0012 als
  //   x-default opgaf.
  it('stuurt zonder taalvoorkeur naar /app', () => {
    expect(marketingPadVoor(null)).toBe('/app');
    expect(marketingPadVoor('')).toBe('/app');
    expect(marketingPadVoor('*')).toBe('/app');
  });

  it('stuurt een taal die de site niet heeft naar /app', () => {
    expect(marketingPadVoor('de-DE,de;q=0.9')).toBe('/app');
    expect(marketingPadVoor('fr,de;q=0.9,nl;q=0.1')).toBe('/nl/app');
  });

  it('negeert een taal met gewicht nul', () => {
    expect(marketingPadVoor('nl;q=0')).toBe('/app');
  });
});
