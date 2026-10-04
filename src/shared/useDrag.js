// The one drag-and-drop hook every draggable thing uses.
import { useState, useEffect, useRef } from "react";

/* Shared drag and drop:
   useDrag(onDrop, targetAttr) powers every drag in the game.
   - down(event, item): attach to an element's onPointerDown to make it draggable. Only the primary
     button starts a drag, and the pointer must move 6px before it counts, so taps stay taps.
   - drag: { item, x, y } while dragging (render a ghost at x, y), otherwise null.
   - over: the targetAttr value of the drop target under the pointer, or null.
   - onDrop(item, target) runs once per finished drag. target is the targetAttr value under the pointer,
     or null when released away from every target. A cancelled drag (pointercancel) never calls it.
   - suppress.current is true for a moment after a drag, so check it in onClick to ignore the click
     the browser fires when the pointer is released.
   The window listeners live in a ref, so the unmount cleanup removes exactly the ones that were added. */
export function useDrag(onDrop, targetAttr) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const start = useRef(null), dropRef = useRef(onDrop), suppress = useRef(false), h = useRef(null);
  dropRef.current = onDrop;
  if (!h.current) {
    const targetAt = (x, y) => {
      const el = document.elementFromPoint(x, y), t = el && el.closest(`[${targetAttr}]`);
      return t ? t.getAttribute(targetAttr) : null;
    };
    const listen = on => ["pointermove", "pointerup", "pointercancel"].forEach((type, i) =>
      window[on ? "addEventListener" : "removeEventListener"](type, i ? h.current.up : h.current.move));
    h.current = {
      listen,
      move(e) {
        const s = start.current; if (!s) return;
        if (!s.started && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return;
        s.started = true; setDrag({ item: s.item, x: e.clientX, y: e.clientY }); setOver(targetAt(e.clientX, e.clientY));
      },
      up(e) {
        listen(false);
        const s = start.current; start.current = null;
        if (s && s.started) {
          suppress.current = true; setTimeout(() => { suppress.current = false; }, 50);
          if (e.type !== "pointercancel") dropRef.current(s.item, targetAt(e.clientX, e.clientY));
        }
        setDrag(null); setOver(null);
      },
    };
  }
  useEffect(() => () => { h.current.listen(false); start.current = null; }, []);
  function down(e, item) {
    if (e.button !== undefined && e.button !== 0) return;
    h.current.listen(false);   // never stack listeners if a previous drag didn't finish cleanly
    start.current = { x: e.clientX, y: e.clientY, item, started: false };
    h.current.listen(true);
  }
  return { drag, over, down, suppress };
}
