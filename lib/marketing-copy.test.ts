import { describe, expect, it } from 'vitest';
import { marketingCopy, splitsNadruk, TALEN } from '@/lib/marketing-copy';

/**
 * Alle sleutelpaden van een object, arrays op index.
 * Dus `hero.kopHard` en `overzicht.kaarten.0.titel`.
 */
function sleutelpaden(waarde: unknown, pad = ''): string[] {
  if (Array.isArray(waarde)) {
    return waarde.flatMap((item, i) => sleutelpaden(item, `${pad}.${i}`));
  }
  if (typeof waarde === 'object' && waarde !== null) {
    return Object.entries(waarde).flatMap(([sleutel, item]) => sleutelpaden(item, pad ? `${pad}.${sleutel}` : sleutel));
  }
  return [pad];
}

function teksten(waarde: unknown, pad = ''): [string, unknown][] {
  if (Array.isArray(waarde)) {
    return waarde.flatMap((item, i) => teksten(item, `${pad}.${i}`));
  }
  if (typeof waarde === 'object' && waarde !== null) {
    return Object.entries(waarde).flatMap(([sleutel, item]) => teksten(item, pad ? `${pad}.${sleutel}` : sleutel));
  }
  return [[pad, waarde]];
}

describe('marketingCopy', () => {
  it('kent precies de talen uit TALEN', () => {
    expect(Object.keys(marketingCopy).sort()).toEqual([...TALEN].sort());
  });

  // @ai-why: Dit is de enige controle die een vergeten vertaling ziet. TypeScript
  //   dwingt de vorm af zolang beide objecten de hand van een mens hebben, maar een
  //   optioneel veld of een `as` haalt die garantie weg, en een lege string komt er
  //   sowieso doorheen. Een ontbrekende kop geeft geen fout: de pagina rendert hem
  //   gewoon leeg, en dat is precies de pagina waar het advertentiegeld landt.
  it('heeft in elke taal dezelfde sleutels', () => {
    const basis = sleutelpaden(marketingCopy.en).sort();
    for (const taal of TALEN) {
      expect(sleutelpaden(marketingCopy[taal]).sort(), `taal ${taal}`).toEqual(basis);
    }
  });

  it('heeft nergens een lege of witruimte-tekst', () => {
    for (const taal of TALEN) {
      for (const [pad, waarde] of teksten(marketingCopy[taal])) {
        expect(typeof waarde, `${taal}.${pad}`).toBe('string');
        expect(String(waarde).trim(), `${taal}.${pad}`).not.toBe('');
      }
    }
  });

  // @ai-why: Een oneven aantal sterretjes betekent dat iemand een `**` is vergeten
  //   te sluiten. `splitsNadruk` vangt dat niet: die levert dan gewoon een segment
  //   waarin de rest van de zin vet staat. Zichtbaar op de pagina, onzichtbaar in de
  //   diff, dus hier.
  it('heeft de nadrukmarkering altijd in paren', () => {
    for (const taal of TALEN) {
      for (const [pad, waarde] of teksten(marketingCopy[taal])) {
        const sterren = String(waarde).match(/\*\*/g)?.length ?? 0;
        expect(sterren % 2, `${taal}.${pad}`).toBe(0);
      }
    }
  });

  it('heeft zeven weekdagen per taal', () => {
    for (const taal of TALEN) {
      expect(marketingCopy[taal].telefoon.weekdagen, `taal ${taal}`).toHaveLength(7);
    }
  });

  it('heeft vier telefoonschermen per taal', () => {
    for (const taal of TALEN) {
      expect(marketingCopy[taal].telefoon.schermen, `taal ${taal}`).toHaveLength(4);
    }
  });
});

describe('splitsNadruk', () => {
  it('geeft één gewoon segment terug zonder markering', () => {
    expect(splitsNadruk('Gewoon een zin.')).toEqual([{ tekst: 'Gewoon een zin.', nadruk: false }]);
  });

  it('zet het deel tussen sterretjes op nadruk', () => {
    expect(splitsNadruk('Voor **midden** na')).toEqual([
      { tekst: 'Voor ', nadruk: false },
      { tekst: 'midden', nadruk: true },
      { tekst: ' na', nadruk: false },
    ]);
  });

  it('kan met nadruk aan het eind van de zin', () => {
    expect(splitsNadruk('Alles behalve **dit**')).toEqual([
      { tekst: 'Alles behalve ', nadruk: false },
      { tekst: 'dit', nadruk: true },
    ]);
  });

  it('laat lege segmenten weg', () => {
    expect(splitsNadruk('**Alleen dit**')).toEqual([{ tekst: 'Alleen dit', nadruk: true }]);
  });
});
