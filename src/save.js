// Saved progress in localStorage: format, migration and validation.
import { CHAPTER_STEPS } from "./registry";

/* Save (client-side, localStorage):
   Save format, version 2:
     version:   2
     steps:     { [chapterId]: stepId }   where the player is in each chapter
     reach:     { [chapterId]: stepId }   the furthest step they've reached
     completed: [chapterId or bonusId]
     extra:     { [key]: string }         small answers carried between steps (the ch5 hunch)
   Steps are stored by id, not by position, so inserting or reordering steps never drops a
   returning player on the wrong step. An id that no longer exists falls back to the first step.
   To change the format: bump SAVE_VERSION and teach normalizeSave to read the old shape. */
export const SAVE_KEY = "many-and-more.save.v1";   // key kept from v1 so existing progress carries over

const SAVE_VERSION = 2;

export const freshSave = () => ({ version: SAVE_VERSION, steps: {}, reach: {}, completed: [], extra: {} });

const isObj = x => x !== null && typeof x === "object" && !Array.isArray(x);

// Every step needs a unique id within its chapter; a step's kind doubles as its id unless it sets one.
const stepIdOf = s => s.id || s.kind;

export function stepIndex(chapterId, id) {
  const steps = CHAPTER_STEPS[chapterId];
  if (!steps || typeof id !== "string") return 0;
  const i = steps.findIndex(s => stepIdOf(s) === id);
  return i < 0 ? 0 : i;
}

export function stepIdAt(chapterId, i) {
  const steps = CHAPTER_STEPS[chapterId];
  return steps && steps[i] ? stepIdOf(steps[i]) : undefined;
}

// Rebuild whatever is stored into a well-formed save. Anything malformed is dropped rather than trusted,
// so a damaged save can lose a field but can never crash the game.
function normalizeSave(raw) {
  const out = freshSave();
  if (!isObj(raw)) return out;
  const v1 = !Number.isInteger(raw.version) || raw.version < 2;   // v1 stored step positions as numbers
  const readSteps = m => {
    const r = {};
    if (!isObj(m)) return r;
    for (const [ch, val] of Object.entries(m)) {
      if (typeof val === "string") r[ch] = val;
      else if (v1 && Number.isInteger(val) && val >= 0 && CHAPTER_STEPS[ch]) {
        r[ch] = stepIdAt(ch, Math.min(val, CHAPTER_STEPS[ch].length - 1));   // v1 used 99 for "finished"
      }
    }
    return r;
  };
  out.steps = readSteps(raw.steps);
  out.reach = readSteps(raw.reach);
  if (Array.isArray(raw.completed)) out.completed = [...new Set(raw.completed.filter(x => typeof x === "string"))];
  if (isObj(raw.extra)) for (const [k, val] of Object.entries(raw.extra)) if (typeof val === "string") out.extra[k] = val;
  return out;
}

export function loadSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return normalizeSave(JSON.parse(raw)); } catch (e) {}
  return freshSave();
}

// Returns false when the browser refuses to store progress (storage blocked, full, or switched off).
export function writeSave(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
