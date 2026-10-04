// Chapter 2: Hilbert's hotel
import { useState } from "react";
import { Say } from "../shared/art";
import { range, useTimers } from "../shared/helpers";
import { Hotel, HotelChecks, makeArrivals, makeOld, moveOld, seatArrivals } from "../shared/hotel";
import { ChapterShell, Confetti, Hints, RuleButtons } from "../shared/ui";

export const CH2_STEPS = [{ kind: "story" }, { kind: "one" }, { kind: "five" }, { kind: "bus" }, { kind: "reveal" }];

function HotelStory({ onNext }) {
  return (
    <>
      <h2>No vacancy</h2>
      <p>Ura has travelled to the city and finds a strange hotel. It has a room for every counting number: 1, 2, 3, 4,
         and on forever. There is no last room. The idea comes from the mathematician David Hilbert, who used it in a 1924 lecture.</p>
      <p>Tonight, every single room is taken. The number on each guest's shirt is the room they started in.</p>
      <Hotel guests={makeOld()} />
      <Say who="Mira">Welcome! I'm the night manager. I'm afraid we're completely full, though that has never stopped me before.</Say>
      <button className="btn" onClick={onNext}>Ask for a room</button>
    </>
  );
}

function OneGuest({ onNext }) {
  const later = useTimers();
  const init = () => [...makeOld(), { id: "ura", kind: "ura", label: "Ura", j: 1, row: "arrive", col: 1 }];
  const [guests, setGuests] = useState(init);
  const [phase, setPhase] = useState("where");
  const [wrong, setWrong] = useState(null);

  function where(id) {
    if (id === "move") { setWrong(null); setPhase("rule"); } else setWrong(id);
  }
  function rule(id) {
    setWrong(null);
    if (id === "plus") {
      setPhase("busy");
      setGuests(g => moveOld(g, c => c + 1));
      later(() => setGuests(g => seatArrivals(g, () => 1)), 1200);
      later(() => setPhase("done"), 1900);
    } else if (id === "minus") {
      setPhase("busy");
      setGuests(g => moveOld(g, c => c - 1));
      later(() => setPhase("fail"), 1300);
    } else { setWrong("stay"); }
  }

  return (
    <>
      <h2>One more guest</h2>
      <Hotel guests={guests} />
      <HotelChecks guests={guests} />
      {phase === "where" && (
        <>
          <Say who="Mira">Every room is full. So where can Ura sleep tonight?</Say>
          <RuleButtons wrong={wrong} onPick={where} options={[
            { id: "last", label: "In the last room at the end of the hall" },
            { id: "none", label: "Nowhere. The hotel is full" },
            { id: "move", label: "Move some guests around" },
          ]} />
          {wrong === "last" && <div className="feedback bad"><p>Walk down the hall as far as you like: after room 1,000,000 comes room 1,000,001. There is no last room.</p></div>}
          {wrong === "none" && <div className="feedback bad"><p>In a hotel with 12 rooms you'd be right. Mira thinks this hotel is different. What could she ask the guests to do?</p></div>}
          <Hints hints={["Is there really a room at the end of the hall?", "Nobody has to leave the hotel, but they might have to change rooms."]} />
        </>
      )}
      {(phase === "rule" || phase === "fail") && (
        <>
          <Say who="Mira">I'll make an announcement to every room at once: "Whoever is in room <i>n</i>, please move to room…"</Say>
          {phase === "rule" && (
            <RuleButtons wrong={wrong} onPick={rule} options={[
              { id: "plus", label: "n + 1" },
              { id: "minus", label: "n − 1" },
              { id: "stay", label: "n (stay where you are)" },
            ]} />
          )}
          {wrong === "stay" && <div className="feedback bad"><p>Nobody moves, so Ura is still standing in the lobby.</p></div>}
          {phase === "rule" && <Hints hints={["Room 1 needs to come free. Where could its guest go?", "If the guest in room 1 moves to room 2, where should the guest in room 2 go? And the one in room 3?"]} />}
          {phase === "fail" && (
            <>
              <div className="feedback bad"><p>Everyone shuffled down, but there is no room 0. The guest from room 1 is now stranded in the lobby next to Ura, and nobody gained a room.</p></div>
              <button className="btn secondary" onClick={() => { setGuests(init()); setPhase("rule"); }}>Send everyone back</button>
            </>
          )}
        </>
      )}
      {phase === "done" && (
        <>
          <Confetti />
          <div className="feedback good">
            <p>Everyone stepped up one room. The guest from room 1 went to 2, the guest from 2 went to 3, and so on forever.
               Nobody was evicted, because there is always a next room. Room 1 came free, and Ura took it.</p>
          </div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

function FiveGuests({ onNext }) {
  const later = useTimers();
  const init = () => [...makeOld(), ...makeArrivals(["A", "B", "C", "D", "E"])];
  const [guests, setGuests] = useState(init);
  const [k, setK] = useState(1);
  const [phase, setPhase] = useState("pick");

  function announce() {
    setPhase("busy");
    setGuests(g => moveOld(g, c => c + k));
    later(() => setGuests(g => seatArrivals(g, j => (j <= k ? j : null))), 1200);
    later(() => setPhase(k === 5 ? "done" : "retry"), 1900);
  }
  function result() {
    if (k < 5) return `Only rooms 1 to ${k} came free, so ${5 - k} ${5 - k === 1 ? "guest is" : "guests are"} still waiting.`;
    return `All five fit, but rooms 6 to ${k} now stand empty. Mira likes a full house: can you free exactly enough rooms?`;
  }

  return (
    <>
      <h2>A car with five friends</h2>
      <Hotel guests={guests} />
      <HotelChecks guests={guests} />
      <Say who="Mira">Five more travellers just pulled up. Same trick, bigger step. "Whoever is in room <i>n</i>, please move to room <i>n</i> + …"</Say>
      {phase === "pick" && (
        <div className="row">
          <div className="stepper" role="group" aria-label="How many rooms to move up">
            <button className="btn secondary" onClick={() => setK(Math.max(1, k - 1))} aria-label="One fewer">−</button>
            <span className="stepper-val">n + {k}</span>
            <button className="btn secondary" onClick={() => setK(Math.min(9, k + 1))} aria-label="One more">+</button>
          </div>
          <button className="btn" onClick={announce}>Make the announcement</button>
        </div>
      )}
      {phase === "pick" && <Hints hints={["For one new guest, everyone moved up one room. How many rooms need to come free now?"]} />}
      {phase === "retry" && (
        <>
          <div className="feedback bad"><p>{result()}</p></div>
          <button className="btn secondary" onClick={() => { setGuests(init()); setPhase("pick"); }}>Try another number</button>
        </>
      )}
      {phase === "done" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Everyone moved up five rooms, rooms 1 to 5 came free, and the five friends took them. The hotel is full again, with five more guests than before.</p></div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

function InfiniteBus({ onNext }) {
  const later = useTimers();
  const init = () => [...makeOld(), ...makeArrivals(range(14).map(i => "B" + (i + 1)))];
  const [guests, setGuests] = useState(init);
  const [stage, setStage] = useState("q1");   // q1 -> q2 -> done
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(null);

  function q1(id) {
    if (id !== "double") { setWrong(id); return; }
    setWrong(null); setBusy(true);
    setGuests(g => moveOld(g, c => 2 * c));
    later(() => { setStage("q2"); setBusy(false); }, 1300);
  }
  function q2(id) {
    if (id !== "odd") { setWrong(id); return; }
    setWrong(null); setBusy(true);
    setGuests(g => seatArrivals(g, j => 2 * j - 1));
    later(() => { setStage("done"); setBusy(false); }, 1500);
  }
  const hints = {
    repeat: "Each n + 1 announcement frees only one room. Passenger B1 gets in after one announcement, B100 after a hundred, but the announcements never finish, so someone is always still waiting.",
    inf: "There's no room ∞, and no room ∞ + 1. Every room in the hotel has an ordinary counting number on its door.",
    even: "Passenger B1 would head to room 2, but the guest from room 1 is already there.",
    same: "Passenger B2 would head to room 2, which is taken.",
    next: "Passenger B1 would head to room 2, which is taken.",
  };

  return (
    <>
      <h2>An infinitely long bus</h2>
      <Hotel guests={guests} arrivingMore />
      <HotelChecks guests={guests} infinite />
      {stage === "q1" && (
        <>
          <Say who="Mira">Now a bus has pulled up with seats B1, B2, B3, and on forever, every seat full. Moving everyone up a fixed number of rooms won't free enough space. What should I announce to room <i>n</i>?</Say>
          {!busy && <RuleButtons wrong={wrong} onPick={q1} options={[
            { id: "repeat", label: "n + 1, once for every passenger" },
            { id: "inf", label: "n + ∞" },
            { id: "double", label: "2n" },
          ]} />}
        </>
      )}
      {stage === "q2" && (
        <>
          <Say who="Mira">Every guest doubled their room number, so they all live in even rooms now. Rooms 1, 3, 5, 7, … are free. Which room should passenger B<i>k</i> take?</Say>
          {!busy && <RuleButtons wrong={wrong} onPick={q2} options={[
            { id: "same", label: "k" },
            { id: "next", label: "k + 1" },
            { id: "even", label: "2k" },
            { id: "odd", label: "2k − 1" },
          ]} />}
        </>
      )}
      {wrong && hints[wrong] && !busy && <div className="feedback bad"><p>{hints[wrong]}</p></div>}
      {stage === "q1" && !busy && <Hints key="h1" hints={["Moving everyone up any fixed number of rooms frees only finitely many. You need infinitely many free rooms at once.", "Is there a move that would leave every other room empty?"]} />}
      {stage === "q2" && !busy && <Hints key="h2" hints={["The free rooms are 1, 3, 5, 7, …. Which one should B1 get? B2? B3?", "B1 → 1, B2 → 3, B3 → 5. Write the room as a formula in k."]} />}
      {stage === "done" && (
        <>
          <Confetti />
          <div className="feedback good">
            <p>B1 went to room 1, B2 to room 3, B3 to room 5, and so on. Every passenger has an odd room, every old guest has an even one,
               and not a single room is empty. Infinitely many new guests, and the hotel never needed to grow.</p>
          </div>
          <button className="btn" onClick={onNext}>Continue</button>
        </>
      )}
    </>
  );
}

function HotelReveal({ onFinish }) {
  const [picked, setPicked] = useState(null);
  return (
    <>
      <h2>What the hotel proved</h2>
      <p>Every announcement Mira made was a bijection in disguise. "Move from <i>n</i> to <i>n</i> + 1" pairs the guests of rooms 1, 2, 3, …
         with rooms 2, 3, 4, …, with nobody doubled up and nobody left out. A collection missing a member can be exactly as big as the whole.</p>
      <div className="defn">
        <h3>ℵ₀ (aleph-null)</h3>
        <p>The size of the counting numbers 1, 2, 3, …. Any collection that can be matched one-to-one with them is called
           countably infinite, and has size ℵ₀.</p>
        <div className="eqs">
          <span><b>ℵ₀ + 1 = ℵ₀</b><small>one guest</small></span>
          <span><b>ℵ₀ + 5 = ℵ₀</b><small>five friends</small></span>
          <span><b>ℵ₀ + ℵ₀ = ℵ₀</b><small>the endless bus</small></span>
        </div>
      </div>
      <p>This never happens with Ura's pots: take one pot off a matched shelf and a lid is always left over. Infinite collections
         behave differently: a part can be as large as the whole. Mathematicians even use that as one way to define what "infinite" means.</p>
      <h3>Look where the old guests went</h3>
      <div className="evens" aria-label="Room 1 to 2, 2 to 4, 3 to 6, 4 to 8, 5 to 10, and so on">
        {[1, 2, 3, 4, 5, 6].map(n => <span key={n}><b>{n}</b><i>↓</i><b className="ev">{2 * n}</b></span>)}<span className="more-dots">…</span>
      </div>
      <p>When the bus arrived, every old guest landed in an even room, and every even room got exactly one guest. That pairing,
         n with 2n, is a bijection between all the counting numbers and just the even ones. Half the numbers are missing, and there are
         still exactly as many even numbers as counting numbers.</p>

      <h3>One last check</h3>
      <Say who="Mira">My cousin runs a hotel with 100 rooms, all full. Why can't she use my n + 1 trick?</Say>
      <div className="choices">
        {[
          { id: "last", label: "The guest in room 100 has nowhere to go" },
          { id: "slow", label: "It would take too long" },
          { id: "works", label: "She can, it works fine" },
        ].map(o => (
          <button key={o.id} className={"btn secondary" + (picked && picked !== "last" && picked === o.id ? " picked-wrong" : "")}
                  onClick={() => setPicked(o.id)} disabled={picked === "last"}>{o.label}</button>
        ))}
      </div>
      {picked && picked !== "last" && <div className="feedback bad"><p>Picture room 100 when the announcement plays. Where does its guest go?</p></div>}
      {picked === "last" && (
        <>
          <Confetti />
          <div className="feedback good"><p>Exactly. In a finite hotel there is a last room, and its guest gets squeezed out. Mira's trick only works because her hallway never ends.</p></div>
          <button className="btn" onClick={onFinish}>Finish chapter</button>
        </>
      )}
    </>
  );
}

export function ChapterTwo({ step, setStep, onExit, onFinish, reach }) {
  const s = CH2_STEPS[step];
  const next = () => setStep(Math.min(step + 1, CH2_STEPS.length - 1));
  return (
    <ChapterShell steps={CH2_STEPS} step={step} onExit={onExit} reach={reach} onJump={setStep}>
      {s.kind === "story" && <HotelStory onNext={next} />}
      {s.kind === "one" && <OneGuest key="one" onNext={next} />}
      {s.kind === "five" && <FiveGuests key="five" onNext={next} />}
      {s.kind === "bus" && <InfiniteBus key="bus" onNext={next} />}
      {s.kind === "reveal" && <HotelReveal onFinish={onFinish} />}
    </ChapterShell>
  );
}
