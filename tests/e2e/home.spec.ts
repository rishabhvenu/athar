import { expect, test } from "@playwright/test";

test("home redirects unauthenticated visitors into the login flow", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Athar" })).toBeVisible();
});
