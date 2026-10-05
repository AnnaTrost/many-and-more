// Bonus puzzle: words
import { useState } from "react";
import { Say } from "../shared/art";
import { BonusShell, Confetti, Hints } from "../shared/ui";

const WORDS_BANK = ["A", "AA", "AAA", "AAB", "AB", "ABA", "ABB", "B", "BA", "BAA", "BAB", "BB", "BBA", "BBB"]; // dictionary order, on purpose

const WORD_PICKS = 7;

export function judgeWords(picks) {
  const maxL = Math.max(...picks.map(w => w.length));
  const waiting = WORDS_BANK.filter(w => !picks.includes(w) && w.length < maxL);
  if (!waiting.length) return { ok: true };
  if (picks[0] === "A" && picks[1] === "AA" && picks[2] === "AAA") return { ok: false, kind: "dict" };
  return { ok: false, kind: "dive", longest: picks.find(w => w.length === maxL), short: waiting.sort((a, b) => a.length - b.length)[0] };
}

export function BonusWords({ onExit, onFinish, sawDiagonal }) {
  const [picks, setPicks] = useState([]);
  const done = picks.length >= WORD_PICKS;
  const v = done ? judgeWords(picks) : null;
  function pick(w) { if (!done && !picks.includes(w)) setPicks(p => [...p, w]); }
  return (
    <BonusShell title="Every finite word" onExit={onExit}>
      <p>A language uses just two letters, A and B. A word is any finite string of them: A, BAB, AABBA, and so on. There's no longest word, so there are
         infinitely many. Can they all be put in one list?</p>
      <Say who="Mira">Here are the words up to three letters, sorted like a dictionary. Longer words go on forever. Tap words to build your list,
        and I'll fast-forward your plan after {WORD_PICKS} picks.</Say>
      <div className="wordbank">
        {WORDS_BANK.map(w => (
          <button key={w} className={"word" + (picks.includes(w) ? " used" : "")} disabled={done || picks.includes(w)} onClick={() => pick(w)}>
            {w}{picks.includes(w) && <small>#{picks.indexOf(w) + 1}</small>}
          </button>
        ))}
        <span className="more-dots">… AAAA, AAAB, …</span>
      </div>
      {picks.length > 0 && (
        <div className="listline">
          {picks.map((w, i) => <span key={w}><small>{i + 1}</small>{w}</span>)}
          {v && v.kind === "dict" && <><span className="ghosted"><small>next</small>AAAA</span><span className="ghosted"><small>then</small>AAAAA</span>
            <span className="more-dots">…</span><span className="never"><small>never</small>B</span></>}
        </div>
      )}
      {!done && <Hints hints={[
        "What happens if your list starts A, AA, AAA, …?",
        "Group the words by length. How many words have one letter? Two letters? Three?",
        "Each length has only finitely many words. Could you finish one length before starting the next?",
      ]} />}
      {v && !v.ok && (
        <>
          <div className="feedback bad">
            {v.kind === "dict"
              ? <p>Dictionary order dives forever: after A comes AA, then AAA, then AAAA, …. There's always a longer all-A word next, so the list never gets to B.</p>
              : <p>You listed {v.longest} while {v.short} was still waiting. Do that again and again and some short words may never get their turn. Find an order where it's obvious when every word shows up.</p>}
          </div>
          <button className="btn secondary" onClick={() => setPicks([])}>Start the list again</button>
        </>
      )}
      {v && v.ok && (
        <>
          <Confetti />
          <div className="feedback good">
            <p>Shortest first: the 2 one-letter words, then the 4 two-letter words, then the 8 three-letter words, and so on. Each batch is finite, so every word
               shows up at some position. Finite words are countable: size ℵ₀.</p>
            <p>The same goes for any alphabet. Every book, every computer program and every sentence ever written sits somewhere on one list.
               {sawDiagonal ? " And since there are only ℵ₀ descriptions but 𝔠 real numbers, almost every real number can never be described in words at all." : ""}</p>
          </div>
          <button className="btn" onClick={onFinish}>Finish bonus puzzle</button>
        </>
      )}
    </BonusShell>
  );
}
