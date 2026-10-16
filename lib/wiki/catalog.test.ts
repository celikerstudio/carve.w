import { describe, expect, it } from 'vitest';
import { CALCULATORS, articleHref, calculate, categoryBySlug, readMinutes } from './catalog';

describe('wiki-catalogus', () => {
  it('bouwt het adres uit de categorienaam van de database', () => {
    expect(articleHref('Nutrition', 'protein')).toBe('/wiki/nutrition/protein');
    expect(articleHref('nutrition', 'protein')).toBe('/wiki/nutrition/protein');
  });

  it('geeft geen adres voor een categorie die niet op de site staat', () => {
    expect(articleHref('jiujitsu', 'guard')).toBeNull();
    expect(categoryBySlug('jiujitsu')).toBeUndefined();
  });

  it('rekent eiwit uit zoals het artikel het zegt: 1,6 tot 2,2 g per kilo', () => {
    expect(calculate(CALCULATORS.protein, 80)).toEqual([128, 176]);
    expect(calculate(CALCULATORS.protein, 70)).toEqual([112, 154]);
  });

  it('telt minstens één minuut lezen', () => {
    expect(readMinutes('kort')).toBe(1);
    expect(readMinutes(Array(660).fill('word').join(' '))).toBe(3);
  });
});
