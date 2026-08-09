import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

describe('design tokens', () => {
  const requiredTokens = [
    '--color-black',
    '--color-off-white',
    '--color-accent-green',
    '--color-accent-red',
    '--color-accent-purple',
    '--font-display',
    '--font-body',
    '--font-mono',
    '--size-display-xl',
    '--space-lg',
    '--ease-editorial',
  ];

  it.each(requiredTokens)('defines %s', (token) => {
    expect(css).toContain(token);
  });

  it('includes a prefers-reduced-motion rule', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
