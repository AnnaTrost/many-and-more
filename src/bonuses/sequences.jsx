// Bonus puzzle: sequences
import { useState } from "react";
import { Say } from "../shared/art";
import { BonusShell, Confetti, Formal, Hints } from "../shared/ui";

const SEQ_N = 16;

const SEQ_TARGETS = [[2, 0, 3], [0, 0, 0, 5], [3, 1, 4]];

function decodeSwitches(s) {
  const out = []; let c = 0;
  for (const b of s) { if (b) c++; else { out.push(c); c = 0; } }
  return { nums: out, open: c };
}

export function BonusSequences({ onExit, onFinish }) {
  const [s, setS] = useState(Array(SEQ_N).fill(0));
  const [t, setT] = useState(0);
  const [pick, setPick] = useState(null);
  const { nums, open } = decodeSwitches(s);
  const target = SEQ_TARGETS[t];
  const hit = target && target.every((x, i) => nums[i] === x);
  const allDone = t >= SEQ_TARGETS.length;
  return (
    <BonusShell title="Endless lists of numbers" onExit={onExit}>
      <p>Think of every infinite list of whole numbers: (3, 1, 4, 1, 5, …), (0, 0, 0, …), (7, 70, 700, …), and every other one. There are 2<sup>ℵ₀</sup> = 𝔠 switch
         patterns, and each switch only says on or off. A list of numbers can say much more. So are there more lists than switch patterns?</p>
      <Say who="Mira">Here's a code. Read the switches from the left: count the lit ones until you hit a dark one, and that's your first number. Then start counting again.
        {target ? ` Light the switches so the list starts (${target.join(", ")}).` : ""}</Say>
      <div className="switches" role="group" aria-label="Light switches">
        {s.map((b, i) => (
          <button key={i} className={"sw" + (b ? " on" : "")} disabled={allDone} aria-pressed={!!b}
                  onClick={() => setS(x => x.map((y, j) => (j === i ? 1 - y : y)))}>
            <span className="bulb" /><small>{i + 1}</small>
          </button>
        ))}
        <span className="more-dots">…</span>
      </div>
      <div className="swread"><p><b>The list reads:</b> ({nums.join(", ")}{nums.length ? ", " : ""}{open ? `still counting ${open}…` : "…"})</p></div>
      {target && (
        <div className="row">
          <span className="status" style={{ margin: 0 }}>Target {t + 1} of {SEQ_TARGETS.length}: ({target.join(", ")}, …)</span>
          <button className="btn" disabled={!hit} onClick={() => { setT(t + 1); setS(Array(SEQ_N).fill(0)); }}>{hit ? "Got it! Next" : "Not there yet"}</button>
        </div>
      )}
      {target && <Hints key={t} hints={t === 0 ? ["2 is two lit switches then a dark one: on, on, off.", "0 is just a dark switch on its own."] :
        t === 1 ? ["Three zeros in a row means three dark switches in a row."] : ["3, 1, 4: on on on off, on off, on on on on off."]} />}
      {allDone && (
        <>
          <div className="feedback good"><p>So every list of whole numbers can be written as a switch pattern, and reading it back gives the same list.</p></div>
          <Say who="Mira">But read the code the other way. Does every switch pattern turn into a list?</Say>
          <div className="choices">
            {[["tail", "No: a pattern that ends in lit switches forever never finishes its last number"],
              ["all", "Yes, every pattern works"],
              ["dark", "No: patterns with dark switches break the code"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "tail" ? " picked-wrong" : "")} disabled={pick === "tail"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick === "all" && <div className="feedback bad"><p>Try lighting every switch from some point on. What number would you be counting?</p></div>}
          {pick === "dark" && <div className="feedback bad"><p>Dark switches are how the code ends each number. They're essential.</p></div>}
          {pick !== "tail" && <Hints hints={["Look at the readout when the last few switches are lit: it says \"still counting\"."]} />}
          {pick === "tail" && (
            <>
              <Confetti />
              <div className="feedback good"><p>Right. The broken patterns are the ones that are eventually all lit, and those are only countable: each is a finite start followed by lit switches forever.
                 Remove them and adding ℵ₀ to 𝔠 changes nothing, so lists of whole numbers and switch patterns match up. All those infinite lists, every one of them: still just 𝔠.</p></div>
              <p className="new-entry">Bonus ledger entry: <b>ℵ₀<sup>ℵ₀</sup> = 𝔠</b></p>
              <Formal><p>Encode (n₁, n₂, …) ∈ ℕ<sup>ℕ</sup> as 1<sup>n₁</sup>0 1<sup>n₂</sup>0 … ∈ {"{0, 1}"}<sup>ℕ</sup>. This is a bijection onto the sequences with infinitely many 0s;
                 the complement is countable. Hence |ℕ<sup>ℕ</sup>| = 2<sup>ℵ₀</sup> = 𝔠. In particular, 10<sup>ℵ₀</sup> = 𝔠 as well, which matches infinite decimals.</p></Formal>
              <button className="btn" onClick={onFinish}>Finish bonus puzzle</button>
            </>
          )}
        </>
      )}
    </BonusShell>
  );
}
