// Bonus puzzle: line
import { useState, useRef } from "react";
import { Say } from "../shared/art";
import { BonusShell, Confetti, Formal, Hints } from "../shared/ui";

export function BonusLine({ onExit, onFinish }) {
  const [th, setTh] = useState(1.1);
  const [found, setFound] = useState({ far: false, neg: false, zero: false });
  const [pick, setPick] = useState(null);
  const svgRef = useRef(null), dragging = useRef(false);
  const C = { x: 320, y: 120 }, R = 100, LY = 220;
  const P = { x: C.x - R * Math.cos(th), y: C.y + R * Math.sin(th) };
  const v = -2 / Math.tan(th);                       // line coordinate: 50px per unit
  const hitX = C.x + 50 * v;
  const onScreen = hitX >= 8 && hitX <= 632;
  const k = onScreen ? (LY - C.y) / (P.y - C.y) : 312 / Math.abs(P.x - C.x);
  const E = { x: C.x + (P.x - C.x) * k, y: C.y + (P.y - C.y) * k };
  function setFrom(e) {
    const r = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) * 640 / r.width, y = (e.clientY - r.top) * 250 / r.height;
    let t = Math.atan2(Math.max(y - C.y, 0.001), -(x - C.x));
    t = Math.min(Math.PI - 0.012, Math.max(0.012, t));
    setTh(t);
    const val = -2 / Math.tan(t);
    setFound(f => ({ far: f.far || val > 10, neg: f.neg || val < -10, zero: f.zero || Math.abs(val) < 0.05 }));
  }
  const missions = found.far && found.neg && found.zero;
  return (
    <BonusShell title="The whole line in a tiny piece" onExit={onExit}>
      <p>The number line goes on forever in both directions. The numbers between 0 and 1 fit in a piece you could cover with your thumb.
         Surely the whole line has more points? Bend the piece into a half-circle, sit it on the line, and shine a light from its centre.</p>
      <div className="figure">
        <svg ref={svgRef} viewBox="0 0 640 250" width="100%" style={{ touchAction: "none", cursor: "grab" }}
             onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFrom(e); }}
             onPointerMove={e => dragging.current && setFrom(e)} onPointerUp={() => { dragging.current = false; }}
             role="img" aria-label="Half circle above a number line, with a ray from the centre through a point on the arc">
          <line x1="0" y1={LY} x2="640" y2={LY} stroke="var(--muted)" strokeWidth="3" />
          {[-6, -4, -2, 0, 2, 4, 6].map(n => (
            <g key={n}><line x1={C.x + 50 * n} y1={LY - 5} x2={C.x + 50 * n} y2={LY + 5} stroke="var(--muted)" strokeWidth="2" />
              <text x={C.x + 50 * n} y={LY + 24} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--muted)">{n < 0 ? "−" + -n : n}</text></g>
          ))}
          <text x="6" y={LY - 10} fontSize="18" fill="var(--violet)">…</text><text x="618" y={LY - 10} fontSize="18" fill="var(--violet)">…</text>
          <path d={`M ${C.x - R} ${C.y} A ${R} ${R} 0 0 0 ${C.x + R} ${C.y}`} fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round" />
          <circle cx={C.x - R} cy={C.y} r="6" fill="var(--card)" stroke="var(--teal)" strokeWidth="3" />
          <circle cx={C.x + R} cy={C.y} r="6" fill="var(--card)" stroke="var(--teal)" strokeWidth="3" />
          <circle cx={C.x} cy={C.y} r="7" fill="var(--sun)" />
          <line x1={C.x} y1={C.y} x2={E.x} y2={E.y} stroke="var(--sun)" strokeWidth="3" strokeDasharray="6 5" />
          <circle cx={P.x} cy={P.y} r="11" fill="var(--teal)" stroke="var(--card)" strokeWidth="3" />
          {onScreen && <circle cx={hitX} cy={LY} r="9" fill="var(--coral)" />}
          {!onScreen && <text x={hitX < 0 ? 12 : 628} y={E.y - 10} textAnchor={hitX < 0 ? "start" : "end"} fontSize="14" fontWeight="800" fill="var(--coral)">
            {hitX < 0 ? "← off the screen" : "off the screen →"}</text>}
        </svg>
        <p className="grid-note">Drag the teal point along the half-circle. It is {(th / Math.PI).toFixed(3)} of the way along, and its partner on the line is <b>{v.toFixed(2)}</b>.</p>
      </div>
      <ul className="missions">
        <li className={found.far ? "ok" : ""}>Reach a line point past 10</li>
        <li className={found.neg ? "ok" : ""}>Reach a line point below −10</li>
        <li className={found.zero ? "ok" : ""}>Find the arc point that lands on 0</li>
      </ul>
      {!missions && <Hints hints={["To travel far along the line, move the teal point close to one end of the arc.", "Zero is directly below the light."]} />}
      {missions && (
        <>
          <Say who="Mira">Every point on the arc sends its ray to exactly one point on the line, and every point on the line sends a ray back. Almost. Which points of the arc have no partner at all?</Say>
          <div className="choices">
            {[["ends", "The two endpoints: their rays run flat and never touch the line"], ["bottom", "The bottom of the arc"], ["none", "None, every point has a partner"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (pick === id && id !== "ends" ? " picked-wrong" : "")} disabled={pick === "ends"} onClick={() => setPick(id)}>{label}</button>
            ))}
          </div>
          {pick === "bottom" && <div className="feedback bad"><p>The bottom of the arc sits right on 0. Look at the open circles at either end.</p></div>}
          {pick === "none" && <div className="feedback bad"><p>Drag right up to an end. The ray gets flatter and flatter. What happens at the very end?</p></div>}
          {pick === "ends" && (
            <>
              <Confetti />
              <div className="feedback good"><p>Right. Leave out the two endpoints, and the arc and the line match perfectly. The arc is just the numbers between 0 and 1 bent into shape,
                 so a piece you could cover with your thumb has exactly as many points as the entire infinite line: both are 𝔠. And the two missing endpoints?
                 Chapter 6's hidden hotel can absorb them.</p></div>
              <Formal><p>The map f(t) = tan(π(t − ½)) is a bijection from the open interval (0, 1) to ℝ. Combined with 𝔠 + ℵ₀ = 𝔠, every interval with at least two points,
                 open or closed, has size 𝔠.</p></Formal>
              <button className="btn" onClick={onFinish}>Finish bonus puzzle</button>
            </>
          )}
        </>
      )}
    </BonusShell>
  );
}
