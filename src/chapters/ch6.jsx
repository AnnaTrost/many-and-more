// Chapter 6: Infinite arithmetic
import React, { useState, useRef } from "react";
import { Say } from "../shared/art";
import { range, useTimers } from "../shared/helpers";
import { ChapterShell, Confetti, Formal, Hints } from "../shared/ui";
import { useDrag } from "../shared/useDrag";

const sup = (b, e) => <>{b}<sup>{e}</sup></>;

const LEDGER = [
  { eq: <>ℵ₀ + 1 = ℵ₀</>, from: "One more guest at the hotel" },
  { eq: <>ℵ₀ + ℵ₀ = ℵ₀</>, from: "The infinitely long bus" },
  { eq: <>ℵ₀ × ℵ₀ = ℵ₀</>, from: "The fraction grid: rows times columns" },
  { eq: <>𝔠 + ℵ₀ = 𝔠</>, from: "A hotel hidden in the number line" },
  { eq: <>𝔠 × 𝔠 = 𝔠</>, from: "Zipping two decimals into one" },
  { eq: <>{sup(2, "ℵ₀")} = 𝔠</>, from: "Infinitely many light switches" },
  { eq: <>{sup(2, "𝔠")} &gt; 𝔠</>, from: "The rebel club" },
];

function Ledger({ n }) {
  return (
    <div className="ledger" aria-label="Infinite arithmetic proved so far">
      {LEDGER.map((l, i) => (
        <div key={i} className={"lrow" + (i < n ? "" : " pending")}>
          <b>{i < n ? l.eq : "?"}</b><small>{i < n ? l.from : "still to prove"}</small>
        </div>
      ))}
    </div>
  );
}

function NewEntry({ i }) {
  return <p className="new-entry">New entry in the ledger: <b>{LEDGER[i].eq}</b></p>;
}

function ArithIntro({ onNext }) {
  return (
    <>
      <h2>Arithmetic with infinities</h2>
      <p>You've been doing sums with infinity for a while without calling it that. Every time two collections were matched up, you proved an equation
         about their sizes. Here's the ledger so far, with four entries still to fill in.</p>
      <Ledger n={3} />
      <p>The new entries involve 𝔠, the size of the real numbers. Some of them are even stranger than the hotel.</p>
      <button className="btn" onClick={onNext}>Start with 𝔠 + ℵ₀</button>
    </>
  );
}

