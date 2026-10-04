// Chapter 4: Every fraction
import React, { useState, useEffect } from "react";
import { Say } from "../shared/art";
import { range } from "../shared/helpers";
import { ChapterShell, Confetti, Hints } from "../shared/ui";

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const GRID_N = 6;

function Frac({ p, q, small }) {
  return <span className={"frac" + (small ? " small" : "")} aria-label={`${p} over ${q}`}><b>{p}</b><b>{q}</b></span>;
}

function FracGrid({ marks, onTap, tint, disabled, note }) {
  return (
    <div className="grid-wrap">
      <div className="fgrid" role="grid" aria-label="Fractions laid out by top and bottom number">
        <span className="corner">top ↓ bottom →</span>
        {range(GRID_N).map(q => <span key={"h" + q} className="ghead">{q + 1}</span>)}
        <span className="ghead fade">…</span>
        {range(GRID_N).map(pi => {
          const p = pi + 1;
          return (
            <React.Fragment key={p}>
              <span className="ghead">{p}</span>
              {range(GRID_N).map(qi => {
                const q = qi + 1, k = p + "-" + q, m = marks[k];
                const cls = "cell" + (tint ? " d" + ((p + q) % 2) : "") + (m ? (m.dup ? " dup" : " got") : "") + (m && m.fresh ? " fresh" : "");
                return (
                  <button key={k} className={cls} disabled={disabled} onClick={() => onTap && onTap(p, q)}
                          aria-label={`${p} over ${q}${m ? (m.dup ? ", duplicate, skipped" : `, listed at position ${m.n}`) : ""}`}>
                    <Frac p={p} q={q} />
                    {m && !m.dup && <span className="badge">{m.n}</span>}
                  </button>
                );
              })}
              <span className="ghead fade">…</span>
            </React.Fragment>
          );
        })}
        <span />
        {range(GRID_N + 1).map(i => <span key={"f" + i} className="ghead fade">⋮</span>)}
      </div>
      {note && <p className="grid-note">{note}</p>}
    </div>
  );
}

