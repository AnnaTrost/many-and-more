// Chapter 5: Cantor's diagonal
import React, { useState, useEffect } from "react";
import { Face, Say } from "../shared/art";
import { range, useTimers } from "../shared/helpers";
import { ChapterShell, Confetti } from "../shared/ui";
import { useDrag } from "../shared/useDrag";

const PRESETS = [
  { name: "1/2", d: "5000000000" },
  { name: "1/3", d: "3333333333" },
  { name: "π − 3", d: "1415926535" },
  { name: "√2 − 1", d: "4142135623" },
  { name: "e − 2", d: "7182818284" },
  { name: "1/7", d: "1428571428" },
];

const miraDigit = d => (d === 5 ? 4 : 5);

const makeList = () => PRESETS.map((p, i) => ({ id: "r" + i, name: p.name, digits: p.d.split("").map(Number), src: "you" }));

const RECAP = [
  { id: "bus", what: "Hotel guests plus an endless bus", ex: "ℵ₀ + ℵ₀", trick: "Old guests to even rooms, the bus to odd rooms" },
  { id: "evens", what: "Even numbers", ex: "2, 4, 6, …", trick: "Pair each n with 2n" },
  { id: "squares", what: "Perfect squares", ex: "1, 4, 9, 16, …", trick: "Pair each n with n²" },
  { id: "ints", what: "All the integers", ex: "…, −2, −1, 0, 1, 2, …", trick: "Zigzag: 0, 1, −1, 2, −2, …" },
  { id: "fracs", what: "Fractions", ex: "1/2, 3/4, 7/9, …", trick: "Walk the grid one diagonal at a time" },
];

const RECAP_TRICK_ORDER = ["ints", "fracs", "evens", "bus", "squares"];

const HUNCHES = [
  { id: "one", label: "There's only one size of infinity" },
  { id: "bigger", label: "Somewhere there must be a bigger one" },
  { id: "unsure", label: "I honestly can't tell" },
];

