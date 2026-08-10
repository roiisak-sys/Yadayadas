import { describe, it, expect } from 'vitest';
import bandMembers from './content/band-members.json';
import events from './content/events.json';
import storyBeats from './content/story-beats.json';
import copyHe from './content/copy.he.json';
import copyEn from './content/copy.en.json';

describe('band-members.json', () => {
  it('has exactly 6 core members', () => {
    expect(bandMembers.filter((m: any) => m.role === 'core')).toHaveLength(6);
  });

  it('every member has required bilingual fields', () => {
    for (const m of bandMembers as any[]) {
      expect(m.id).toBeTruthy();
      expect(m.nameHe).toBeTruthy();
      expect(m.nameEn).toBeTruthy();
      expect(m.instrumentHe).toBeTruthy();
      expect(m.instrumentEn).toBeTruthy();
      expect(m.photo).toMatch(/^\/assets\/band\/.+\.jpg$/);
    }
  });

  it('has unique ids', () => {
    const ids = (bandMembers as any[]).map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every member has an age and non-empty bilingual bio', () => {
    for (const m of bandMembers as any[]) {
      expect(typeof m.age).toBe('number');
      expect(m.age).toBeGreaterThan(0);
      expect(m.bioHe.length).toBeGreaterThan(0);
      expect(m.bioEn.length).toBeGreaterThan(0);
    }
  });
});

describe('events.json', () => {
  it('every event has required fields and a valid ISO date', () => {
    for (const e of events as any[]) {
      expect(e.id).toBeTruthy();
      expect(() => new Date(e.dateISO).toISOString()).not.toThrow();
      expect(e.venueHe).toBeTruthy();
      expect(e.venueEn).toBeTruthy();
      expect(['past', 'upcoming']).toContain(e.status);
    }
  });
});

describe('story-beats.json', () => {
  it('has at least 10 beats covering the Thin White Duke/Berlin arc', () => {
    expect((storyBeats as any[]).length).toBeGreaterThanOrEqual(10);
  });

  it('every beat has bilingual text and an order index', () => {
    (storyBeats as any[]).forEach((b, i) => {
      expect(b.he).toBeTruthy();
      expect(b.en).toBeTruthy();
      expect(b.order).toBe(i);
    });
  });
});

describe('copy.he.json / copy.en.json', () => {
  it('both locales define the same set of keys', () => {
    const flatten = (obj: any, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        typeof v === 'object' && v !== null
          ? flatten(v, `${prefix}${k}.`)
          : [`${prefix}${k}`]
      );
    const heKeys = flatten(copyHe).sort();
    const enKeys = flatten(copyEn).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it('both locales define 8 Bowie eras with name, line, and image', () => {
    expect(copyHe.bowies.eras).toHaveLength(8);
    expect(copyEn.bowies.eras).toHaveLength(8);
    for (const era of [...copyHe.bowies.eras, ...copyEn.bowies.eras] as any[]) {
      expect(era.name).toBeTruthy();
      expect(era.line).toBeTruthy();
      expect(era.image).toMatch(/^\/assets\/bowie\/.+\.jpg$/);
    }
  });
});
