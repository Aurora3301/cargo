import { test, expect } from '@playwright/test';

test('edit, preview, save, and publish a portfolio', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Headline')).toBeVisible();
  await page.getByLabel('Headline').fill('A portfolio made for the test');
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'A portfolio made for the test' })).toBeVisible();
  await page.getByRole('button', { name: 'Mobile' }).click();
  await expect(page.getByRole('button', { name: 'Mobile' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Save draft/ }).click();
  await expect(page.getByText('Changes saved on this computer.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Headline')).toHaveValue('A portfolio made for the test');
  await page.getByRole('button', { name: /Publish static site/ }).click();
  await expect(page.getByText(/Published to/)).toBeVisible();
});
