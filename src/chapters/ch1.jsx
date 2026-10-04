// Chapter 1: Pots and lids
import { useState, useEffect, useRef } from "react";
import { Lid, Pot, Say } from "../shared/art";
import { range, tribeCount } from "../shared/helpers";
import { ChapterShell, Confetti, Hints } from "../shared/ui";
import { useDrag } from "../shared/useDrag";

function Tally({ pots, lids }) {
  return (
    <div className="tally" aria-live="polite">
      <span className="pill">Ura counts the pots: <span className={"val" + (pots > 3 ? " many" : "")}>{tribeCount(pots)}</span></span>
      <span className="pill">Ura counts the lids: <span className={"val" + (lids > 3 ? " many" : "")}>{tribeCount(lids)}</span></span>
    </div>
  );
}

function Board({ pots, lids, pairs, setPairs, interactive, setStatus }) {
  const [selLid, setSelLid] = useState(null);
  const [justCapped, setJustCapped] = useState(null);
  const capTimer = useRef(null);
  useEffect(() => () => clearTimeout(capTimer.current), []);
  const pairsRef = useRef(pairs); pairsRef.current = pairs;

  // Drag a lid ({ lid, from }) onto a pot, or off the shelf to put it back in the basket.
  const { drag: dragging, over, down, suppress } = useDrag(
    ({ lid, from }, pot) => place(from, lid, pot === null ? null : Number(pot)), "data-pot");
  const drag = dragging && { ...dragging.item, x: dragging.x, y: dragging.y };   // { lid, from, x, y }
  const hoverPot = over === null ? null : Number(over);
  const beginDrag = (e, lid, from) => { if (interactive) down(e, { lid, from }); };

  const usedLids = new Set(Object.values(pairs));
  const freeLids = range(lids).filter(l => !usedLids.has(l));

  function place(from, lid, target) {
    const cur = { ...pairsRef.current };
    if (target === null) {
      if (from !== "basket") { delete cur[from]; setPairs(cur); setStatus({ text: "Lid returned to the basket.", warn: false }); }
      return;
    }
    if (target === from) return;
    if (cur[target] !== undefined) {
      setStatus({ text: "That pot already has a lid. One lid per pot, or the matching tells us nothing.", warn: true });
      return;
    }
    if (from !== "basket") delete cur[from];
    cur[target] = lid;
    setPairs(cur);
    setJustCapped(target);
    clearTimeout(capTimer.current);
    capTimer.current = setTimeout(() => setJustCapped(null), 600);
    setSelLid(null);
    setStatus({ text: "Pop! Lid on.", warn: false });
  }

  // Tap / keyboard fallback
  function tapLid(l) {
    if (suppress.current) return;
    setSelLid(selLid === l ? null : l);
    setStatus({ text: "Now tap a bare pot, or just drag the lid onto one.", warn: false });
  }
  function tapPot(p) {
    if (suppress.current) return;
    if (selLid !== null) return place("basket", selLid, p);
    if (pairs[p] !== undefined) place(p, pairs[p], null);
  }

  return (
    <div className="board">
      <p className="zone-label">Lid basket</p>
      <div className="basket">
        {freeLids.length === 0 && <span className="empty-basket">The basket is empty!</span>}
        {freeLids.map(l => (
          <button key={l}
                  className={"item lid" + (selLid === l ? " sel" : "") + (drag && drag.lid === l ? " ghosted" : "")}
                  disabled={!interactive}
                  onPointerDown={e => beginDrag(e, l, "basket")}
                  onClick={() => tapLid(l)}
                  aria-label={`Lid ${l + 1}${selLid === l ? ", picked up" : ""}`}>
            <Lid i={l} />
          </button>
        ))}
      </div>
      <p className="zone-label">Potter's shelf</p>
      <div className="shelf">
        {range(pots).map(p => {
          const lid = drag && drag.from === p ? undefined : pairs[p];
          const over = drag && hoverPot === p && drag.from !== p;
          const cls = over ? (pairs[p] !== undefined ? " blocked" : " target") : "";
          return (
            <button key={p} data-pot={p} className={"item pot" + cls}
                    disabled={!interactive}
                    onPointerDown={e => pairs[p] !== undefined && beginDrag(e, pairs[p], p)}
                    onClick={() => tapPot(p)}
                    aria-label={`Pot ${p + 1}, ${pairs[p] !== undefined ? "has a lid" : "bare"}`}>
              <Pot i={p} lid={lid} animate={justCapped === p} uid={"b" + p} />
            </button>
          );
        })}
      </div>
      {drag && <div className="ghost" style={{ left: drag.x, top: drag.y }}><Lid i={drag.lid} w={64} /></div>}
    </div>
  );
}

