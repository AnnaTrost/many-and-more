// Saved progress: migration from v1, validation of damaged saves, and step id lookups.
import { describe, expect, it } from "vitest";
import { CH1_STEPS } from "../../src/chapters/ch1";
import { freshSave, normalizeSave, stepIdAt, stepIndex } from "../../src/save";

describe("normalizeSave", () => {
  it("returns a fresh save for anything that isn't an object", () => {
    for (const raw of [null, undefined, 42, "save", [], true]) expect(normalizeSave(raw)).toEqual(freshSave());
  });

  it("keeps a well-formed v2 save as it is", () => {
    const save = { version: 2, steps: { ch1: "many" }, reach: { ch1: "pair-more-pots" }, completed: ["ch2", "ch2-bonus"], extra: { hunch: "bigger" } };
    expect(normalizeSave(save)).toEqual(save);
  });

  it("migrates v1 step positions to step ids", () => {
    const out = normalizeSave({ steps: { ch1: 2, ch3: 1 }, reach: { ch1: 3 }, completed: ["ch1"] });
    expect(out.version).toBe(2);
    expect(out.steps).toEqual({ ch1: "many", ch3: "street" });
    expect(out.reach).toEqual({ ch1: "pair-more-pots" });
  });

  it("reads v1's 99 for a finished chapter as its last step", () => {
    expect(normalizeSave({ steps: { ch1: 99 } }).steps.ch1).toBe("reveal");
  });

  it("ignores numeric steps once the save is v2, and drops anything malformed", () => {
    const out = normalizeSave({
      version: 2,
      steps: { ch1: 3, ch2: "bus", ch3: null },
      reach: "everything",
      completed: ["ch1", 7, "ch1", null, "ch4"],
      extra: { hunch: "one", n: 3, nested: {} },
    });
    expect(out.steps).toEqual({ ch2: "bus" });
    expect(out.reach).toEqual({});
    expect(out.completed).toEqual(["ch1", "ch4"]);
    expect(out.extra).toEqual({ hunch: "one" });
  });

  it("drops negative and unknown-chapter v1 positions", () => {
    expect(normalizeSave({ steps: { ch1: -1, ch99: 2 } }).steps).toEqual({});
  });
});

describe("step ids", () => {
  it("translates between positions and ids", () => {
    CH1_STEPS.forEach((s, i) => expect(stepIndex("ch1", stepIdAt("ch1", i))).toBe(i));
  });

  it("falls back to the first step for ids that no longer exist", () => {
    expect(stepIndex("ch1", "a-step-that-was-removed")).toBe(0);
    expect(stepIndex("ch1", undefined)).toBe(0);
    expect(stepIndex("no-such-chapter", "story")).toBe(0);
  });

  it("has no id past the last step", () => {
    expect(stepIdAt("ch1", CH1_STEPS.length)).toBeUndefined();
  });
});
