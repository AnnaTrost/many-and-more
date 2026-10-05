// The chapter list is wired up consistently, and saves can tell every step apart.
import { describe, expect, it } from "vitest";
import { BONUSES, CHAPTERS, CHAPTER_STEPS, CHAPTER_VIEWS } from "../../src/registry";

const stepId = s => s.id || s.kind;   // the same rule src/save.js uses

describe("registry", () => {
  it("has steps and a view for every chapter, and nothing extra", () => {
    const ids = CHAPTERS.map(c => c.id);
    expect(Object.keys(CHAPTER_STEPS)).toEqual(ids);
    expect(Object.keys(CHAPTER_VIEWS)).toEqual(ids);
    for (const id of ids) expect(typeof CHAPTER_VIEWS[id]).toBe("function");
  });

  it.each(Object.entries(CHAPTER_STEPS))("gives every step of %s a unique id", (_, steps) => {
    const ids = steps.map(stepId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("hangs bonuses off real chapters, with ids that don't clash with anything", () => {
    const chapterIds = CHAPTERS.map(c => c.id);
    for (const ch of Object.keys(BONUSES)) expect(chapterIds).toContain(ch);
    const bonusIds = Object.values(BONUSES).flat().map(b => b.id);
    expect(new Set([...bonusIds, ...chapterIds]).size).toBe(bonusIds.length + chapterIds.length);
    for (const b of Object.values(BONUSES).flat()) expect(typeof b.view).toBe("function");
  });
});
