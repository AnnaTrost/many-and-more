// Opens every step of every chapter and every bonus puzzle, then replays the bugs fixed so far.
import { test, expect } from "@playwright/test";
import { BONUSES, CHAPTERS as CHAPTER_LIST } from "../../src/registry.js";
import { SAVE_KEY } from "../../src/save.js";

// Read from the game itself, so new chapters and bonuses are covered without touching this file.
const CHAPTERS = CHAPTER_LIST.map(c => c.id);
const BONUS_COUNT = Object.values(BONUSES).flat().length;

// Start from a save where every chapter is finished, so every step and bonus can be opened.
async function seed(page, steps = {}) {
  await page.goto("/");
  await page.evaluate(([key, save]) => localStorage.setItem(key, JSON.stringify(save)), [
    SAVE_KEY, { version: 2, steps, reach: {}, completed: CHAPTERS, extra: {} },
  ]);
  await page.reload();
}

async function openChapter(page, ch, step) {
  await seed(page, step ? { [ch]: step } : {});
  await page.locator(".chapter").nth(CHAPTERS.indexOf(ch)).locator(".act button").click();
}

let errors;
test.beforeEach(({ page }) => {
  errors = [];
  page.on("pageerror", e => errors.push(e.message));
});
test.afterEach(() => expect(errors, "uncaught errors on the page").toEqual([]));

test.describe("every screen opens", () => {
  test("the chapter map", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".chapter")).toHaveCount(CHAPTERS.length);
  });

  for (const ch of CHAPTER_LIST.filter(c => c.ready).map(c => c.id)) {   // "Coming soon" chapters have nothing to open yet
    test(`every step of ${ch}`, async ({ page }) => {
      await openChapter(page, ch);
      const dots = page.locator(".progress .dot");
      const n = await dots.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        if (i > 0) await page.getByRole("button", { name: `Go to step ${i + 1}`, exact: true }).click();
        await expect(page.locator(".progress")).toHaveAttribute("aria-label", `Step ${i + 1} of ${n}`);
        await expect(page.locator("h2").first()).toBeVisible();
      }
    });
  }

  test("every bonus puzzle", async ({ page }) => {
    await seed(page);
    const n = await page.locator(".bonus-chip").count();
    expect(n).toBe(BONUS_COUNT);
    for (let i = 0; i < n; i++) {
      await page.goto("/");
      await page.locator(".bonus-chip").nth(i).click();
      await expect(page.getByText("Bonus puzzle", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back to chapters" }).click();
    }
  });
});

test.describe("regressions", () => {
  test("ch1: a wrong guess before pairing doesn't mark the right answer wrong", async ({ page }) => {
    await openChapter(page, "ch1", "many");
    await page.getByRole("button", { name: "The same number" }).click();
    await page.getByRole("button", { name: "We can't tell by counting" }).click();
    for (let i = 1; i <= 3; i++) {
      await page.getByRole("button", { name: `Lid ${i}`, exact: true }).click();
      await page.getByRole("button", { name: new RegExp(`^Pot ${i},`) }).click();
    }
    await page.getByRole("button", { name: "Pair the rest for me" }).click();
    await expect(page.getByRole("button", { name: "The same number" })).not.toHaveClass(/picked-wrong/);
    await expect(page.locator(".feedback.bad")).toHaveCount(0);
  });

  test("ch3: houses sent out of order still make a valid plan", async ({ page }) => {
    await openChapter(page, "ch3", "street");
    for (const h of ["0", "2", "1", "−1", "3", "−2", "4", "−3", "5"]) {
      await page.getByRole("button", { name: `Send house ${h} to the next room` }).click();
    }
    await expect(page.locator(".feedback.good")).toBeVisible();
  });

  test("ch3: the n ↔ n² lines appear with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openChapter(page, "ch3", "squares");
    await page.getByRole("button", { name: "They're the same size" }).click();
    await expect(page.locator("line.draw").first()).toHaveCSS("stroke-dashoffset", "0px");
  });

  test("ch5: the patch spots are visible without hovering", async ({ page }) => {
    await openChapter(page, "ch5", "game");
    await page.getByRole("button", { name: "Lock in my list" }).click();
    await page.getByRole("button", { name: "Check every room" }).click({ timeout: 15000 });
    await page.getByRole("button", { name: "Patch my list" }).click();
    await page.mouse.move(0, 0);
    const spot = page.getByRole("button", { name: "Put Mira's number in room 1" });
    await expect(spot).toHaveCSS("opacity", "1");
    await spot.click();
    await expect(page.locator(".drow.mira")).toHaveCount(1);
  });

  test("ch6: the zipper keeps keyboard focus on the next digit", async ({ page }) => {
    await openChapter(page, "ch6", "zip");
    await page.getByRole("button", { name: "Digit 1 of x: 3" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Digit 1 of y: 2" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Digit 2 of x: 1" })).toBeFocused();
  });

  test("ch6: a finite switch pattern reads as a finite set", async ({ page }) => {
    await openChapter(page, "ch6", "switch");
    await page.locator(".sw").first().click();
    await expect(page.locator(".swread p").first()).toHaveText("Switches on: {1}");
  });

  test("line bonus: the tasks can be finished with the keyboard alone", async ({ page }) => {
    await seed(page);
    await page.getByRole("button", { name: /The whole line in a tiny piece/ }).click();
    const arc = page.getByRole("slider");
    await arc.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Home");
    await expect(arc).toHaveAttribute("aria-valuenow", "1");   // 1/200 of the way, just inside the left end
    for (let i = 0; i < 9; i++) await page.keyboard.press("PageUp");
    for (let i = 0; i < 9; i++) await page.keyboard.press("ArrowRight");   // step 100: straight below the light
    await expect(arc).toHaveAttribute("aria-valuetext", /partner on the line is 0\.00$/);
    await expect(page.locator(".missions li.ok")).toHaveCount(3);
    await expect(page.getByText("Which points of the arc have no partner at all?")).toBeVisible();
  });
});
