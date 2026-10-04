// Bonus puzzle: fleet
import React, { useState } from "react";
import { Say } from "../shared/art";
import { BonusShell, Confetti, Hints } from "../shared/ui";

const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

// Which bus a prime belongs to: 3 → bus 1, 5 → bus 2, 7 → bus 3, …
function oddPrimeIndex(p) {
  if (p > 200000) return null;
  let c = 0; for (let x = 3; x <= p; x += 2) if (isPrime(x)) c++;
  return c;
}

function factor(n) {
  const f = []; let m = n;
  for (let p = 2; p * p <= m; p++) while (m % p === 0) { f.push(p); m /= p; }
  if (m > 1) f.push(m);
  return f;
}

function whoIsIn(n) {
  if (n === 1) return { kind: "empty", why: "1 isn't a power of any prime, so nobody is sent here." };
  const f = factor(n), p = f[0], k = f.length;
  const expr = Object.entries(f.reduce((a, x) => ({ ...a, [x]: (a[x] || 0) + 1 }), {}))
    .map(([b, e]) => (e > 1 ? `${b}${String(e).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("")}` : b)).join(" × ");
  if (f.some(x => x !== p)) return { kind: "empty", expr, why: `${n} = ${expr} uses more than one prime, so nobody is sent here.` };
  if (p === 2) return { kind: "old", expr, k, why: `${n} = ${expr}, so this is the old guest from room ${k}.` };
  const b = oddPrimeIndex(p);
  if (b === null) return { kind: "bus", expr, k, b: null, why: `${n} = ${expr}, a power of the prime ${p}, so a passenger from one of the later buses, seat ${k}.` };
  return { kind: "bus", expr, k, b, why: `${n} = ${expr}, so this is bus ${b}, seat ${k}.` };
}