function LineHotel({ onNext }) {
  const later = useTimers();
  const [moved, setMoved] = useState(false);
  const [starsIn, setStarsIn] = useState(false);
  const [ask, setAsk] = useState(false);
  const [pick, setPick] = useState(null);
  const X = v => 20 + 600 * v;
  const hotel = range(10).map(i => i + 1);
  const stars = range(5).map(i => i + 1);
  function go() {
    setMoved(true);
    later(() => setStarsIn(true), 1100);
    later(() => setAsk(true), 2100);
  }
  return (
    <>
      <h2>A hotel hidden in the number line</h2>
      <Ledger n={3} />
      <p>Take the line from 0 to 1, with 1 included. It holds 𝔠 points. Now some visitors arrive: countably many extra points ★1, ★2, ★3, …
         that need a place on the line without pushing anyone off it. Does the line get any bigger?</p>
      <div className="figure">
        <svg viewBox="0 0 640 130" width="100%" role="img" aria-label="Number line from 0 to 1 with points 1, 1/2, 1/3 and so on marked">
          <line x1="20" y1="80" x2="620" y2="80" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
          <text x="20" y="112" textAnchor="middle" fontSize="15" fill="var(--muted)" fontWeight="700">0</text>
          {[[1, "1"], [2, "1/2"], [3, "1/3"], [4, "1/4"], [5, "1/5"]].map(([n, l]) => (
            <text key={n} x={X(1 / n)} y="112" textAnchor="middle" fontSize="14" fill="var(--muted)" fontWeight="700">{l}</text>
          ))}
          {hotel.map(n => (
            <g key={"h" + n} className="lpt" style={{ transform: `translate(${X(moved ? 1 / (2 * n) : 1 / n)}px, 80px)`, transitionDelay: n * 40 + "ms" }}>
              <circle r={n < 5 ? 8 : 5.5} fill="var(--teal)" stroke="var(--card)" strokeWidth="2" />
            </g>
          ))}
          {stars.map(k => (
            <g key={"s" + k} className="lpt" style={{ transform: starsIn ? `translate(${X(1 / (2 * k - 1))}px, 80px)` : `translate(${380 + k * 44}px, 26px)`, transitionDelay: k * 70 + "ms" }}>
              <circle r={k < 3 ? 9 : 6.5} fill="var(--coral)" stroke="var(--card)" strokeWidth="2" />
              {!starsIn && <text y="5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">★{k}</text>}
            </g>
          ))}
          {!starsIn && <text x="625" y="31" fontSize="16" fill="var(--muted)">…</text>}
        </svg>
        <p className="grid-note">Teal: the points 1, 1/2, 1/3, 1/4, … (only the first few are drawn). Coral: the visitors. Every other point of the line is there too, just not drawn.</p>
      </div>
      {!moved && (
        <>
          <Say who="Mira">The points 1, 1/2, 1/3, 1/4, … form a hotel hiding inside the line. Same trick as the endless bus: each hotel point moves to half its value.
            1 goes to 1/2, 1/2 goes to 1/4, 1/3 goes to 1/6, and so on. Watch which spots come free.</Say>
          <button className="btn" onClick={go}>Make the move</button>
        </>
      )}
      {ask && (
        <>
          <Say who="Mira">The hotel points now sit at 1/2, 1/4, 1/6, …, and the visitors took 1, 1/3, 1/5, …. So which points of the line had to move?</Say>
          <div className="choices">
            {[["all", "Every point on the line"], ["hotel", "Only the hotel points 1, 1/2, 1/3, …"], ["none", "None of them"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "hotel" ? " picked-wrong" : "")}
                      disabled={pick === "hotel"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick === "all" && <div className="feedback bad"><p>Look at a point like 0.7, or π − 3. Did anything happen to it?</p></div>}
          {pick === "none" && <div className="feedback bad"><p>Something must have moved, or the visitors would have landed on top of someone.</p></div>}
          {pick !== "hotel" && <Hints hints={["Watch the teal dots and the coral dots. Did anything else on the line change?"]} />}
          {pick === "hotel" && (
            <>
              <Confetti />
              <div className="feedback good"><p>Right. Only countably many points shuffled along. Every other real number stayed exactly where it was, and the visitors
                 squeezed in. Adding ℵ₀ points to the line doesn't make it any bigger.</p></div>
              <NewEntry i={3} />
              <Formal>
                <p>Let A = {"{a₁, a₂, …}"} be countable and disjoint from (0, 1]. Define f on (0, 1] ∪ A by f(1/n) = 1/(2n), f(aₖ) = 1/(2k − 1), and f(x) = x for every
                   other x. Then f is a bijection onto (0, 1], so |(0, 1] ∪ A| = |(0, 1]|, i.e. 𝔠 + ℵ₀ = 𝔠. The same trick shows that adding or removing endpoints
                   never changes the size of an interval.</p>
              </Formal>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

const ZX = [3, 1, 4, 1, 5, 9], ZY = [2, 7, 1, 8, 2, 8];

const zip = (x, y) => x.flatMap((d, i) => [d, y[i]]);

const digitsOf = (v, n) => { const out = []; let t = v; for (let i = 0; i < n; i++) { t *= 10; const d = Math.min(9, Math.floor(t + 1e-9)); out.push(d); t -= d; } return out; };

function SquareToy() {
  const [pt, setPt] = useState({ x: 0.3141, y: 0.2718 });
  const ref = useRef(null), dragging = useRef(false);
  function setFrom(e) {
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(0.9999, Math.max(0.0001, (e.clientX - r.left) / r.width));
    const y = Math.min(0.9999, Math.max(0.0001, 1 - (e.clientY - r.top) / r.height));
    setPt({ x, y });
  }
  const dx = digitsOf(pt.x, 4), dy = digitsOf(pt.y, 4), z = zip(dx, dy);
  const zv = z.reduce((a, d, i) => a + d * Math.pow(10, -(i + 1)), 0);
  return (
    <div className="toy">
      <div className="square" ref={ref}
           onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFrom(e); }}
           onPointerMove={e => dragging.current && setFrom(e)}
           onPointerUp={() => { dragging.current = false; }}
           role="img" aria-label="Unit square: drag the point">
        <span className="sqdot" style={{ left: pt.x * 100 + "%", top: (1 - pt.y) * 100 + "%" }} />
        <span className="sqlabel">drag me</span>
      </div>
      <div className="toyread">
        <p><span className="zx">x = 0.{dx.join("")}…</span><br /><span className="zy">y = 0.{dy.join("")}…</span></p>
        <p className="zipped">zipped: 0.{z.map((d, i) => <span key={i} className={i % 2 ? "zy" : "zx"}>{d}</span>)}…</p>
        <div className="minline"><span style={{ left: zv * 100 + "%" }} /></div>
        <p className="grid-note">One point in the square, one point on the line. Move it anywhere: every spot in the square gets its own spot on the line.</p>
      </div>
    </div>
  );
}

function Zipper({ onNext }) {
  const [placed, setPlaced] = useState([]);   // list of {row, i}
  const [msg, setMsg] = useState({ text: "", warn: false });
  const [pick, setPick] = useState(null);
  const done = placed.length === 12;
  const used = (row, i) => placed.some(p => p.row === row && p.i === i);
  function place(tile) {
    if (done || used(tile.row, tile.i)) return;
    const k = placed.length, wantRow = k % 2 ? "y" : "x", wantI = Math.floor(k / 2);
    if (tile.row !== wantRow) { setMsg({ text: `A zipper alternates. Digit ${k + 1} of the zipped number comes from ${wantRow}.`, warn: true }); return; }
    if (tile.i !== wantI) { setMsg({ text: `Keep ${wantRow}'s digits in order: next up is its digit ${wantI + 1}.`, warn: true }); return; }
    setPlaced(p => [...p, tile]); setMsg({ text: "", warn: false });
  }
  const { drag, over, down, suppress } = useDrag((t, strip) => { if (strip !== null) place(t); }, "data-zip");
  const Tile = ({ row, i }) => {
    const d = row === "x" ? ZX[i] : ZY[i], u = used(row, i);
    return (
      <button className={"ztile " + row + (u ? " used" : "")} disabled={u || done}
              onPointerDown={e => down(e, { row, i })} onClick={() => { if (!suppress.current) place({ row, i }); }}
              aria-label={`Digit ${i + 1} of ${row}: ${d}`}>{d}</button>
    );
  };
  return (
    <>
      <h2>A square is no bigger than a line</h2>
      <Ledger n={4} />
      <p>A point in a square needs two numbers: how far across (x) and how far up (y). Surely the square, with its whole extra dimension, has more points than a line?
         Cantor found a way to pack any two numbers into one, so that you can always unpack them again.</p>
      <Say who="Mira">Zip x and y together like the teeth of a zipper: one digit from x, then one from y, then the next from x… Drag the digits onto the zipped number, or tap them.</Say>
      <div className="zrows">
        <div className="zrow"><span className="zlab zx">x = 0.</span>{ZX.map((_, i) => <Tile key={i} row="x" i={i} />)}<span className="fade">…</span></div>
        <div className="zrow"><span className="zlab zy">y = 0.</span>{ZY.map((_, i) => <Tile key={i} row="y" i={i} />)}<span className="fade">…</span></div>
      </div>
      <div className={"zstrip" + (over !== null ? " hot" : "")} data-zip="1">
        <span className="zlab">zipped = 0.</span>
        {range(12).map(k => {
          const p = placed[k];
          return <span key={k} className={"zslot" + (p ? " " + p.row : "") + (k === placed.length ? " next" : "")}>{p ? (p.row === "x" ? ZX[p.i] : ZY[p.i]) : ""}</span>;
        })}
        <span className="fade">…</span>
      </div>
      {drag && <div className={"ghost ztile " + drag.item.row} style={{ left: drag.x, top: drag.y, transform: "translate(-50%,-50%)" }}>{drag.item.row === "x" ? ZX[drag.item.i] : ZY[drag.item.i]}</div>}
      <p className={"status" + (msg.warn ? " warn" : "")} aria-live="polite">{msg.text}</p>
      {!done && <Hints hints={["The first digit of the zipped number is the first digit of x.", "Pattern: x, y, x, y, … each in order: 3, 2, 1, 7, …"]} />}
      {done && (
        <>
          <div className="feedback good"><p>0.{zip(ZX, ZY).join("")}… holds both numbers: the odd-position digits spell x, the even ones spell y.
             Every point in the square becomes one point on the line. Try it with any point:</p></div>
          <SquareToy />
          <Say who="Mira">Now go backwards. Which point of the square zips to 0.513972…?</Say>
          <div className="choices">
            {[["a", "(0.513…, 0.972…)"], ["b", "(0.537…, 0.192…)"], ["c", "(0.192…, 0.537…)"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "b" ? " picked-wrong" : "")}
                      disabled={pick === "b"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick === "a" && <div className="feedback bad"><p>That splits the number down the middle. Unzipping takes every other digit.</p></div>}
          {pick === "c" && <div className="feedback bad"><p>Close, but swapped. The first digit belongs to x.</p></div>}
          {pick === "b" && (
            <>
              <Confetti />
              <div className="feedback good"><p>Odd positions 5, 3, 7 give x; even positions 1, 9, 2 give y. Zip and unzip undo each other, so the square and the line
                 match up point for point. Cantor wrote to a friend about this result: "I see it, but I don't believe it."</p></div>
              <NewEntry i={4} />
              <Formal>
                <p>Write each x ∈ (0, 1) by its decimal expansion that does not end in repeating 9s. Interleaving the digits of x and y gives an injection
                   (0, 1)² → (0, 1). It isn't onto: 0.191919… would unzip to y = 0.999… = 1. But x ↦ (x, ½) is an injection the other way, and by the
                   Cantor–Schröder–Bernstein theorem, injections in both directions guarantee a bijection. So 𝔠 × 𝔠 = 𝔠, and by repeating the trick,
                   space of any finite dimension has exactly as many points as a line.</p>
              </Formal>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

const SWITCH_N = 12;

const SWITCH_TARGETS = [
  { v: 0.5, label: "1/2" },
  { v: 0.75, label: "3/4" },
  { v: 1 / 3, label: "1/3" },
];

function Switches({ onNext }) {
  const [s, setS] = useState(Array(SWITCH_N).fill(0));
  const [t, setT] = useState(0);
  const [pick, setPick] = useState(null);
  const v = s.reduce((a, b, i) => a + b * Math.pow(2, -(i + 1)), 0);
  const allDone = t >= SWITCH_TARGETS.length;
  const target = SWITCH_TARGETS[t];
  const hit = target && Math.abs(v - target.v) < 0.0002;
  const onSet = s.map((b, i) => (b ? i + 1 : null)).filter(Boolean);
  return (
    <>
      <h2>Infinitely many light switches</h2>
      <Ledger n={5} />
      <p>Three light switches can be set in 2 × 2 × 2 = 2³ = 8 ways. Twelve switches give 2¹² = 4,096 patterns. Now imagine a row of switches 1, 2, 3, … going on forever.
         The number of patterns is written 2<sup>ℵ₀</sup>. How big is that?</p>
      <div className="switches" role="group" aria-label="Light switches">
        {s.map((b, i) => (
          <button key={i} className={"sw" + (b ? " on" : "")} disabled={allDone} aria-pressed={!!b}
                  onClick={() => setS(x => x.map((y, j) => (j === i ? 1 - y : y)))}>
            <span className="bulb" /><small>{i + 1}</small>
          </button>
        ))}
        <span className="more-dots">…</span>
      </div>
      <div className="swread">
        <p><b>Switches on:</b> {onSet.length ? "{" + onSet.join(", ") + (onSet.length ? ", …}" : "}") : "none"}</p>
        <p><b>As a binary number:</b> 0.{s.join("")}… = {v.toFixed(5)}</p>
        <div className="minline big">
          <span style={{ left: v * 100 + "%" }} />
          {target && <i style={{ left: target.v * 100 + "%" }} title={"target " + target.label} />}
        </div>
      </div>
      <Say who="Mira">Each switch pattern is also a number. Switch 1 is worth 1/2, switch 2 is worth 1/4, switch 3 is worth 1/8, and so on.
        {target ? ` Set the switches to hit ${target.label}, marked on the line.` : ""}</Say>
      {target && (
        <div className="row">
          <span className={"status" + (hit ? "" : "")} style={{ margin: 0 }}>Target {t + 1} of {SWITCH_TARGETS.length}: {target.label}</span>
          <button className="btn" disabled={!hit} onClick={() => setT(t + 1)}>{hit ? "Got it! Next" : "Not there yet"}</button>
        </div>
      )}
      {target && <Hints key={t} hints={t === 0 ? ["Switch 1 alone is worth exactly 1/2."] : t === 1 ? ["3/4 = 1/2 + 1/4."] :
        ["1/3 is a bit more than 1/4. What's left after 1/4? It's 1/12, a bit more than 1/16…", "1/3 = 1/4 + 1/16 + 1/64 + …: every other switch, starting at switch 2."]} />}
      {allDone && (
        <>
          <div className="feedback good"><p>Every pattern of switches is a number between 0 and 1 written in binary, and every number between 0 and 1 has a binary expansion.
             A pattern is also a subset of the counting numbers: just list which switches are on. So patterns, subsets of 1, 2, 3, …, and real numbers all match up.</p></div>
          <Say who="Mira">One snag: 0.1000… and 0.0111… in binary are both 1/2, so a few numbers get two patterns. Does that break the match?</Say>
          <div className="choices">
            {[["breaks", "Yes, so patterns must be bigger than 𝔠"], ["fine", "No: those duplicates are only countable, and adding ℵ₀ to 𝔠 changes nothing"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "fine" ? " picked-wrong" : "")}
                      disabled={pick === "fine"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick === "breaks" && <div className="feedback bad"><p>Doubles only happen for fractions with a power of 2 on the bottom, like 1/2 or 3/8. How many of those are there? Check the ledger.</p></div>}
          {pick === "fine" && (
            <>
              <Confetti />
              <div className="feedback good"><p>Exactly, and it's the entry you proved two steps ago. The awkward duplicates are countable, so they vanish into 𝔠.</p></div>
              <NewEntry i={5} />
              <Formal>
                <p>The map {"(s₁, s₂, …) ↦ Σ sᵢ 2⁻ⁱ"} sends {"{0, 1}"}<sup>ℕ</sup> onto [0, 1], and is one-to-one except on the countably many dyadic rationals, each of which has two
                   preimages. Removing one preimage of each, and using 𝔠 + ℵ₀ = 𝔠, gives |{"{0, 1}"}<sup>ℕ</sup>| = 𝔠. Since subsets of ℕ correspond exactly to their indicator sequences,
                   |𝒫(ℕ)| = 2<sup>ℵ₀</sup> = 𝔠.</p>
              </Formal>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

const PEOPLE = ["Ana", "Ben", "Cy", "Di", "Eve"];

const CLUBS0 = { Ana: ["Ana", "Ben"], Ben: ["Cy"], Cy: ["Ana", "Cy", "Di"], Di: [], Eve: ["Ben", "Di", "Eve"] };

const rebelOf = clubs => PEOPLE.filter(p => !clubs[p].includes(p));

const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

function RebelClub({ onNext }) {
  const [clubs, setClubs] = useState(CLUBS0);
  const [mine, setMine] = useState([]);
  const [phase, setPhase] = useState("build");   // build, rig, done
  const [err, setErr] = useState(null);
  const [toggles, setToggles] = useState(0);
  const [pick, setPick] = useState(null);
  const rebel = rebelOf(clubs);
  const show = s => (s.length ? "{" + s.join(", ") + "}" : "nobody");

  function check() {
    const truth = rebelOf(clubs);
    const wrong = PEOPLE.find(p => truth.includes(p) !== mine.includes(p));
    if (!wrong) { setErr(null); setPhase("rig"); return; }
    setErr(clubs[wrong].includes(wrong)
      ? `${wrong} is in ${wrong}'s own club, so ${wrong} doesn't qualify for the rebel club.`
      : `${wrong} isn't in ${wrong}'s own club, so ${wrong} belongs in the rebel club.`);
  }
  function toggle(owner, member) {
    if (phase !== "rig") return;
    setClubs(c => ({ ...c, [owner]: c[owner].includes(member) ? c[owner].filter(x => x !== member) : [...c[owner], member] }));
    setToggles(n => n + 1);
  }

  return (
    <>
      <h2>The rebel club</h2>
      <Ledger n={6} />
      <p>A town has five people. Any group of them, even nobody or everybody, can form a club, so there are 2⁵ = 32 possible clubs. Mira tries to name a club after
         each person. Here's her attempt: each row is the club named after that person.</p>
      <div className="clubgrid" style={{ "--n": PEOPLE.length }}>
        <span className="corner">club named after ↓ / member →</span>
        {PEOPLE.map(p => <span key={p} className="ghead">{p}</span>)}
        {PEOPLE.map(owner => (
          <React.Fragment key={owner}>
            <span className="ghead left">{owner}'s club</span>
            {PEOPLE.map(m => {
              const inIt = clubs[owner].includes(m);
              return (
                <button key={m} className={"cg" + (inIt ? " in" : "") + (owner === m ? " self" : "") + (owner === m && phase !== "build" ? " lit" : "")}
                        disabled={phase !== "rig"} onClick={() => toggle(owner, m)}
                        aria-label={`${m} ${inIt ? "is" : "is not"} in ${owner}'s club`}>{inIt ? "✓" : ""}</button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {phase === "build" && (
        <>
          <Say who="Mira">Here's a club I might have missed: the rebel club. Its members are everyone who isn't in the club named after them. Tap the people who qualify.</Say>
          <div className="choices">
            {PEOPLE.map(p => (
              <button key={p} className={"btn secondary" + (mine.includes(p) ? " chosen" : "")}
                      onClick={() => setMine(m => (m.includes(p) ? m.filter(x => x !== p) : [...m, p]))}>{p}</button>
            ))}
          </div>
          <div className="row"><button className="btn" onClick={check}>That's the rebel club</button><span className="status" style={{ margin: 0 }}>Rebel club: {show(mine)}</span></div>
          {err && <div className="feedback bad"><p>{err}</p></div>}
          <Hints hints={["Only the highlighted squares on the diagonal matter: is each person in their own club?", "Ana's club includes Ana, so Ana is out. Ben's club is just Cy, so Ben is in."]} />
        </>
      )}

      {phase !== "build" && (
        <>
          <div className="rebel">
            <b>Rebel club: {show(rebel)}</b>
            <ul>
              {PEOPLE.map(p => (
                <li key={p}>Not {p}'s club: they disagree about {p}, who is {clubs[p].includes(p) ? "in" : "not in"} {p}'s club
                  and {rebel.includes(p) ? "in" : "not in"} the rebel club.</li>
              ))}
            </ul>
          </div>
          {phase === "rig" && (
            <>
              <Say who="Mira">It's the diagonal argument again: the rebel club differs from each person's club on that very person. Try to rig it.
                Tap squares in the grid to change the clubs, and see if you can make the rebel club equal to somebody's club.</Say>
              {toggles >= 3 && (
                <div className="row"><button className="btn" onClick={() => setPhase("done")}>I'm convinced it's impossible</button></div>
              )}
              <Hints hints={["Suppose the rebel club were Di's club. Is Di in it?", "If Di is in Di's club, she doesn't qualify for the rebel club. If she isn't, she does. Either way, the two clubs disagree about Di."]} />
            </>
          )}
          {phase === "done" && (
            <>
              <div className="feedback good"><p>However the clubs are named, the rebel club disagrees with each person's club about that person. So it's never anyone's club,
                 and no naming can cover every club. There are always more clubs than people.</p></div>
              <Say who="Mira">Here's the twist. Nothing in that argument used the number five. What happens if the "people" are all the real numbers?</Say>
              <div className="choices">
                {[["bigger", "Groups of real numbers outnumber the real numbers: 2^𝔠 > 𝔠"], ["same", "It stops working for infinite towns"], ["equal", "They match, like 𝔠 × 𝔠"]].map(([id, label]) => (
                  <button key={id} className={"btn secondary" + (pick === id && id !== "bigger" ? " picked-wrong" : "")}
                          disabled={pick === "bigger"} onClick={() => setPick(id)}>{label}</button>
                ))}
              </div>
              {pick && pick !== "bigger" && <div className="feedback bad"><p>The rebel club only ever asks one question per person: are you in your own club? Does that question need the town to be finite?</p></div>}
              {pick === "bigger" && (
                <>
                  <Confetti />
                  <div className="feedback good"><p>Right. The argument works for any collection at all. For any collection, the collection of all its subsets is strictly bigger.
                     This is Cantor's theorem, and the diagonal from the last chapter was a special case of it.</p></div>
                  <NewEntry i={6} />
                  <Formal>
                    <p>For any set X and any map f : X → 𝒫(X), let R = {"{x ∈ X : x ∉ f(x)}"}. If R = f(r) for some r, then r ∈ R ⇔ r ∉ f(r) = R, a contradiction. So no f is onto,
                       while x ↦ {"{x}"} is one-to-one. Hence |𝒫(X)| &gt; |X| for every set X, written 2<sup>|X|</sup> &gt; |X|.</p>
                  </Formal>
                  <button className="btn" onClick={onNext}>Continue</button>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function ArithReveal({ onFinish }) {
  const [pick, setPick] = useState(null);
  const tower = [<>ℵ₀</>, <>𝔠 = {sup(2, "ℵ₀")}</>, <>{sup(2, "𝔠")}</>, <>2<sup>2<sup>𝔠</sup></sup></>, <>…</>];
  return (
    <>
      <h2>No biggest infinity</h2>
      <Ledger n={7} />
      <p>Take any infinity, collect all its subsets, and you get a bigger one. Do it again and you get a bigger one still. The tower never ends.</p>
      <div className="tower">
        {tower.map((t, i) => <React.Fragment key={i}><span style={{ "--i": i }}>{t}</span>{i < tower.length - 1 && <i>&lt;</i>}</React.Fragment>)}
      </div>
      <p>Adding and multiplying barely move an infinity at all: ℵ₀ + ℵ₀ is still ℵ₀, and 𝔠 × 𝔠 is still 𝔠. Taking all subsets always makes a jump.</p>
      <Formal>
        <p>An open question in disguise: is there any size strictly between ℵ₀ and 𝔠? Cantor believed not; this is the continuum hypothesis. Gödel (1940) and Cohen (1963)
           showed that the standard axioms of set theory (ZFC) can neither prove nor disprove it.</p>
      </Formal>

      <h3>One last check</h3>
      <Say who="Mira">A guest claims to have found the biggest infinity of all. Using only your ledger, what do you tell them?</Say>
      <div className="choices">
        {[["plus", "Add one to it"], ["times", "Multiply it by itself"], ["power", "Take all its subsets"]].map(([id, label]) => (
          <button key={id} className={"btn secondary" + (pick === id && id !== "power" ? " picked-wrong" : "")}
                  disabled={pick === "power"} onClick={() => setPick(id)}>{label}</button>
        ))}
      </div>
      {pick === "plus" && <div className="feedback bad"><p>Like the hotel: adding one to an infinity doesn't change its size. Find a move in the ledger that always makes things bigger.</p></div>}
      {pick === "times" && <div className="feedback bad"><p>Remember the square and the line: 𝔠 × 𝔠 = 𝔠. Multiplying doesn't help either.</p></div>}
      {pick === "power" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Exactly. Whatever infinity they bring, its subsets form a bigger one. There is no biggest infinity.</p></div>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export const CH6_STEPS = [{ kind: "intro" }, { kind: "line" }, { kind: "zip" }, { kind: "switch" }, { kind: "club" }, { kind: "reveal" }];

export function ChapterSix({ step, setStep, onExit, onFinish, reach }) {
  step = Math.min(step, CH6_STEPS.length - 1);
  const s = CH6_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH6_STEPS.length - 1));
  return (
    <ChapterShell steps={CH6_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "intro" && <ArithIntro onNext={next} />}
      {s.kind === "line" && <LineHotel key="line" onNext={next} />}
      {s.kind === "zip" && <Zipper key="zip" onNext={next} />}
      {s.kind === "switch" && <Switches key="switch" onNext={next} />}
      {s.kind === "club" && <RebelClub key="club" onNext={next} />}
      {s.kind === "reveal" && <ArithReveal onFinish={onFinish} />}
    </ChapterShell>
  );
}
