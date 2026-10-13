import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!match) throw new Error(`Missing colour token --${name}`);
  return match[1] as string;
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(token(a)), luminance(token(b))].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG 2.2: 4.5:1 for normal text, 3:1 for the boundaries of form controls.
const TEXT: [string, string][] = [
  ['text', 'bg'],
  ['text', 'card'],
  ['text', 'card2'],
  ['muted', 'card'],
  ['muted', 'card2'],
  ['o', 'card'],
  ['o2', 'card'],
  ['on-o', 'o'],
  ['danger', 'card'],
  ['danger', 'danger-bg'],
  ['ok', 'card'],
  ['warn', 'card'],
];
const CONTROL: [string, string][] = [
  ['ctl', 'card'],
  ['ctl', 'card2'],
  ['ctl', 'bg'],
];

describe('colour contrast', () => {
  it.each(TEXT)('text %s on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(CONTROL)('control border %s on %s is at least 3:1', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});