function Recap({ onNext, hunch, setHunch }) {
  const [sel, setSel] = useState(null);
  const [matched, setMatched] = useState([]);
  const [miss, setMiss] = useState(null);
  const all = matched.length === RECAP.length;
  function pickTrick(id) {
    if (!sel || matched.includes(id)) return;
    if (id === sel) { setMatched(m => [...m, id]); setSel(null); setMiss(null); }
    else setMiss(id);
  }
  return (
    <>
      <h2>Looking back</h2>
      <p>Look back at everything you've listed so far. Match each collection with the trick that lined it up against 1, 2, 3, …:
         tap a collection, then its trick. (Yes, that's a bijection too.)</p>
      <div className="recap">
        <div className="recap-col">
          {RECAP.map(r => {
            const done = matched.includes(r.id);
            return (
              <button key={r.id} className={"recap-card" + (sel === r.id ? " sel" : "") + (done ? " done" : "")}
                      disabled={done} onClick={() => { setSel(r.id); setMiss(null); }}>
                <b>{r.what}</b><small>{r.ex}</small>
                {done && <span className="aleph">ℵ₀</span>}
              </button>
            );
          })}
        </div>
        <div className="recap-col">
          {RECAP_TRICK_ORDER.map(id => {
            const r = RECAP.find(x => x.id === id), done = matched.includes(id);
            return (
              <button key={id} className={"recap-card trick" + (done ? " done" : "") + (miss === id ? " picked-wrong" : "")}
                      disabled={done || !sel} onClick={() => pickTrick(id)}>
                {r.trick}
              </button>
            );
          })}
        </div>
      </div>
      {!all && <p className="status">{sel ? "Now tap the trick that listed it." : "Tap a collection on the left."}{miss ? " Not that one: think back to how it was lined up." : ""}</p>}
      {all && (
        <>
          <div className="feedback good">
            <p>Five collections that look completely different: some sparse, some running both ways, some packed into every gap. Every one of them
               turned out to be exactly ℵ₀. Each time, a clever enough list caught everything.</p>
          </div>
          <Say who="Mira">So, what's your hunch? Can every infinite collection be listed with a clever enough trick?</Say>
          <div className="choices">
            {HUNCHES.map(h => (
              <button key={h.id} className={"btn secondary" + (hunch === h.id ? " chosen" : "")} onClick={() => setHunch(h.id)}>{h.label}</button>
            ))}
          </div>
          {hunch && (
            <>
              <p className="status">Noted. We'll come back to your hunch at the end.</p>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

function DiagIntro({ onNext }) {
  return (
    <>
      <h2>Numbers that never settle</h2>
      <p>Every fraction, written as a decimal, eventually repeats: 1/7 = 0.142857 142857 142857…. But some numbers never fall into a pattern.
         √2 = 1.41421356… and π = 3.14159265… go on forever with no repeating block. Fractions and these never-settling decimals together make
         up the real numbers: every point on the number line.</p>
      <p>Let's keep things small and look only at the numbers between 0 and 1. Each one is "0." followed by infinitely many digits.</p>
      <div className="decimals">
        {PRESETS.slice(2, 5).map(p => <span key={p.name}><small>{p.name}</small>0.{p.d}…</span>)}
      </div>
      <Say who="Mira">Here's a bet. Give me a list of numbers between 0 and 1, one per room. Make it as long as you like, infinitely long even.
        I'll name a number between 0 and 1 that isn't anywhere on it.</Say>
      <button className="btn" onClick={onNext}>Accept the bet</button>
    </>
  );
}

function DiagonalGame({ onNext }) {
  const later = useTimers();
  const [rows, setRows] = useState(makeList);
  const [phase, setPhase] = useState("edit");   // edit, diag, catch, patch, won
  const [k, setK] = useState(0);                // how many diagonal digits Mira has read
  const [checked, setChecked] = useState({});
  const [round, setRound] = useState(1);
  const n = rows.length;
  const mira = range(n).map(i => miraDigit(rows[i].digits[i]));
  const miraFull = [...mira, ...Array(10 - n).fill(5)];

  // Mira reads the diagonal one digit at a time.
  useEffect(() => {
    if (phase !== "diag") return;
    if (k >= n) { later(() => setPhase("catch"), 400); return; }
    const t = setTimeout(() => setK(x => x + 1), 650);
    return () => clearTimeout(t);
  }, [phase, k, n]);

  function bump(r, c) {
    if (phase !== "edit") return;
    setRows(rs => rs.map((row, i) => i !== r ? row : { ...row, name: null, digits: row.digits.map((d, j) => (j === c ? (d + 1) % 10 : d)) }));
  }
  function shuffle() {
    setRows(rs => rs.map(row => ({ ...row, name: null, digits: range(10).map(() => Math.floor(Math.random() * 10)) })));
  }
  function lockIn() { setK(0); setChecked({}); setPhase("diag"); }
  function check(i) { if (phase === "catch") setChecked(c => ({ ...c, [i]: true })); }
  function checkAll() { setChecked(Object.fromEntries(range(n).map(i => [i, true]))); }
  const allChecked = phase === "catch" && range(n).every(i => checked[i]);

  function insertAt(slot) {
    const row = { id: "m" + round, name: `Mira's number, round ${round}`, digits: miraFull, src: "mira" };
    setRows(rs => [...rs.slice(0, slot), row, ...rs.slice(slot)]);
    setRound(r => r + 1);
    setK(0); setChecked({}); setPhase("diag");
  }

  // Drag Mira's number into a gap in the list.
  const { drag, over, down } = useDrag((_, slot) => { if (slot !== null) insertAt(Number(slot)); }, "data-slot");
  const overSlot = over === null ? null : Number(over);

  const showMira = phase !== "edit";
  const slot = i => phase === "patch"
    ? <div key={"slot" + i} className={"slot" + (drag ? " open" : "") + (overSlot === i ? " over" : "")} data-slot={i}>
        <button className="slot-btn" onClick={() => insertAt(i)} aria-label={`Put Mira's number in room ${i + 1}`}>put it here</button>
      </div>
    : null;

  return (
    <>
      <h2>{round === 1 ? "Your list against Mira" : "Patch the list"}</h2>
      {phase === "edit" && (
        <p>Here's a starting list, one number per room. Tap any digit to change it, or shuffle everything. Every row keeps going forever past the digits shown.
           When you're happy, lock it in.</p>
      )}
      <div className="dlist" style={{ "--cols": n }}>
        {rows.map((row, i) => (
          <React.Fragment key={row.id}>
            {i === 0 && slot(0)}
            <div className={"drow" + (row.src === "mira" ? " mira" : "") + (checked[i] ? " checked" : "") + (phase === "catch" ? " huntable" : "")}
                 onClick={() => check(i)} role={phase === "catch" ? "button" : undefined} tabIndex={phase === "catch" ? 0 : undefined}
                 onKeyDown={e => { if (phase === "catch" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); check(i); } }}
                 aria-label={phase === "catch" ? `Check room ${i + 1}` : undefined}>
              <span className="droom">room {i + 1}</span>
              <span className="dnum">
                <span className="d0">0.</span>
                {range(n).map(j => {
                  const onDiag = i === j && showMira && j < k;
                  const miss = checked[i] && j === i;
                  const cls = "dig" + (onDiag ? " diag" : "") + (miss ? " miss" : "");
                  return phase === "edit"
                    ? <button key={j} className={cls} onClick={() => bump(i, j)} aria-label={`Room ${i + 1}, digit ${j + 1}: ${row.digits[j]}. Tap to change`}>{row.digits[j]}</button>
                    : <span key={j} className={cls}>{row.digits[j]}</span>;
                })}
                <span className="d0 fade">…</span>
              </span>
              <span className="dname">{checked[i] ? `differs at digit ${i + 1}` : row.name || (row.src === "you" ? "your number" : "")}</span>
            </div>
            {slot(i + 1)}
          </React.Fragment>
        ))}
        <div className="drow more"><span className="droom">rooms {n + 1}, {n + 2}, …</span><span className="dnum fade">and so on, forever</span></div>
      </div>

      {showMira && (
        <div className={"miracard" + (phase === "patch" ? " grab" : "") + (drag ? " lifted" : "")}
             onPointerDown={phase === "patch" ? down : undefined} style={{ touchAction: phase === "patch" ? "none" : undefined }}>
          <Face who="Mira" />
          <div>
            <span className="droom">Mira's number</span>
            <span className="dnum">
              <span className="d0">0.</span>
              {range(n).map(j => <span key={j} className={"dig mira" + (j < k ? " shown" : "")}>{j < k ? mira[j] : "?"}</span>)}
              <span className="d0 fade">{k >= n ? "5555…" : "…"}</span>
            </span>
          </div>
        </div>
      )}
      {drag && <div className="ghost card-ghost" style={{ left: drag.x, top: drag.y }}>0.{mira.join("")}…</div>}

      {phase === "edit" && (
        <div className="row">
          <button className="btn" onClick={lockIn}>Lock in my list</button>
          <button className="btn secondary" onClick={shuffle}>Shuffle digits</button>
        </div>
      )}
      {phase === "diag" && (
        <Say who="Mira">{k === 0 ? "Watch the diagonal: digit 1 of room 1, digit 2 of room 2, and so on."
          : k < n ? `Room ${k} has a ${rows[k - 1].digits[k - 1]} in position ${k}, so I'll write a ${mira[k - 1]} there. Mine differs from room ${k}.`
          : "Done. And I'd keep going forever, one room at a time."}</Say>
      )}
      {phase === "catch" && !allChecked && (
        <>
          <Say who="Mira">My rule: if a room's diagonal digit is 5, I write 4; otherwise I write 5. Now find my number on your list. Tap any room to compare.</Say>
          <button className="linkish" onClick={checkAll}>Check every room</button>
        </>
      )}
      {allChecked && round < 3 && (
        <>
          <div className="feedback bad">
            <p>Mira's number differs from room 1 in digit 1, from room 2 in digit 2, from every room n in digit n.
               {round > 1 ? " Even the number you just added fails: Mira changed its digit too." : ""} It isn't anywhere on your list.</p>
          </div>
          <Say who="Mira">{round === 1 ? "Go on, add my number to your list. Drag it into any gap, and everyone below shifts down a room, Hilbert style."
            : "Try again. Put it anywhere you like."}</Say>
          <button className="btn" onClick={() => setPhase("patch")}>Patch my list</button>
        </>
      )}
      {phase === "patch" && <p className="status">Drag Mira's card into a gap in the list, or tap a "put it here" spot.</p>}
      {allChecked && round >= 3 && (
        <>
          <Confetti />
          <div className="feedback good">
            <p>Mira wins again, and she always will. Patch the list a million times and her diagonal recipe hands back a number that's still missing.
               No list, however clever, can contain every number between 0 and 1.</p>
          </div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

const HUNCH_REPLY = {
  one: "Before the diagonal, you guessed there's only one size of infinity. That was a perfectly reasonable bet: every example so far pointed that way. Mira's list-breaking trick says otherwise.",
  bigger: "Before the diagonal, your hunch was that a bigger infinity must exist somewhere. You were right, and now you've seen the proof.",
  unsure: "Before the diagonal, you couldn't tell whether every infinity was the same size. Now you know: they aren't.",
};

function DiagReveal({ onFinish, hunch }) {
  const [picked, setPicked] = useState(null);
  return (
    <>
      <h2>A bigger infinity</h2>
      {hunch && HUNCH_REPLY[hunch] && <Say who="Mira">{HUNCH_REPLY[hunch]}</Say>}
      <p>Georg Cantor found this argument in 1891. It shows the real numbers can't be listed: they are <b>uncountable</b>. There is no bijection between
         them and 1, 2, 3, …. Any matching leaves real numbers over, the way extra lids were left in Ura's basket.</p>
      <div className="defn">
        <h3>𝔠, the continuum</h3>
        <p style={{ marginBottom: 0 }}>The size of the real numbers is called the continuum, written 𝔠. It is strictly bigger than ℵ₀. The counting numbers,
           the fractions and every collection you listed earlier all fit inside it with room to spare.</p>
      </div>
      <ul className="scoreboard">
        {[["Counting numbers, evens, squares", "ℵ₀"], ["Integers", "ℵ₀"], ["Fractions", "ℵ₀"], ["Real numbers", "𝔠, bigger"]].map(([a, b]) => (
          <li key={a}><b>{a}</b><b className="aleph">{b}</b></li>
        ))}
      </ul>

      <h3>One last check</h3>
      <Say who="Mira">Someone tries my trick on your list of fractions from chapter 4. Why doesn't it prove fractions are uncountable too?</Say>
      <div className="choices">
        {[["notfrac", "Mira's new number usually isn't a fraction, so a list of fractions is allowed to miss it"],
          ["works", "It does prove that, chapter 4 was wrong"],
          ["short", "Fraction decimals are too short for the diagonal"]].map(([id, label]) => (
          <button key={id} className={"btn secondary" + (picked && picked !== "notfrac" && picked === id ? " picked-wrong" : "")}
                  disabled={picked === "notfrac"} onClick={() => setPicked(id)}>{label}</button>
        ))}
      </div>
      {picked === "works" && <div className="feedback bad"><p>Chapter 4's diagonal walk really does reach every fraction. So the trick must be producing something that doesn't count as missing. What kind of number does it build?</p></div>}
      {picked === "short" && <div className="feedback bad"><p>Every fraction has an endless decimal: 1/2 = 0.5000…, with zeros forever. The diagonal always has digits to read.</p></div>}
      {picked === "notfrac" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Exactly. The diagonal number never settles into a repeating pattern, so it isn't a fraction, and a list of fractions never claimed to include it.
             For the real numbers there's no such escape: the diagonal number is always a real number, so a list of reals really is missing something.</p></div>
          <h3>You've proved what we promised</h3>
          <ul className="claims done">
            <li style={{ "--c": "var(--coral)" }}>A hotel with every room full can still fit in a new guest.</li>
            <li style={{ "--c": "var(--teal)" }}>There are exactly as many even numbers as there are whole numbers.</li>
            <li style={{ "--c": "var(--violet)" }}>Some infinities are so big they can't be listed at all.</li>
          </ul>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export const CH5_STEPS = [{ kind: "recap" }, { kind: "intro" }, { kind: "game" }, { kind: "reveal" }];

export function ChapterFive({ step, setStep, onExit, onFinish, extra, setExtra, reach }) {
  step = Math.min(step, CH5_STEPS.length - 1);
  const s = CH5_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH5_STEPS.length - 1));
  return (
    <ChapterShell steps={CH5_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "recap" && <Recap onNext={next} hunch={extra.hunch} setHunch={h => setExtra("hunch", h)} />}
      {s.kind === "intro" && <DiagIntro onNext={next} />}
      {s.kind === "game" && <DiagonalGame key="game" onNext={next} />}
      {s.kind === "reveal" && <DiagReveal onFinish={onFinish} hunch={extra.hunch} />}
    </ChapterShell>
  );
}
