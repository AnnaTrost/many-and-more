// Bonus puzzle: catalogue
import { useState } from "react";
import { Say } from "../shared/art";
import { BonusShell, Confetti, Formal, Hints } from "../shared/ui";

const CATALOGUES = [
  { id: "red", name: "Catalogue of red-covered books", note: "Its own cover is red.", self: true },
  { id: "poem", name: "Catalogue of poetry books", note: "It's a list, not a poem.", self: false },
  { id: "cats", name: "Catalogue of all catalogues", note: "It is a catalogue.", self: true },
  { id: "thick", name: "Catalogue of books over 500 pages", note: "It's 12 pages long.", self: false },
];

export function BonusCatalogue({ onExit, onFinish }) {
  const [marks, setMarks] = useState([]);
  const [phase, setPhase] = useState("sort");      // sort, rebel
  const [err, setErr] = useState(null);
  const [tried, setTried] = useState([]);
  const [pick, setPick] = useState(null);
  function check() {
    const w = CATALOGUES.find(c => c.self !== marks.includes(c.id));
    if (!w) { setErr(null); setPhase("rebel"); return; }
    setErr(`Look again at the ${w.name.toLowerCase()}. ${w.note}`);
  }
  const outcome = {
    yes: "Then the Rebel Catalogue lists itself. But it only lists catalogues that don't list themselves, so it must not be on its own list. Contradiction.",
    no: "Then the Rebel Catalogue doesn't list itself. That makes it exactly the kind of catalogue it promises to list, so it must be on its own list. Contradiction.",
  };
  return (
    <BonusShell title="The catalogue of catalogues" onExit={onExit}>
      <p>Mira also runs the hotel library. Some of its books are catalogues: lists of other books. A catalogue can even list itself.</p>
      {phase === "sort" && (
        <>
          <Say who="Mira">Which of these catalogues belong on their own list? Tap the ones that list themselves.</Say>
          <div className="catshelf">
            {CATALOGUES.map(c => (
              <button key={c.id} className={"cat" + (marks.includes(c.id) ? " on" : "")} aria-pressed={marks.includes(c.id)}
                      onClick={() => setMarks(m => (m.includes(c.id) ? m.filter(x => x !== c.id) : [...m, c.id]))}>
                <b>{c.name}</b><small>{c.note}</small><span>{marks.includes(c.id) ? "lists itself" : "doesn't list itself"}</span>
              </button>
            ))}
          </div>
          <button className="btn" onClick={check}>Check</button>
          {err && <div className="feedback bad"><p>{err}</p></div>}
        </>
      )}
      {phase !== "sort" && (
        <>
          <div className="feedback good"><p>The catalogues of red books and of all catalogues list themselves; the other two don't.</p></div>
          <Say who="Mira">Now I'm writing the Rebel Catalogue. It lists every catalogue that does not list itself: the poetry one, the 500-page one, and so on. My question: should the Rebel Catalogue list itself?</Say>
          <div className="choices">
            {[["yes", "Yes, list it"], ["no", "No, leave it out"]].map(([id, label]) => (
              <button key={id} className={"btn secondary" + (tried.includes(id) ? " picked-wrong" : "")} onClick={() => setTried(t => (t.includes(id) ? t : [...t, id]))}>{label}</button>
            ))}
          </div>
          {tried.map(id => <div key={id} className="feedback bad"><p>{outcome[id]}</p></div>)}
          {tried.length === 2 && (
            <>
              <Say who="Mira">Both answers break the rule. This is the rebel club from chapter 6 again, and it was discovered by Bertrand Russell in 1901.
                Here's what it tells us. Could there be a collection of absolutely everything, every number, every club, every collection?</Say>
              <div className="choices">
                {[["no", "No: its subsets would be things too, so they'd sit inside it, yet subsets always outnumber the collection"],
                  ["big", "Yes, it would be the biggest infinity"],
                  ["c", "Yes, and its size would be 𝔠"]].map(([id, label]) => (
                  <button key={id} className={"btn secondary" + (pick === id && id !== "no" ? " picked-wrong" : "")} disabled={pick === "no"} onClick={() => setPick(id)}>{label}</button>
                ))}
              </div>
              {pick === "big" && <div className="feedback bad"><p>The chapter just showed there is no biggest infinity. What would happen if you took all the subsets of "everything"?</p></div>}
              {pick === "c" && <div className="feedback bad"><p>𝔠 can't be it: the subsets of the real numbers already outnumber 𝔠.</p></div>}
              {pick !== "no" && <Hints hints={["A subset of everything is itself a thing, so it must be inside everything.", "Then 'everything' would contain all of its own subsets. What does Cantor's theorem say about that?"]} />}
              {pick === "no" && (
                <>
                  <Confetti />
                  <div className="feedback good"><p>Exactly. A collection of everything would contain all its own subsets, so it would be at least as big as them, but Cantor's theorem says its subsets are
                     always strictly more. So "everything" is too big to be a collection at all. Mathematicians had to rebuild the rules of collections to steer around this.</p></div>
                  <Formal><p>Russell's paradox: R = {"{x : x ∉ x}"} gives R ∈ R ⇔ R ∉ R. Cantor's paradox: a universal set V would satisfy 𝒫(V) ⊆ V, so |𝒫(V)| ≤ |V|, contradicting
                     Cantor's theorem. Modern set theory (ZFC) only lets you form {"{x ∈ A : φ(x)}"} inside an existing set A, so neither R nor V is a set.</p></Formal>
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
