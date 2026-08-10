import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');

beforeAll(() => {
  if (!existsSync(join(DIST, 'he', 'index.html'))) {
    throw new Error(
      'dist/he/index.html not found. Run `npm run build` before running this test suite.'
    );
  }
});

describe('accessibility structure — /he/', () => {
  const html = () => readFileSync(join(DIST, 'he', 'index.html'), 'utf-8');

  it('sets dir="rtl" and lang="he" on <html>', () => {
    expect(html()).toMatch(/<html[^>]*lang="he"[^>]*dir="rtl"/);
  });

  it('has exactly one <h1>', () => {
    const matches = html().match(/<h1[\s>]/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it('has a <main> landmark', () => {
    expect(html()).toContain('<main');
  });

  it('every <img> has an alt attribute (empty alt is valid for decorative images)', () => {
    const imgTags = html().match(/<img[^>]*>/g) ?? [];
    expect(imgTags.length).toBeGreaterThan(0);
    for (const tag of imgTags) {
      expect(tag).toMatch(/alt="[^"]*"/);
    }
  });
});

describe('accessibility structure — /en/', () => {
  const html = () => readFileSync(join(DIST, 'en', 'index.html'), 'utf-8');

  it('sets dir="ltr" and lang="en" on <html>', () => {
    expect(html()).toMatch(/<html[^>]*lang="en"[^>]*dir="ltr"/);
  });

  it('has exactly one <h1>', () => {
    const matches = html().match(/<h1[\s>]/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});
