import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../public/demo-slides.html'), 'utf-8');

describe('Executive Slide Deck (T-12)', () => {
  it('contains exactly 7 slides (NASA Global Judging limit)', () => {
    const slides = html.match(/<section class="slide[^"]*" data-slide="\d+"/g) ?? [];
    expect(slides).toHaveLength(7);
    for (let i = 1; i <= 7; i++) {
      expect(html).toContain(`data-slide="${i}"`);
    }
    expect(html).not.toContain('data-slide="8"');
  });

  it('is in English and fully offline (no external scripts, stylesheets or CDN imports)', () => {
    expect(html).toContain('<html lang="en">');
    expect(html).not.toMatch(/<script[^>]+src=/i);
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/i);
    expect(html).not.toMatch(/@import\s+url\(/i);
  });

  it('implements keyboard, touch and counter navigation', () => {
    for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      expect(html).toContain(key);
    }
    expect(html).toContain("' ': e.preventDefault()");
    expect(html).toContain('touchstart');
    expect(html).toContain('Slide 1 of 7');
    expect(html).toContain("'Slide ' + (idx + 1) + ' of ' + total");
  });

  it('features all 5 NASA Space Apps Global Offers', () => {
    for (const offer of [
      'Meteomatics Weather API',
      'GoDaddy Registry &amp; Porkbun',
      'Microsoft Planetary Computer',
      'GitHub Copilot',
      'Miro',
    ]) {
      expect(html).toContain(offer);
    }
  });

  it('discloses SI usage and does not embed NASA logos', () => {
    expect(html).toContain('Super Intelligence disclosure');
    expect(html).toMatch(/No NASA logos or insignia were generated or altered/);
    expect(html).not.toMatch(/<img[^>]+nasa/i);
  });
});
