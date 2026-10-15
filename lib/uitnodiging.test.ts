import { describe, expect, it } from 'vitest';
import { AASA, APP_ID, handleUitUrl } from '@/lib/uitnodiging';

describe('handleUitUrl', () => {
  it('neemt een gewone handle over, in kleine letters', () => {
    expect(handleUitUrl('furkan')).toBe('furkan');
    expect(handleUitUrl('Furkan_42')).toBe('furkan_42');
  });

  it('haalt een @ en spaties weg', () => {
    expect(handleUitUrl('%40furkan')).toBe('furkan');
    expect(handleUitUrl(' furkan ')).toBe('furkan');
  });

  // Dezelfde grenzen als UsernameRules in de app: 3 tot 20 tekens, a-z, 0-9 en _.
  it('weigert wat de app nooit als handle uitgeeft', () => {
    expect(handleUitUrl('ab')).toBeNull();
    expect(handleUitUrl('a'.repeat(21))).toBeNull();
    expect(handleUitUrl('fur.kan')).toBeNull();
    expect(handleUitUrl('fur%20kan')).toBeNull();
    expect(handleUitUrl('<script>')).toBeNull();
  });

  it('geeft null op een kapotte codering in plaats van te gooien', () => {
    expect(handleUitUrl('%E0%A4%A')).toBeNull();
  });
});

describe('AASA', () => {
  it('laat alleen /u/* de app openen', () => {
    const detail = AASA.applinks.details[0];
    expect(detail.appIDs).toEqual([APP_ID]);
    expect(detail.components.map((c) => c['/'])).toEqual(['/u/*']);
  });

  it('noemt team en bundle van de app', () => {
    expect(APP_ID).toBe('AR9T5VTNJX.Celiker-Studio.Carve-AI');
  });
});
