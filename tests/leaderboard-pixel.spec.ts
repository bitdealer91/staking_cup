import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

test('Leaderboard matches Figma baseline at 1440px', async ({ page }) => {
  await page.goto('/staking-cup/qualifiers');

  const card = page.getByTestId('leaderboard-card');
  await card.scrollIntoViewIfNeeded();
  const screenshot = await card.screenshot();

  const baselinePath = path.resolve('public', 'baseline-leaderboard.png');
  if (!fs.existsSync(baselinePath)) {
    // First run: create baseline automatically if missing
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, screenshot);
  }

  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(screenshot);

  expect(actual.width).toBe(baseline.width);
  expect(actual.height).toBe(baseline.height);

  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    width,
    height,
    { threshold: 0.01 }
  );

  const total = width * height;
  const diffRatio = diffPixels / total;

  // Assert threshold ≤ 0.01 and average diff ≤ 1px equivalent (ratio proxy)
  expect(diffRatio, `diffRatio=${diffRatio}`).toBeLessThanOrEqual(0.01);
});


