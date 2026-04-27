import { expect, test } from "@playwright/test";

test("login page renders email and Google sign-in options", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Athar" })).toBeVisible();
  await expect(page.getByPlaceholder("Email address")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});
