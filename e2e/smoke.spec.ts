import { expect, test } from "@playwright/test";

test("ships a bilingual evidence-first landing without browser errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveTitle("TYNYS Mektep");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Мектеп кестесі ауа райын да ескеруі тиіс.",
    }),
  ).toBeVisible();
  await expect(page.locator(".evidence-card")).toHaveCount(4);
  await expect(page.locator(".evidence-card__source")).toHaveCount(4);

  let localeNavigations = 0;
  page.on("framenavigated", () => {
    localeNavigations += 1;
  });
  await page.getByRole("button", { name: "Русский" }).click();
  expect(localeNavigations).toBe(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Школьное расписание должно учитывать и погоду.",
    }),
  ).toBeVisible();

  const demoCta = page.getByRole("link", {
    name: "Проверить школьный день",
  });
  await expect(demoCta).toHaveAttribute("href", "#demo");
  await demoCta.click();
  await expect(page).toHaveURL(/#demo$/);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Школьное расписание должно учитывать и погоду.",
    }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
  expect(consoleErrors).toEqual([]);
});
