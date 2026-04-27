import { expect, test } from "@playwright/test";

test("read verse page renders Quran text and translation from the mocked content API", async ({
  page,
}) => {
  await page.goto("/read/2/286");

  await expect(page.getByRole("heading", { name: "Surah 2, Ayah 286" })).toBeVisible();
  await expect(page.getByText("لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا")).toBeVisible();
  await expect(
    page.getByText("Allah does not burden a soul beyond that it can bear.")
  ).toBeVisible();
  await expect(page.getByText("Sahih International")).toBeVisible();
});
