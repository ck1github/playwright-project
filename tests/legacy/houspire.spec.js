import { test, expect } from '@playwright/test';

test('Houspire homepage loads correctly', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/');

  // Verify title
  await expect(page).toHaveTitle(/Houspire/i);

  // Verify hero section or key element exists
  const heading = page.locator('h1, h2, h3');
  await expect(heading.first()).toBeVisible();
});
test('Navigate to About Us page', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/about/i);
});

test('Submit Contact Form', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/contact');

  await page.fill('input[name="name"]', 'Chandrakant');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="message"]', 'Testing Playwright form automation.');

  await page.click('button[type="submit"]');
  await expect(page.locator('text=Thank you')).toBeVisible();
});
test('View 2BHK Interiors Project', async ({ page }) => {
  await page.goto('https://houspire.gohilinfotech.com/');
  const project = page.locator("//h3[normalize-space(.)='2BHK Interiors']");
  await project.click();
  await expect(page).toHaveURL(/2bhk-interiors/i);
});