export const CH1_STEPS = [
  { kind: "story" },
  { kind: "count", pots: 2, lids: 3, answer: "lids" },
  { kind: "many", pots: 7, lids: 7, answer: "same" },
  { kind: "pair", id: "pair-more-pots", pots: 9, lids: 7, answer: "pots" },   // two "pair" steps, so each needs its own id
  { kind: "pair", id: "pair-more-lids", pots: 6, lids: 10, answer: "lids" },
  { kind: "reveal" },
];

const ANSWERS = [
  { id: "pots", label: "More pots" },
  { id: "lids", label: "More lids" },
  { id: "same", label: "The same number" },
];

function Story({ onNext }) {
  return (
    <>
      <h2>The potter's shelf</h2>
      <p>Ura's people count like this: one, two, three, many. Anything past three is simply <b>many</b>.</p>
      <p>After the harvest the potter's shelf is crowded and the lid basket is overflowing. Before the trading trip,
         the elders need to know: are there more pots, more lids, or exactly enough of each?</p>
      <div className="hero-pots" style={{ marginBottom: "1.25rem" }}>
        {[0, 1, 2, 3, 4].map(k => <Pot key={k} i={k + 2} lid={k % 2 ? k : undefined} w={56} uid={"s" + k} />)}
      </div>
      <Say who="Ura">Let's start small. Even we can count a handful.</Say>
      <button className="btn" onClick={onNext}>Look at the shelf</button>
    </>
  );
}

