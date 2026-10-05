// Shared pieces of the game's interface.
import { useState, useEffect } from "react";
import { COLORS, range } from "./helpers";

export function Confetti() {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 1800); return () => clearTimeout(t); }, []);
  if (!on) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {range(36).map(k => (
        <i key={k} style={{
          left: `${(k * 37) % 100}%`, background: COLORS[k % 7],
          animationDelay: `${(k % 9) * 0.04}s`,
          "--dx": `${((k * 53) % 120) - 60}px`, "--rot": `${(k * 97) % 720}deg`,
        }} />
      ))}
    </div>
  );
}

export function ChapterShell({ steps, step, onExit, reach = 0, onJump, children }) {
  return (
    <>
      <div className="topbar">
        <button className="linkish" onClick={onExit}>Back to chapters</button>
        <div className="progress" role="group" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((_, i) => (
            <button key={i} className={"dot" + (i < step ? " on" : i === step ? " now" : i <= reach ? " seen" : "")}
                    disabled={i > reach || i === step || !onJump} onClick={() => onJump(i)}
                    aria-label={`Go to step ${i + 1}`} aria-current={i === step ? "step" : undefined} />
          ))}
        </div>
      </div>
      {children}
    </>
  );
}

export function RuleButtons({ options, onPick, wrong }) {
  return (
    <div className="choices">
      {options.map(o => (
        <button key={o.id} className={"btn secondary" + (wrong === o.id ? " picked-wrong" : "")} onClick={() => onPick(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Formal({ children }) {
  return <details className="formal"><summary>The formal version</summary><div>{children}</div></details>;
}

export function Hints({ hints }) {
  const [n, setN] = useState(0);
  return (
    <div className="hints" aria-live="polite">
      {hints.slice(0, n).map((h, i) => <p key={i} className="hint"><b>Hint {i + 1}</b>{h}</p>)}
      {n < hints.length && <button className="linkish" onClick={() => setN(n + 1)}>{n === 0 ? "Need a hint?" : "Another hint"}</button>}
    </div>
  );
}

export function BonusShell({ title, onExit, children }) {
  return (
    <>
      <div className="topbar"><button className="linkish" onClick={onExit}>Back to chapters</button><span className="tag">Bonus puzzle</span></div>
      <h2>{title}</h2>
      {children}
    </>
  );
}