function Dense({ onNext }) {
  const [L] = useState([1, 3]);
  const [R, setR] = useState([1, 2]);
  const [M, setM] = useState(null);
  const [made, setMade] = useState([]);
  const [pick, setPick] = useState(null);
  const val = f => f[0] / f[1];
  const right = M || R;
  function squeeze() {
    const base = M || R;
    if (M) setR(M);
    const m = [L[0] + base[0], L[1] + base[1]];
    setM(m); setMade(x => [...x, m]);
  }
  const pos = M ? 8 + 84 * (val(M) - val(L)) / (val(R) - val(L)) : null;
  return (
    <>
      <h2>No room to breathe</h2>
      <p>Counting numbers come in neat steps: 1, then 2, then 3. Fractions don't. Between any two fractions, there's always another one.
         Pick the gap between 1/3 and 1/2 and try to fill it up.</p>
      <div className="figure dense">
        <div className="dline">
          <span className="dmark" style={{ left: "8%" }}><Frac p={L[0]} q={L[1]} /></span>
          <span className="dmark" style={{ left: "92%" }}><Frac p={(M ? R : right)[0]} q={(M ? R : right)[1]} /></span>
          {M && <span key={M.join("/")} className="dmark new" style={{ left: pos + "%" }}><Frac p={M[0]} q={M[1]} /></span>}
        </div>
        <p className="grid-note">{made.length === 0 ? "Tap to squeeze a fraction into the gap." : `Fractions squeezed in so far: ${made.length}. Each time, the view zooms into the new, smaller gap.`}</p>
      </div>
      <div className="row">
        <button className="btn" onClick={squeeze}>{made.length ? "Squeeze in another" : "Squeeze one in"}</button>
        {made.length > 0 && <span className="status" style={{ margin: 0 }}>Trick: add the tops and add the bottoms. {L[0]}/{L[1]} and {R[0]}/{R[1]} give {M[0]}/{M[1]}.</span>}
      </div>
      {made.length >= 3 && (
        <>
          <Say who="Mira">It never runs out, does it? So tell me: which fraction comes right after 0?</Say>
          <div className="choices">
            {[["m", "1/1,000,000"], ["g", "1 over a googol"], ["none", "There isn't a next one"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "none" ? " picked-wrong" : "")}
                      disabled={pick === "none"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick && pick !== "none" && <div className="feedback bad"><p>Halve it. The result is still bigger than 0, and smaller than your answer.</p></div>}
          {pick === "none" && (
            <>
              <div className="feedback good"><p>Right. Whatever fraction you name, half of it is smaller and still above 0. Fractions have no "next one", which makes them feel
                 like vastly more than 1, 2, 3, …. Surely they can't be listed?</p></div>
              <button className="btn" onClick={onNext}>Try to list them anyway</button>
            </>
          )}
        </>
      )}
    </>
  );
}

function zigOrder(maxSum) {
  const out = [];
  for (let s = 2; s <= maxSum; s++) {
    const ps = range(s - 1).map(i => i + 1);
    (s % 2 ? ps : ps.reverse()).forEach(p => out.push([p, s - p]));
  }
  return out;
}

const STRATS = {
  rows: { label: "Row by row", order: range(GRID_N).map(q => [1, q + 1]),
          msg: "Mira walks along row 1: 1/1, 1/2, 1/3, … That row never ends, so she never comes back for 2/1, or anything in rows 2, 3, 4, …." },
  cols: { label: "Column by column", order: range(GRID_N).map(p => [p + 1, 1]),
          msg: "Column 1 is 1/1, 2/1, 3/1, … forever. The list never reaches 1/2." },
  zig: { label: "Diagonal by diagonal", order: zigOrder(7),
         msg: "Each diagonal is short, so the walk always finishes it and moves on. Pick any cell, and the walk reaches it after finitely many steps." },
};

function markOrder(order, upto) {
  const marks = {}; let n = 0;
  order.slice(0, upto).forEach(([p, q], i) => {
    const dup = gcd(p, q) > 1;
    marks[p + "-" + q] = dup ? { dup: true } : { n: ++n, fresh: i === upto - 1 };
  });
  return marks;
}

function GridIntro({ onNext }) {
  const [strat, setStrat] = useState(null);
  const [upto, setUpto] = useState(0);
  const [done, setDone] = useState(false);
  const [tried, setTried] = useState([]);
  useEffect(() => {
    if (!strat) return;
    const order = STRATS[strat].order;
    if (upto >= order.length) { setDone(true); return; }
    const t = setTimeout(() => setUpto(u => u + 1), strat === "zig" ? 160 : 260);
    return () => clearTimeout(t);
  }, [strat, upto]);
  function run(id) { setStrat(id); setUpto(0); setDone(false); setTried(t => (t.includes(id) ? t : [...t, id])); }
  const marks = strat ? markOrder(STRATS[strat].order, upto) : {};
  const running = strat && !done;
  return (
    <>
      <h2>Every fraction has a seat</h2>
      <p>Lay out every positive fraction on a grid. Row <i>p</i> holds the fractions with <i>p</i> on top, and column <i>q</i> holds the ones with <i>q</i> on
         the bottom. So 3/4 sits in row 3, column 4. The grid runs forever right and down, and every fraction has a cell.</p>
      <FracGrid marks={marks} disabled note={strat && done && strat !== "zig" ? "…and on forever, in one direction only." : null} />
      <Say who="Mira">Now we need a single list that reaches every cell. Which walk should I take?</Say>
      <div className="choices">
        {Object.entries(STRATS).map(([id, s]) => (
          <button key={id} className={"btn secondary" + (tried.includes(id) && id !== "zig" ? " picked-wrong" : "")}
                  disabled={running} onClick={() => run(id)}>{s.label}</button>
        ))}
      </div>
      {!(strat === "zig" && done) && !running && <Hints hints={["Rows and columns are both infinitely long. What happens if a walk starts down one of them?", "Look for a walk that only takes finitely many steps before it turns back toward the corner."]} />}
      {strat && done && (
        <div className={"feedback " + (strat === "zig" ? "good" : "bad")}><p>{STRATS[strat].msg}</p></div>
      )}
      {strat === "zig" && done && <button className="btn" onClick={onNext}>Walk it yourself</button>}
    </>
  );
}

function TraceZigzag({ onNext }) {
  const MAX_SUM = 6;                               // diagonals with top + bottom = 2 … 6, 15 cells
  const [marks, setMarks] = useState({});
  const [list, setList] = useState([]);
  const [sum, setSum] = useState(2);
  const [msg, setMsg] = useState({ text: "", warn: false });
  const [sawDup, setSawDup] = useState(false);
  const [pick, setPick] = useState(null);
  const finished = sum > MAX_SUM;

  function apply(p, q, state) {
    const { marks, list, sum } = state;
    const k = p + "-" + q;
    const dup = gcd(p, q) > 1;
    const nm = { ...marks };
    Object.keys(nm).forEach(x => { if (nm[x].fresh) nm[x] = { ...nm[x], fresh: false }; });
    const nl = dup ? list : [...list, [p, q]];
    nm[k] = dup ? { dup: true } : { n: nl.length, fresh: true };
    const doneDiag = range(sum - 1).every(i => nm[(i + 1) + "-" + (sum - 1 - i)]);
    return { marks: nm, list: nl, sum: doneDiag ? sum + 1 : sum, dup };
  }
  function tap(p, q) {
    if (finished) return;
    const k = p + "-" + q;
    if (marks[k]) { setMsg({ text: "That one is already on the list.", warn: false }); return; }
    if (p + q !== sum) {
      setMsg({ text: `${p}/${q} is on a later diagonal (${p} + ${q} = ${p + q}). Finish the fractions whose top and bottom add up to ${sum} first.`, warn: true });
      return;
    }
    const r = apply(p, q, { marks, list, sum });
    setMarks(r.marks); setList(r.list); setSum(r.sum);
    if (r.dup) {
      setSawDup(true);
      const g = gcd(p, q);
      setMsg({ text: `${p}/${q} is the same number as ${p / g}/${q / g}, which is already listed. Skip it: a list only needs each number once.`, warn: false });
    } else setMsg({ text: r.sum > sum && r.sum <= MAX_SUM ? `Diagonal done. Next: top + bottom = ${r.sum}.` : "", warn: false });
  }
  function fillRest() {
    let st = { marks, list, sum };
    while (st.sum <= MAX_SUM) {
      const s = st.sum;
      const next = range(s - 1).map(i => [i + 1, s - 1 - i]).find(([p, q]) => !st.marks[p + "-" + q]);
      st = apply(next[0], next[1], st);
    }
    setMarks(st.marks); setList(st.list); setSum(st.sum); setSawDup(true);
    setMsg({ text: "Mira finished the walk. Duplicates like 2/2 and 2/4 were skipped.", warn: false });
  }
  const tapped = Object.keys(marks).length;

  return (
    <>
      <h2>Walk the diagonals</h2>
      <Say who="Mira">Here's the trick. First list every fraction whose top and bottom add up to 2. Then the ones that add up to 3, then 4, and so on.
        Each batch is a short diagonal, so you always finish it. Tap the cells in any order within a diagonal.</Say>
      <FracGrid marks={marks} onTap={tap} tint disabled={finished} />
      <p className={"status" + (msg.warn ? " warn" : "")} aria-live="polite">
        {msg.text || (finished ? "" : `Current diagonal: top + bottom = ${sum}.`)}
      </p>
      {!finished && tapped >= 6 && <div className="row"><button className="linkish" onClick={fillRest}>Finish the walk for me</button></div>}
      <div className="listline fracs" aria-label="Your list so far">
        {list.map(([p, q], i) => <span key={i}><small>{i + 1}</small><Frac p={p} q={q} small /></span>)}
        {list.length > 0 && <span className="more-dots">…</span>}
      </div>
      {finished && (
        <>
          <Say who="Mira">Keep walking forever and every cell gets a number. Quick check: where will 7/9 show up?</Say>
          <div className="choices">
            {[["16", "In the batch where top + bottom = 16"], ["63", "In the batch where top + bottom = 63"], ["never", "Never, it's too far out"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "16" ? " picked-wrong" : "")}
                      disabled={pick === "16"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick && pick !== "16" && <div className="feedback bad"><p>Which batch is a fraction in? Add its top and bottom.</p></div>}
          {pick === "16" && (
            <>
              <Confetti />
              <div className="feedback good"><p>7 + 9 = 16. The batches before it hold only 1 + 2 + … + 14 = 105 cells, so 7/9 turns up somewhere in the first 120 spots.
                 A long wait, but a finite one. That's all a list needs.</p></div>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

function FractionsReveal({ onFinish }) {
  const [picked, setPicked] = useState(null);
  return (
    <>
      <h2>Packed tight, and still countable</h2>
      <p>The diagonal walk lists every positive fraction. To include 0 and the negative fractions, use the street trick from chapter 3:
         0, then 1/1, −1/1, 1/2, −1/2, 2/1, −2/1, …, alternating signs as you walk.</p>
      <div className="defn">
        <h3>The rational numbers</h3>
        <p style={{ marginBottom: 0 }}>All fractions, positive and negative, are called the rational numbers. They fill every gap on the number line,
           with no "next" one anywhere, and yet they're countable. Their size is ℵ₀, exactly the same as 1, 2, 3, ….</p>
      </div>
      <p>The number line still holds numbers that aren't fractions, like √2 and π. The next chapter asks whether they can be listed too.</p>

      <h3>One last check</h3>
      <Say who="Mira">A guest insists 5/7 is missing from our list. What do you tell them?</Say>
      <div className="choices">
        {[["diag", "It's in the batch where 5 + 7 = 12, so it shows up after finitely many steps"],
          ["crowd", "You're right, fractions are too crowded to list"],
          ["dup", "It's a duplicate, so it was skipped"]].map(([id, label]) => (
          <button key={id} className={"btn secondary" + (picked && picked !== "diag" && picked === id ? " picked-wrong" : "")}
                  disabled={picked === "diag"} onClick={() => setPicked(id)}>{label}</button>
        ))}
      </div>
      {picked === "crowd" && <div className="feedback bad"><p>Crowded on the number line, maybe, but the grid puts them in neat rows and columns. Where on the grid is 5/7?</p></div>}
      {picked === "dup" && <div className="feedback bad"><p>5 and 7 share no common factor, so 5/7 is in lowest terms and gets its own spot on the list.</p></div>}
      {picked === "diag" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Exactly. Name any fraction and you can say how long the wait is. Next: a collection where that promise breaks for good.</p></div>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export const CH4_STEPS = [{ kind: "dense" }, { kind: "grid" }, { kind: "trace" }, { kind: "reveal" }];

export function ChapterFour({ step, setStep, onExit, onFinish, reach }) {
  const s = CH4_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH4_STEPS.length - 1));
  return (
    <ChapterShell steps={CH4_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "dense" && <Dense onNext={next} />}
      {s.kind === "grid" && <GridIntro onNext={next} />}
      {s.kind === "trace" && <TraceZigzag onNext={next} />}
      {s.kind === "reveal" && <FractionsReveal onFinish={onFinish} />}
    </ChapterShell>
  );
}
