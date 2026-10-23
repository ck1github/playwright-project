import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/', { timeout: 60000 });

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Houspire - Interior Design Platform/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/lp2');

  // Click the get started link.
  const title = page.locator("//h3[normalize-space(.)='2BHK Interiors']");
  // Expects page to have a heading with the name of Installation.
  await expect(title).toBeVisible();
});
