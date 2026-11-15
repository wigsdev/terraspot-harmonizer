import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Build Optimization & Chunk Splitting (T-11)', () => {
  const distDir = path.resolve(__dirname, '../dist');
  const assetsDir = path.resolve(distDir, 'assets');

  it('generates dist directory with valid index.html entry point', () => {
    expect(fs.existsSync(distDir)).toBe(true);
    const indexHtml = path.resolve(distDir, 'index.html');
    expect(fs.existsSync(indexHtml)).toBe(true);
    const content = fs.readFileSync(indexHtml, 'utf-8');
    expect(content).toContain('TerraSpot Harmonizer');
  });

  it('produces partitioned modular chunks without monolithic bundle (> 500 kB limit)', () => {
    expect(fs.existsSync(assetsDir)).toBe(true);
    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    expect(jsFiles.length).toBeGreaterThanOrEqual(4);

    // Verify vendor partitions exist
    const hasVendorGis = jsFiles.some((f) => f.startsWith('vendor-gis'));
    const hasVendorReact = jsFiles.some((f) => f.startsWith('vendor-react'));
    const hasVendorCharts = jsFiles.some((f) => f.startsWith('vendor-charts'));
    const hasAppIndex = jsFiles.some((f) => f.startsWith('index-'));

    expect(hasVendorGis).toBe(true);
    expect(hasVendorReact).toBe(true);
    expect(hasVendorCharts).toBe(true);
    expect(hasAppIndex).toBe(true);

    // Assert that no single chunk exceeds 500 kB (512,000 bytes)
    jsFiles.forEach((file) => {
      const stats = fs.statSync(path.resolve(assetsDir, file));
      const sizeKB = stats.size / 1024;
      expect(sizeKB).toBeLessThan(500);
    });
  });
});
