// Top level: holds the save and decides which screen to show.
import { useState, useEffect } from "react";
import { ChapterMap } from "./ChapterMap";
import { BONUSES, CHAPTER_STEPS, CHAPTER_VIEWS } from "./registry";
import { SAVE_KEY, freshSave, loadSave, stepIdAt, stepIndex, writeSave } from "./save";

export function App() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState("map");
  const [saveOk, setSaveOk] = useState(true);
  useEffect(() => { setSaveOk(writeSave(save)); }, [save]);
  // Another tab saved progress: adopt it, so two open tabs don't keep overwriting each other.
  useEffect(() => {
    const onStorage = e => { if (e.key === SAVE_KEY) setSave(loadSave()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, save.steps[screen]]);

  // Chapters work in step positions; the save stores step ids. These two functions translate.
  const setStep = (id, n) => setSave(s => {
    const sid = stepIdAt(id, n);
    if (!sid) return s;
    const far = Math.max(stepIndex(id, s.reach[id]), n);
    return { ...s, steps: { ...s.steps, [id]: sid }, reach: { ...s.reach, [id]: stepIdAt(id, far) } };
  });
  const finish = id => {
    setSave(s => {
      const steps = { ...s.steps }; delete steps[id];   // replaying starts from the top
      return { ...s, steps, completed: s.completed.includes(id) ? s.completed : [...s.completed, id] };
    });
    setScreen("map");
  };

  const bonus = Object.values(BONUSES).flat().find(b => b.id === screen);
  if (bonus) {
    const B = bonus.view;
    return <B onExit={() => setScreen("map")} onFinish={() => finish(screen)} sawDiagonal={save.completed.includes("ch5")} />;
  }
  const View = CHAPTER_VIEWS[screen];
  if (View) {
    const step = stepIndex(screen, save.steps[screen]);
    const reach = save.completed.includes(screen) ? CHAPTER_STEPS[screen].length : Math.max(stepIndex(screen, save.reach[screen]), step);
    return <View step={step} setStep={n => setStep(screen, n)} reach={reach}
                 onExit={() => setScreen("map")} onFinish={() => finish(screen)}
                 extra={save.extra} setExtra={(k, v) => setSave(s => ({ ...s, extra: { ...s.extra, [k]: v } }))} />;
  }
  return <ChapterMap save={save} open={id => setScreen(id)} reset={() => setSave(freshSave())} saveOk={saveOk} />;
}
