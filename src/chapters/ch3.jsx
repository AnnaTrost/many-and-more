// Chapter 3: Both directions
import { useState } from "react";
import { Say } from "../shared/art";
import { range } from "../shared/helpers";
import { Hotel, VIS } from "../shared/hotel";
import { ChapterShell, Confetti, Hints } from "../shared/ui";

const fmtInt = h => (h < 0 ? "−" + Math.abs(h) : String(h));

const zigzag = n => range(n).map(i => (i % 2 ? (i + 1) / 2 : -i / 2));

const ROOMS_TO_FILL = 9;

const makeStreet = () => range(VIS).map(i => {
  const h = i - 5;
  return { id: "h" + h, kind: "house", h, label: fmtInt(h), row: "arrive", col: i + 1 };
});

// Read the player's choices as a plan, assume it repeats, and decide whether it could go on forever.
// House 0 is the square: it belongs to neither side, and only has to be sent at some point.
const EAST_VISIBLE = 6, WEST_VISIBLE = 5;   // houses 1…6 and −1…−5 are on screen

function judgeOrder(order) {
  const eNext = Math.max(0, ...order) + 1, wNext = Math.min(0, ...order) - 1;
  // A house is skipped if it's still waiting while someone further out on its side already has a room.
  // Report the one nearest the square; sending houses out of order is fine as long as nobody is left behind.
  let skipped = null;
  for (let d = 1; d < Math.max(eNext, -wNext); d++) {
    if (d < eNext && !order.includes(d)) { skipped = d; break; }
    if (-d > wNext && !order.includes(-d)) { skipped = -d; break; }
  }
  const east = order.some(h => h > 0), west = order.some(h => h < 0), zero = order.includes(0);
  const base = { eNext, wNext, zero, len: order.length };
  if (!west) return { kind: "east", ...base };
  if (!east) return { kind: "west", ...base };
  if (skipped !== null) return { kind: "skip", h: skipped, ...base };
  if (!zero) return { kind: "skip", h: 0, ...base };
  const sides = order.filter(h => h !== 0);
  const strict = sides.every((h, i) => i === 0 || (h > 0) !== (sides[i - 1] > 0));
  return { kind: "ok", strict, ...base };
}

// The phase ends when the rooms are filled or one side of the visible street is used up.
function planOver(order) {
  return order.length >= ROOMS_TO_FILL
    || order.filter(h => h > 0).length >= EAST_VISIBLE
    || order.filter(h => h < 0).length >= WEST_VISIBLE;
}

