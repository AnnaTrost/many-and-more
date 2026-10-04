// The home screen: chapter list, bonus puzzles and the reset button.
import { useState } from "react";
import { BONUSES, CHAPTERS } from "./registry";
import { stepIndex } from "./save";

export function ChapterMap({ save, open, reset, saveOk }) {
  const [confirming, setConfirming] = useState(false);   // inline confirm: window.confirm() is blocked in some embeds
  return (
    <>
      <header className="hero">
        <h1 className="words" aria-label="One, two, three, many, and more">
          <span>one</span><span>two</span><span>three</span>
          <span className="many">many</span><span className="more">and more</span>
        </h1>
        <p className="hook-lead">Infinity is not the biggest number. There's more than one of them, and some are bigger than others.</p>
        <ul className="claims">
          <li style={{ "--c": "var(--coral)" }}>A hotel with every room full can still fit in a new guest.</li>
          <li style={{ "--c": "var(--teal)" }}>There are exactly as many even numbers as there are whole numbers.</li>
          <li style={{ "--c": "var(--violet)" }}>Some infinities are so big they can't be listed at all.</li>
        </ul>
        <p className="hook-close">Sounds impossible? By the end of this game you'll have proved every one of these yourself, starting with nothing but pots, lids, and a tribe that can only count to three.</p>
      </header>
      <ol className="chapters">
        {CHAPTERS.map((c, i) => {
          const done = save.completed.includes(c.id);
          const started = stepIndex(c.id, save.steps[c.id]) > 0;
          return (
            <li key={c.id} className={"chapter" + (c.ready ? "" : " locked")}>
              <span className="n" style={{ color: c.ready ? "var(--coral)" : "var(--muted)" }}>{i + 1}</span>
              <div><h3>{c.title}</h3><p>{c.blurb}</p>{done && <span className="badge-done">Completed</span>}
                {done && BONUSES[c.id] && (
                  <div className="bonus-list">
                    {BONUSES[c.id].map(b => (
                      <button key={b.id} className={"bonus-chip" + (save.completed.includes(b.id) ? " solved" : "")} onClick={() => open(b.id)}>
                        {save.completed.includes(b.id) ? "✓ " : "Bonus: "}{b.title}
                      </button>
                    ))}
                  </div>
                )}</div>
              <span className="act">
                {c.ready
                  ? <button className="btn" onClick={() => open(c.id)}>{done ? "Play again" : started ? "Continue" : "Play"}</button>
                  : <span className="tag">Coming soon</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="foot">
        {saveOk
          ? <span>Progress is saved in this browser.</span>
          : <span className="save-warn" role="status">This browser isn't letting the game save, so progress will be lost when you close the page.</span>}
        {confirming
          ? <span className="reset-confirm">Erase all saved progress?
              <button className="linkish" onClick={() => { reset(); setConfirming(false); }}>Yes, erase it</button>
              <button className="linkish" onClick={() => setConfirming(false)}>Keep it</button></span>
          : <button className="linkish" onClick={() => setConfirming(true)}>Reset progress</button>}
      </div>
    </>
  );
}
