import { expect, test } from "@playwright/test";

test("protected routes redirect unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/today");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Athar" })).toBeVisible();
});
