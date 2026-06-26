import { test, expect, type Page } from "@playwright/test";

/**
 * Regression: the "All Tools" mega menu must stay open while the cursor
 * traverses the gap between the trigger button (top: ~56px) and the menu
 * (top: 88px). Firefox/Safari previously dismissed the menu mid-traverse
 * because there was no hover bridge / close-delay.
 *
 * Runs against chromium, firefox, and webkit (see playwright.config.ts).
 */

async function openAllToolsAndCrossGap(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const trigger = page.getByRole("button", { name: /all tools/i });
  await expect(trigger).toBeVisible();

  const box = await trigger.boundingBox();
  if (!box) throw new Error("All Tools trigger has no bounding box");

  // Hover the trigger to open the menu.
  await trigger.hover();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  // Walk the cursor through the gap between the trigger bottom and the menu top.
  // Move in small steps so any "mouseleave -> close" without a bridge will fire.
  const menuBox = await menu.boundingBox();
  if (!menuBox) throw new Error("Mega menu has no bounding box");

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height;
  const endX = menuBox.x + Math.min(120, menuBox.width / 2);
  const endY = menuBox.y + 10;

  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await page.mouse.move(startX + (endX - startX) * t, startY + (endY - startY) * t, { steps: 2 });
    // brief settle so any pending close-timer would have fired
    await page.waitForTimeout(20);
  }

  return { menu };
}

test.describe("All Tools mega menu hover gap", () => {
  test("stays open while cursor crosses the gap into the menu", async ({ page }) => {
    const { menu } = await openAllToolsAndCrossGap(page);
    await expect(menu).toBeVisible();
  });

  test("first tool link inside the menu is clickable after the hover traverse", async ({ page }) => {
    const { menu } = await openAllToolsAndCrossGap(page);

    const firstLink = menu.getByRole("menuitem").first();
    await expect(firstLink).toBeVisible();

    const href = await firstLink.getAttribute("href");
    expect(href, "menu item should have an href").toBeTruthy();

    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("menu closes shortly after the cursor leaves both the trigger and the menu", async ({ page }) => {
    const { menu } = await openAllToolsAndCrossGap(page);
    await expect(menu).toBeVisible();

    // Move far away from both the trigger and the menu.
    await page.mouse.move(10, 500);
    // Close-delay is 180ms — give it room.
    await expect(menu).toBeHidden({ timeout: 2000 });
  });
});