export function BonusFleet({ onExit, onFinish }) {
  const [room, setRoom] = useState("");
  const [log, setLog] = useState([]);
  const [found, setFound] = useState({ old: false, bus3: false, empty: false });
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const missionsDone = found.old && found.bus3 && found.empty;
  function look() {
    const n = parseInt(room, 10);
    if (!n || n < 1 || n > 10000000) return;
    const r = whoIsIn(n);
    setLog(l => [{ n, ...r }, ...l].slice(0, 6));
    setFound(f => ({ old: f.old || r.kind === "old", bus3: f.bus3 || (r.kind === "bus" && r.b === 3), empty: f.empty || r.kind === "empty" }));
    setRoom("");
  }
  return (
    <BonusShell title="A fleet of endless buses" onExit={onExit}>
      <p>The hotel is full again, and now infinitely many buses arrive: bus 1, bus 2, bus 3, …, each with seats 1, 2, 3, … forever. Mira has a plan that uses prime numbers:</p>
      <div className="defn plain">
        <p>The guest in room <i>n</i> moves to room 2<sup>n</sup>.</p>
        <p>Bus 1's passengers use powers of 3: seat <i>s</i> goes to room 3<sup>s</sup>. Bus 2 uses powers of 5, bus 3 powers of 7, and so on through the odd primes.</p>
      </div>
      <Say who="Mira">Explore the hotel. Type a room number and I'll tell you who ends up there. Can you find all three?</Say>
      <ul className="missions">
        <li className={found.old ? "ok" : ""}>A guest who was already in the hotel</li>
        <li className={found.bus3 ? "ok" : ""}>A passenger from bus 3</li>
        <li className={found.empty ? "ok" : ""}>An empty room</li>
      </ul>
      <div className="row">
        <input className="numin" type="number" min="1" inputMode="numeric" value={room} placeholder="Room number"
               onChange={e => setRoom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") look(); }} aria-label="Room number" />
        <button className="btn" onClick={look}>Who's in there?</button>
      </div>
      {log.length > 0 && (
        <ul className="lookups">
          {log.map((r, i) => <li key={log.length - i} className={r.kind}><b>Room {r.n.toLocaleString()}</b>{r.why}</li>)}
        </ul>
      )}
      {!missionsDone && <Hints hints={[
        "Old guests only ever land in powers of 2: 2, 4, 8, 16, ….",
        "Bus 3 is the third odd prime: 3, 5, 7. Try powers of 7.",
        "An empty room is any number built from two different primes, like 6 = 2 × 3.",
      ]} />}

      {missionsDone && (
        <>
          <Say who="Mira">Now the important question: could two people ever be sent to the same room?</Say>
          <div className="choices">
            {[["unique", "No: every number breaks into primes in only one way"],
              ["big", "Yes, eventually the powers collide"],
              ["sixty", "Yes: room 64 is both 2⁶ and 4³"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (q1 === id && id !== "unique" ? " picked-wrong" : "")}
                      disabled={q1 === "unique"} onClick={() => setQ1(id)}>{label}</button>
            ))}
          </div>
          {q1 === "big" && <div className="feedback bad"><p>A power of 3 is never even, and a power of 5 never divides by 3. Could a power of one prime ever equal a power of another?</p></div>}
          {q1 === "sixty" && <div className="feedback bad"><p>4 isn't prime, so no bus uses powers of 4. Room 64 belongs to exactly one person: the old guest from room 6.</p></div>}
          {q1 === "unique" && (
            <>
              <div className="feedback good"><p>Right. Every whole number has exactly one prime factorisation, so a power of 2 can never equal a power of 7. Nobody shares,
                 and every passenger on every bus gets a room. ℵ₀ buses of ℵ₀ passengers, plus the old guests: still ℵ₀.</p></div>
              <Say who="Mira">But rooms like 6, 10 and 12 sit empty forever, and I hate an empty room. Could a different plan fill every room?</Say>
              <p className="stretch">Stretch question: this one goes beyond the hotel. It's the main idea of chapter 4, so if you get stuck, take the hints or come back after chapter 4.</p>
              <div className="choices">
                {[["grid", "Yes: line up buses as rows and seats as columns, then walk the diagonals"],
                  ["no", "No: infinitely many buses always leave gaps"],
                  ["shift", "Yes: shift everyone down until the gaps close"]].map(([id, label]) => (
                  <button key={id} className={"btn secondary" + (q2 === id && id !== "grid" ? " picked-wrong" : "")}
                          disabled={q2 === "grid"} onClick={() => setQ2(id)}>{label}</button>
                ))}
              </div>
              {q2 === "no" && <div className="feedback bad"><p>Gaps come from this particular plan, not from the buses. Think of the passengers as a grid: bus number by seat number.</p></div>}
              {q2 === "shift" && <div className="feedback bad"><p>There are infinitely many gaps spread all the way along. Shifting a finite amount can never close them all.</p></div>}
              {q2 !== "grid" && <Hints hints={[
                "Every person can be named by two numbers: which bus, and which seat. Call the old guests bus 0.",
                "Lay everyone out as a table: buses down the side, seats along the top. Going row by row never finishes row 1. Is there a route that never gets stuck?",
                "Try short diagonals: (0,1), then (0,2) and (1,1), then (0,3), (1,2), (2,1), … Chapter 4 walks exactly this route.",
              ]} />}
              {q2 === "grid" && (
                <>
                  <Confetti />
                  <div className="feedback good"><p>Exactly. Treat the old guests as "bus 0", so every person is a pair (bus, seat). Lay them out in a table and walk it one
                     short diagonal at a time, giving each person the next room in turn: 1, 2, 3, … with no gaps.</p></div>
                  <div className="busgrid" aria-label="Bus and seat table, numbered along diagonals">
                    <span className="corner">bus ↓ seat →</span>
                    {[1, 2, 3, 4].map(t => <span key={"h" + t} className="ghead">{t}</span>)}
                    <span className="ghead fade">…</span>
                    {[0, 1, 2, 3].map(b => (
                      <React.Fragment key={b}>
                        <span className="ghead">{b === 0 ? "old" : b}</span>
                        {[1, 2, 3, 4].map(t => { const d = b + t; const room = (d - 1) * d / 2 + b + 1;
                          return <span key={t} className={"bg d" + (d % 2)}><b>room {room}</b></span>; })}
                        <span className="ghead fade">…</span>
                      </React.Fragment>
                    ))}
                    <span className="ghead fade">⋮</span>
                    {[1, 2, 3, 4, 5].map(t => <span key={"v" + t} className="ghead fade">⋮</span>)}
                  </div>
                  <p>Each diagonal is finite, so everyone is reached after finitely many steps. Mira's prime plan proved the fleet fits; the diagonal walk proves it
                     fits with no empty rooms, a true bijection. You'll walk this same route yourself in chapter 4, where it lists every fraction.</p>
                  <button className="btn" onClick={onFinish}>Finish bonus puzzle</button>
                </>
              )}
            </>
          )}
        </>
      )}
    </BonusShell>
  );
}
