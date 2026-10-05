// The functions that decide whether a player's answer or plan is right.
import { describe, expect, it } from "vitest";
import { decodeSwitches } from "../../src/bonuses/sequences";
import { judgeWords } from "../../src/bonuses/words";
import { whoIsIn } from "../../src/bonuses/fleet";
import { judgeOrder } from "../../src/chapters/ch3";
import { markOrder, zigOrder } from "../../src/chapters/ch4";

describe("chapter 3: judgeOrder", () => {
  it("accepts a strict zigzag", () => {
    expect(judgeOrder([0, 1, -1, 2, -2, 3, -3, 4, -4])).toMatchObject({ kind: "ok", strict: true });
  });

  it("accepts houses sent out of order as long as nobody is left behind", () => {
    expect(judgeOrder([0, 2, 1, -1, 3, -2, 4, -3, 5])).toMatchObject({ kind: "ok", strict: false });
    expect(judgeOrder([0, -2, 1, -1, 2, 3, -3, 4, -4])).toMatchObject({ kind: "ok" });
  });

  it("reports a house that is still waiting while someone further out has a room", () => {
    expect(judgeOrder([0, 1, -1, 3, -2, 4, -3, 5, -4])).toMatchObject({ kind: "skip", h: 2 });
    expect(judgeOrder([0, 1, -2, 2, -3, 3, -4, 4, -5])).toMatchObject({ kind: "skip", h: -1 });
  });

  it("reports the skipped house nearest the square", () => {
    expect(judgeOrder([0, 3, -1, 4, -2, 5, -3, 6])).toMatchObject({ kind: "skip", h: 1 });
  });

  it("reports a plan that never sends house 0", () => {
    expect(judgeOrder([1, -1, 2, -2, 3, -3, 4, -4, 5])).toMatchObject({ kind: "skip", h: 0 });
  });

  it("reports plans that only ever head one way", () => {
    expect(judgeOrder([1, 2, 3, 4, 5, 6])).toMatchObject({ kind: "east", eNext: 7, zero: false });
    expect(judgeOrder([0, -1, -2, -3, -4, -5])).toMatchObject({ kind: "west", wNext: -6, zero: true });
  });
});

describe("chapter 4: the diagonal walk", () => {
  it("walks each diagonal in turn, alternating direction", () => {
    expect(zigOrder(4)).toEqual([[1, 1], [1, 2], [2, 1], [3, 1], [2, 2], [1, 3]]);
  });

  it("visits every cell up to a diagonal exactly once", () => {
    const cells = zigOrder(9).map(([p, q]) => p + "/" + q);
    expect(new Set(cells).size).toBe(cells.length);
    expect(cells.length).toBe(36);   // diagonals 2…9 hold 1 + 2 + … + 8 cells
  });

  it("numbers fractions in lowest terms and skips duplicates", () => {
    const marks = markOrder(zigOrder(4), 6);
    expect(marks["2-2"]).toEqual({ dup: true });
    expect(marks["1-1"].n).toBe(1);
    expect(marks["1-3"]).toEqual({ n: 5, fresh: true });
  });
});

describe("bonus: every finite word", () => {
  it("accepts shortest-first lists", () => {
    expect(judgeWords(["A", "B", "AA", "AB", "BA", "BB", "AAA"])).toEqual({ ok: true });
    expect(judgeWords(["B", "A", "BB", "AA", "BA", "AB", "BAB"])).toEqual({ ok: true });
  });

  it("spots dictionary order", () => {
    expect(judgeWords(["A", "AA", "AAA", "AAB", "AB", "ABA", "ABB"])).toMatchObject({ ok: false, kind: "dict" });
  });

  it("names a long word listed while a shorter one waits", () => {
    expect(judgeWords(["A", "B", "AA", "BAB", "AB", "BA", "AAA"])).toEqual({ ok: false, kind: "dive", longest: "BAB", short: "BB" });
  });
});

describe("bonus: a fleet of endless buses", () => {
  it("finds old guests in powers of 2", () => {
    expect(whoIsIn(64)).toMatchObject({ kind: "old", k: 6 });
    expect(whoIsIn(2)).toMatchObject({ kind: "old", k: 1 });
  });

  it("finds bus passengers in powers of odd primes", () => {
    expect(whoIsIn(9)).toMatchObject({ kind: "bus", b: 1, k: 2 });
    expect(whoIsIn(343)).toMatchObject({ kind: "bus", b: 3, k: 3 });
  });

  it("leaves 1 and numbers with two different primes empty", () => {
    expect(whoIsIn(1).kind).toBe("empty");
    expect(whoIsIn(6)).toMatchObject({ kind: "empty", expr: "2 × 3" });
    expect(whoIsIn(12)).toMatchObject({ kind: "empty", expr: "2² × 3" });
  });

  it("doesn't count buses for very large primes", () => {
    expect(whoIsIn(9999991)).toMatchObject({ kind: "bus", b: null, k: 1 });   // a prime above the 200,000 cut-off
  });
});

describe("bonus: endless lists of numbers", () => {
  it("reads lit switches as counts, ended by a dark one", () => {
    expect(decodeSwitches([1, 1, 0, 0, 1, 1, 1, 0])).toEqual({ nums: [2, 0, 3], open: 0 });
  });

  it("reports a number that is still being counted", () => {
    expect(decodeSwitches([0, 1, 1])).toEqual({ nums: [0], open: 2 });
  });
});
