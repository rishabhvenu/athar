import { expect, test } from "@playwright/test";

import { addSupabaseAuthCookie } from "../helpers/session";

test("signed-in user can capture a memory", async ({ baseURL, context, page }) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required for auth cookie setup");
  }

  await addSupabaseAuthCookie(context, baseURL);
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/capture");
  await page.getByLabel("Surah").fill("2");
  await page.getByLabel("Ayah").fill("286");
  await page.getByRole("button", { name: "calm" }).click();
  await page.getByRole("button", { name: "Save Memory" }).click();

  await expect(page.getByLabel("Reflection")).toHaveValue("");
});