function CompareStep({ step, onNext }) {
  const needsPairing = step.kind !== "count";
  const [phase, setPhase] = useState(step.kind === "many" ? "guess" : needsPairing ? "pair" : "answer");
  const [pairs, setPairs] = useState({});
  const [status, setStatus] = useState({ text: "", warn: false });
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState([]);

  const capped = Object.keys(pairs).length;
  const barePots = step.pots - capped;
  const leftLids = step.lids - capped;
  const pairingDone = barePots === 0 || leftLids === 0;
  const showAnswers = phase === "answer" || (phase === "pair" && pairingDone);

  function pairRest() {
    const next = { ...pairs };
    const used = new Set(Object.values(next));
    const free = range(step.lids).filter(l => !used.has(l));
    range(step.pots).forEach(p => { if (next[p] === undefined && free.length) next[p] = free.shift(); });
    setPairs(next);
    setStatus({ text: "Ura's children finished the matching.", warn: false });
  }
  function choose(id) { if (id === step.answer) setPicked(id); else setWrong(w => [...w, id]); }

  function correctText() {
    if (step.kind === "count")
      return `Ura counts "one, two" pots and "one, two, three" lids. Three comes after two, so there are more lids. When things are small enough to count, counting works fine.`;
    if (step.answer === "same")
      return "Every pot wears a lid and the basket is empty. Nobody counted past three, yet everyone can see the two piles are the same size.";
    if (step.answer === "pots")
      return `Every lid found a pot, and ${tribeCount(barePots)} pots are still bare. The pots win, and Ura never had to count the whole pile.`;
    return `Every pot has a lid, and the basket still holds ${tribeCount(leftLids)} lids. More lids, no counting needed.`;
  }
  function wrongHint() {
    if (step.kind === "count") return "Count the two rows again: the tribe can manage up to three.";
    if (barePots > 0 && leftLids === 0) return "Look at the shelf: some pots have no lid, while the basket is empty.";
    if (leftLids > 0 && barePots === 0) return "Look at the basket: lids are left over, yet every pot is covered.";
    return "Nothing is left over on either side. What does that tell you?";
  }

  return (
    <>
      <h2>{step.kind === "count" ? "A small pile" : step.kind === "many" ? "Many and many" : "Another trade"}</h2>
      <Tally pots={step.pots} lids={step.lids} />

      {phase === "guess" && (
        <>
          <Say who="Elder Tano">Many pots, many lids. So which pile is bigger?</Say>
          <Board pots={step.pots} lids={step.lids} pairs={{}} setPairs={() => {}} interactive={false} setStatus={() => {}} />
          <div className="choices">
            {[...ANSWERS, { id: "cant", label: "We can't tell by counting" }].map(a => (
              <button key={a.id} className={"btn secondary" + (wrong.includes(a.id) ? " picked-wrong" : "")}
                      onClick={() => a.id === "cant" ? setPhase("pair") : setWrong(w => [...w, a.id])}>{a.label}</button>
            ))}
          </div>
          {wrong.length > 0 && <div className="feedback bad"><p>How would the tribe know that? Both words came out as "many", and "many" isn't bigger than "many".</p></div>}
          <Hints hints={["The tribe can only say one, two, three or many. What do they say about each pile?", "If both piles are just \"many\", can counting settle the question at all?"]} />
        </>
      )}

      {phase !== "guess" && (
        <>
          {needsPairing && (
            <Say who="Ura">{step.kind === "many"
              ? "Forget counting. Put one lid on each pot. Whatever is left over tells us which pile is bigger."
              : "Same trick as before: one lid on each pot, then see what's left."}</Say>
          )}
          <Board pots={step.pots} lids={step.lids} pairs={pairs} setPairs={setPairs}
                 interactive={needsPairing && !picked} setStatus={setStatus} />
          {needsPairing && !pairingDone && (
            <div className="row">
              <span className="status" style={{ margin: 0 }}>Drag a lid onto a pot. Drag it off again to take it back.</span>
              {capped >= 3 && <button className="linkish" onClick={pairRest}>Pair the rest for me</button>}
            </div>
          )}
          <p className={"status" + (status.warn ? " warn" : "")} aria-live="polite">
            {needsPairing && pairingDone && !picked ? "No more pairs can be made. Which pile is bigger?" : status.text}
          </p>
          {showAnswers && !picked && (
            <div className="choices">
              {ANSWERS.map(a => (
                <button key={a.id} className={"btn secondary" + (wrong.includes(a.id) ? " picked-wrong" : "")}
                        onClick={() => choose(a.id)}>{a.label}</button>
              ))}
            </div>
          )}
          {showAnswers && !picked && wrong.length > 0 && <div className="feedback bad"><p>{wrongHint()}</p></div>}
          {picked && (
            <>
              <Confetti />
              <div className="feedback good"><p>{correctText()}</p></div>
              <button className="btn" onClick={onNext}>Continue</button>
            </>
          )}
        </>
      )}
    </>
  );
}

function Reveal({ onFinish }) {
  const [picked, setPicked] = useState(null);
  const options = [
    { id: "same", label: "The piles are the same size" },
    { id: "pots", label: "There are more pots" },
    { id: "none", label: "Nothing yet: that wasn't a fair matching" },
  ];
  return (
    <>
      <h2>What Ura discovered</h2>
      <p>Ura's trick has a name. Matching two collections so that everything has exactly one partner is called a
         bijection, or a one-to-one correspondence.</p>
      <div className="defn">
        <h3>Bijection</h3>
        <p style={{ marginBottom: ".25rem" }}>A matching between two collections that follows two rules:</p>
        <ol>
          <li>No pot gets two lids, and no lid goes on two pots. <span className="term">(This is called one-to-one, or injective.)</span></li>
          <li>Nothing is left out: every pot is covered and the basket ends up empty. <span className="term">(This is called onto, or surjective.)</span></li>
        </ol>
        <p style={{ marginTop: ".75rem", marginBottom: 0 }}><b>Two collections have the same size exactly when a bijection between them exists.</b></p>
      </div>
      <p>The definition never mentions counting. That matters, because some collections never finish:
         nobody can count 1, 2, 3, … all the way to the end. You can still try to pair them up, and that's
         exactly how mathematicians compare infinities.</p>

      <h3>One last check</h3>
      <Say who="Elder Tano">A careless trader stacked two lids on one pot, left another pot bare, and used every lid. What does that show?</Say>
      <div className="choices">
        {options.map(o => (
          <button key={o.id} className={"btn secondary" + (picked && picked !== "none" && picked === o.id ? " picked-wrong" : "")}
                  onClick={() => setPicked(o.id)} disabled={picked === "none"}>{o.label}</button>
        ))}
      </div>
      {picked && picked !== "none" && (
        <div className="feedback bad"><p>Two lids shared a pot, which breaks rule 1. A broken matching can't prove which pile is bigger.</p></div>
      )}
      {picked === "none" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Right! Only a matching that follows both rules settles the question. Next, we take Ura's trick to a hotel with infinitely many rooms.</p></div>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export function ChapterOne({ step, setStep, onExit, onFinish, reach }) {
  const s = CH1_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH1_STEPS.length - 1));
  return (
    <ChapterShell steps={CH1_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "story" && <Story onNext={next} />}
      {(s.kind === "count" || s.kind === "many" || s.kind === "pair") && <CompareStep key={step} step={s} onNext={next} />}
      {s.kind === "reveal" && <Reveal onFinish={onFinish} />}
    </ChapterShell>
  );
}
