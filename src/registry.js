// Every chapter and bonus puzzle, in order. Add new ones here.
import { BonusCatalogue } from "./bonuses/catalogue";
import { BonusFleet } from "./bonuses/fleet";
import { BonusLine } from "./bonuses/line";
import { BonusSequences } from "./bonuses/sequences";
import { BonusWords } from "./bonuses/words";
import { CH1_STEPS, ChapterOne } from "./chapters/ch1";
import { CH2_STEPS, ChapterTwo } from "./chapters/ch2";
import { CH3_STEPS, ChapterThree } from "./chapters/ch3";
import { CH4_STEPS, ChapterFour } from "./chapters/ch4";
import { CH5_STEPS, ChapterFive } from "./chapters/ch5";
import { CH6_STEPS, ChapterSix } from "./chapters/ch6";

export const BONUSES = {
  ch2: [{ id: "ch2-bonus", title: "A fleet of endless buses", view: BonusFleet }],
  ch4: [{ id: "ch4-bonus", title: "Every finite word", view: BonusWords }],
  ch6: [
    { id: "ch6-line", title: "The whole line in a tiny piece", view: BonusLine },
    { id: "ch6-seq", title: "Endless lists of numbers", view: BonusSequences },
    { id: "ch6-cat", title: "The catalogue of catalogues", view: BonusCatalogue },
  ],
};

export const CHAPTERS = [
  { id: "ch1", title: "Pots and lids", blurb: "A tribe that counts to three finds a way to compare piles it can't count.", ready: true },
  { id: "ch2", title: "Hilbert's hotel", blurb: "Every room is full, yet new guests keep fitting in, even a busload that never ends.", ready: true },
  { id: "ch3", title: "Both directions", blurb: "Squares, then a street that runs forever both ways, sent into the hotel by you.", ready: true },
  { id: "ch4", title: "Every fraction", blurb: "Fractions crowd into every gap on the number line. Can they still be listed?", ready: true },
  { id: "ch5", title: "Cantor's diagonal", blurb: "A list that always misses something, and an infinity that's bigger.", ready: true },
  { id: "ch6", title: "Infinite arithmetic", blurb: "Adding, multiplying and powering infinities, and why there's no biggest one.", ready: true },
];

// All chapters in one place: the save code reads step ids from here, the app picks views from here.
export const CHAPTER_STEPS = { ch1: CH1_STEPS, ch2: CH2_STEPS, ch3: CH3_STEPS, ch4: CH4_STEPS, ch5: CH5_STEPS, ch6: CH6_STEPS };

export const CHAPTER_VIEWS = { ch1: ChapterOne, ch2: ChapterTwo, ch3: ChapterThree, ch4: ChapterFour, ch5: ChapterFive, ch6: ChapterSix };