function StreetDrag({ onNext }) {
  const [guests, setGuests] = useState(makeStreet);
  const [order, setOrder] = useState([]);
  const done = planOver(order);
  const v = done ? judgeOrder(order) : null;

  function send(g) {
    setGuests(gs => {
      const n = gs.filter(x => x.row === "room").length;
      if (planOver(gs.filter(x => x.row === "room").sort((a, b) => a.col - b.col).map(x => x.h))) return gs;
      return gs.map(x => (x.id === g.id && x.row === "arrive" ? { ...x, row: "room", col: n + 1, delay: 0 } : x));
    });
    setOrder(o => (o.includes(g.h) || planOver(o) ? o : [...o, g.h]));
  }
  function reset() { setGuests(makeStreet()); setOrder([]); }

  const chips = order.map((h, i) => <span key={i}><small>room {i + 1}</small>{fmtInt(h)}</span>);
  let forecast = null;
  if (v && (v.kind === "east" || v.kind === "west")) {
    const ahead = 1000 - (v.len + 1);
    const far = v.kind === "east" ? v.eNext + ahead : v.wNext - ahead;
    const stuck = !v.zero ? 0 : v.kind === "east" ? -1 : 1;
    forecast = (
      <>
        <span className="more-dots">…</span>
        <span className="ghosted"><small>room 1,000</small>{fmtInt(far)}</span>
        <span className="more-dots">…</span>
        <span className="never"><small>never</small>{fmtInt(stuck)}</span>
      </>
    );
  } else if (v && v.kind === "ok") {
    let e = v.eNext, w = v.wNext; const more = [];
    const lastEast = [...order].reverse().find(h => h !== 0) > 0;
    for (let i = 0; i < 4; i++) more.push((i % 2 === 0) === lastEast ? w-- : e++);
    forecast = (
      <>
        {more.map((h, i) => <span key={"m" + i} className="ghosted"><small>room {order.length + i + 1}</small>{fmtInt(h)}</span>)}
        <span className="more-dots">…</span>
      </>
    );
  }

  return (
    <>
      <h2>A street with no ends</h2>
      <p>Back in town, a street runs out from the square in both directions. House 0 sits on the square. Houses 1, 2, 3, … run east,
         and houses −1, −2, −3, … run west, forever both ways. A storm is coming, and every household needs a room at Mira's hotel,
         which happens to be empty tonight.</p>
      <Hotel guests={guests} arrivingMore place="street" onSend={done ? null : send} sendLabel={g => `Send house ${g.label} to the next room`} nextRoom={done ? null : order.length + 1} />
      {!done && (
        <Say who="Mira">Drag people into the hotel. The first one you send gets room 1, the next gets room 2, and so on.
          Send people in a pattern I can keep repeating forever, so that every house on this endless street eventually gets a room. I'll fast-forward your plan once I see the pattern.</Say>
      )}
      {!done && <p className="status">{order.length ? `Rooms filled: ${order.length}. The glowing door is next.` : "Drag anyone from the street onto the hotel, or tap them."}</p>}
      {!done && <Hints hints={["If your plan only ever heads one way, what happens to the other side?", "Every house must get its turn after finitely many people. How can both sides keep moving?", "Don't forget house 0, on the square itself."]} />}
      {done && order.length < ROOMS_TO_FILL && <p className="status">You've used up one side of the street in view, so Mira assumes your plan carries on the same way.</p>}
      {order.length > 0 && <div className="listline" aria-label="Your plan so far">{chips}{forecast}</div>}

      {v && v.kind !== "ok" && (
        <>
          <div className="feedback bad">
            {v.kind === "east" && <p>Mira fast-forwards, assuming your plan keeps going the same way. It heads east forever: room 1,000 goes to house {fmtInt(v.eNext + 1000 - (v.len + 1))}, and the rooms never run out.
              But it never turns around, so house −1 and everyone west of it{v.zero ? "" : ", and house 0 too,"} wait forever.</p>}
            {v.kind === "west" && <p>Mira fast-forwards, assuming your plan keeps going the same way. It heads west forever, so house 1 and everyone east of it{v.zero ? "" : ", and house 0 too,"} never get a room.</p>}
            {v.kind === "skip" && v.h === 0 && <p>Your plan covers both directions, but it never sends house 0, the house on the square itself. Every house needs a room, including that one.</p>}
            {v.kind === "skip" && v.h !== 0 && <p>You skipped house {fmtInt(v.h)}. When will it get a room? To promise that every house gets one, a plan has to say exactly when,
              and that gets messy fast. Try never skipping anyone: always take the next house out on one side or the other.</p>}
          </div>
          <button className="btn secondary" onClick={reset}>Empty the hotel and try again</button>
        </>
      )}
      {v && v.kind === "ok" && (
        <>
          <Confetti />
          <div className="feedback good">
            {v.strict
              ? <p>Your plan zigzags: one side, then the other, then back again. Repeat it forever and any house n steps from the square gets a room within about 2n turns:
                  house 50 is in by room 102 or so. Nobody waits forever.</p>
              : <p>You worked outward on both sides without skipping anyone. As long as you keep returning to both sides forever, every house gets its turn.
                  The simplest way to guarantee that is to alternate: east, west, east, west.</p>}
          </div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

function Squares({ onNext }) {
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);
  const X = n => 24 + (n - 1) * (592 / 35);
  const sq = [1, 2, 3, 4, 5, 6];
  return (
    <>
      <h2>A warm-up from 1638</h2>
      <p>Galileo noticed something odd. Mark the perfect squares on the number line: 1, 4, 9, 16, 25, 36, …
         They get rarer and rarer, with bigger and bigger gaps between them.</p>
      <div className="figure">
        <svg viewBox="0 0 640 180" width="100%" role="img" aria-label="Number line from 1 to 36 with the squares highlighted">
          <line x1="16" y1="56" x2="624" y2="56" stroke="var(--muted)" strokeWidth="2" />
          {range(36).map(i => {
            const n = i + 1, isSq = Number.isInteger(Math.sqrt(n));
            return isSq
              ? <g key={n}><circle cx={X(n)} cy="56" r="9" fill="var(--violet)" />
                  <text x={X(n)} y="34" textAnchor="middle" fontWeight="700" fontSize="15" fill="var(--violet)">{n}</text></g>
              : <circle key={n} cx={X(n)} cy="56" r="3" fill="var(--muted)" />;
          })}
          <text x="630" y="61" fontSize="18" fill="var(--muted)">…</text>
          {shown && sq.map((k, i) => (
            <g key={k}>
              <line className="draw" x1={60 + i * 100} y1="134" x2={X(k * k)} y2="68" stroke="var(--teal)" strokeWidth="2.5" style={{ animationDelay: i * 0.12 + "s" }} />
              <circle cx={60 + i * 100} cy="148" r="15" fill="var(--teal)" />
              <text x={60 + i * 100} y="153" textAnchor="middle" fontWeight="700" fontSize="15" fill="#fff">{k}</text>
            </g>
          ))}
          {shown && <text x="616" y="153" fontSize="18" fill="var(--muted)">…</text>}
        </svg>
      </div>
      {!shown && (
        <>
          <p><b>Are there more counting numbers than perfect squares?</b></p>
          <div className="choices">
            {[["more", "Yes, many more counting numbers"], ["fewer", "No, more squares"], ["same", "They're the same size"]].map(([id, label]) => (
              <button key={id} className="btn secondary" onClick={() => { setPick(id); setShown(true); }}>{label}</button>
            ))}
          </div>
        </>
      )}
      {shown && (
        <>
          <div className={"feedback " + (pick === "same" ? "good" : "bad")}>
            <p>{pick === "same" ? "Right, and here's the proof. " : pick === "more" ? "That's what almost everyone says, Galileo included at first. But look: " : "Not quite. Look: "}
               Pair each counting number n with its square n². 1 goes with 1, 2 with 4, 3 with 9, and so on. Every number has exactly
               one square, and every square has exactly one number. That's a bijection, so the squares have size ℵ₀ too, gaps and all.</p>
          </div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

function IntegersReveal({ onFinish }) {
  const [picked, setPicked] = useState(null);
  return (
    <>
      <h2>Making a list</h2>
      <p>Matching a collection with rooms 1, 2, 3, … is the same thing as writing it out as a list with a first item, a second item,
         a third item, and so on, where every member eventually shows up. Alternating sides turns the street that runs forever both ways into a list like this one:</p>
      <div className="listline" aria-label="0, 1, minus 1, 2, minus 2, 3, minus 3, and so on">
        {zigzag(9).map((h, k) => <span key={k}><small>{k + 1}</small>{fmtInt(h)}</span>)}<span className="more-dots">…</span>
      </div>
      <div className="defn">
        <h3>Countable</h3>
        <p>A collection is countable when you can list it so that every member appears at some finite position.
           The counting numbers, the even numbers, the squares, and all the integers are countable. Each has size ℵ₀.</p>
      </div>
      <p>Hold on to the idea of a list. Later on, you'll meet a collection that defeats every list anyone could ever write.</p>

      <h3>One last check</h3>
      <Say who="Mira">A guest suggests listing the street as 1, −1, 2, −2, 3, −3, … Is that a good list?</Say>
      <div className="choices">
        {[["yes", "Yes, it zigzags just like ours"], ["zero", "No, it never reaches house 0"], ["west", "No, the western houses never come up"]].map(([id, label]) => (
          <button key={id} className={"btn secondary" + (picked && picked !== "zero" && picked === id ? " picked-wrong" : "")}
                  disabled={picked === "zero"} onClick={() => setPicked(id)}>{label}</button>
        ))}
      </div>
      {picked && picked !== "zero" && <div className="feedback bad"><p>Read the list carefully, one house at a time. Which house never appears?</p></div>}
      {picked === "zero" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Right. A list only counts if it misses nobody, and this one forgets house 0. That's easy to fix by putting 0 first. In the next chapter, missing nobody gets much harder: fractions.</p></div>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export const CH3_STEPS = [{ kind: "squares" }, { kind: "street" }, { kind: "reveal" }];

export function ChapterThree({ step, setStep, onExit, onFinish, reach }) {
  step = Math.min(step, CH3_STEPS.length - 1);
  const s = CH3_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH3_STEPS.length - 1));
  return (
    <ChapterShell steps={CH3_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "squares" && <Squares onNext={next} />}
      {s.kind === "street" && <StreetDrag key="street" onNext={next} />}
      {s.kind === "reveal" && <IntegersReveal onFinish={onFinish} />}
    </ChapterShell>
  );
}
