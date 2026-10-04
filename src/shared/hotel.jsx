// Hilbert's hotel: the drawing, guests, and room moves (chapters 2 and 3).
import { COLORS, range } from "./helpers";
import { useDrag } from "./useDrag";

export const SLOT = 52, VIS = 12, OLD_GUESTS = 26;

export const makeOld = () => range(OLD_GUESTS).map(i => ({ id: "g" + (i + 1), kind: "old", label: String(i + 1), n: i + 1, row: "room", col: i + 1 }));

export const makeArrivals = (labels, kind = "new") => labels.map((label, j) => ({ id: "a" + j, kind, label, j: j + 1, row: "arrive", col: j + 1 }));

// Move every current guest from room c to room f(c). Anyone sent below room 1 ends up stranded in the lobby.
export function moveOld(gs, f) {
  let stranded = gs.filter(g => g.row === "arrive").length;
  return gs.map(g => {
    if (g.kind !== "old" || g.row !== "room") return g;
    const c = f(g.col);
    if (c < 1) { stranded++; return { ...g, row: "arrive", col: stranded, delay: 0 }; }
    return { ...g, col: c, delay: Math.min(g.col, 14) * 35 };
  });
}

// Send arriving guest number j to room f(j); null leaves them waiting.
export function seatArrivals(gs, f) {
  return gs.map(g => {
    if (g.kind === "old" || g.row !== "arrive") return g;
    const r = f(g.j);
    return r ? { ...g, row: "room", col: r, delay: g.j * 60 } : g;
  });
}

function Person({ g }) {
  const c = g.kind === "old" ? COLORS[(g.n * 3) % 7] : g.kind === "ura" ? "#FF5E57" : g.kind === "house" ? (g.h > 0 ? "#14B8A6" : g.h < 0 ? "#FF5E57" : "#D9930B") : "#3C4470";
  return (
    <svg width="36" height="52" viewBox="0 0 36 52" aria-hidden="true" overflow="visible">
      <circle cx="18" cy="10" r="7.5" fill="#D99A6C" />
      {g.kind === "ura" && <><rect x="10" y="4" width="16" height="3" rx="1.5" fill="#FFBE2E" /><path d="M24 5 L29 -4 L27 6 Z" fill="#FFBE2E" /></>}
      <path d="M5 51 V31 Q5 20 18 20 Q31 20 31 31 V51 Z" fill={c} />
      {g.kind === "new" && <rect x="27" y="37" width="9" height="12" rx="2" fill="#C9773B" stroke="#8F4E22" />}
      <text x="18" y="41" textAnchor="middle" fontSize={g.label.length > 2 ? 8.5 : 11} fontWeight="700" fill="#fff"
            fontFamily="Figtree, system-ui, sans-serif">{g.label}</text>
    </svg>
  );
}

export function Hotel({ guests, arrivingMore, place = "lobby", nextRoom, onSend }) {
  const occ = new Set(guests.filter(g => g.row === "room").map(g => g.col));
  const count = {}, stack = {};
  guests.forEach(g => { if (g.row === "room") { stack[g.id] = count[g.col] || 0; count[g.col] = (count[g.col] || 0) + 1; } });

  // Drag a waiting guest onto the rooms row to send them in (tap works too).
  const { drag: dragging, over: overTarget, down, suppress } = useDrag(
    (g, target) => { if (target !== null && onSend) onSend(g); }, "data-rooms");
  const drag = dragging && { g: dragging.item, x: dragging.x, y: dragging.y };
  const over = overTarget !== null;

  return (
    <div className="hotel-wrap">
      <div className="hotel" style={{ width: VIS * SLOT + 64 }}>
        <div className="arrive-row" />
        <span className="hall-note" style={{ left: VIS * SLOT + 6, top: 30 }}>{arrivingMore ? "… " + place : place}</span>
        <div className={"rooms-row" + (over ? " hot" : "")} data-rooms="1">
          {range(VIS).map(i => (
            <div key={i} className={"door" + (occ.has(i + 1) ? (count[i + 1] > 1 ? " clash" : "") : " empty") + (nextRoom === i + 1 ? " next" : "")} style={{ left: i * SLOT }}>
              <span className="num">{i + 1}</span>
            </div>
          ))}
        </div>
        <span className="hall-note dots" style={{ left: VIS * SLOT + 8, top: 128 }}>…</span>
        {guests.map(g => {
          const vis = g.col >= 1 && g.col <= VIS;
          const x = vis ? (g.col - 1) * SLOT + 8 : VIS * SLOT + 16;
          const y = g.row === "room" ? 132 - (stack[g.id] || 0) * 18 : 16;
          const style = { left: x, top: y, opacity: vis ? (drag && drag.g.id === g.id ? 0.25 : 1) : 0, transitionDelay: (g.delay || 0) + "ms" };
          if (onSend && g.row === "arrive" && vis) {
            return (
              <button key={g.id} className="guest grab" style={style}
                      onPointerDown={e => down(e, g)}
                      onClick={() => { if (!suppress.current) onSend(g); }}
                      aria-label={`Send house ${g.label} to the next room`}>
                <Person g={g} />
              </button>
            );
          }
          return <div key={g.id} className="guest" style={style}><Person g={g} /></div>;
        })}
      </div>
      {drag && <div className="ghost" style={{ left: drag.x, top: drag.y }}><Person g={drag.g} /></div>}
    </div>
  );
}

export function HotelChecks({ guests, infinite }) {
  const waiting = guests.filter(g => g.row === "arrive").length;
  const occ = new Set(guests.filter(g => g.row === "room").map(g => g.col));
  const empty = range(VIS).map(i => i + 1).filter(r => !occ.has(r));
  const per = {};
  guests.forEach(g => { if (g.row === "room" && g.col <= VIS) per[g.col] = (per[g.col] || 0) + 1; });
  const shared = Object.keys(per).filter(r => per[r] > 1);
  return (
    <div className="checks" aria-live="polite">
      {shared.length > 0 && <span className="bad">Shared rooms: {shared.join(", ")}</span>}
      <span className={waiting ? "no" : "yes"}>
        {waiting ? `Waiting in the lobby: ${infinite ? "infinitely many" : waiting}` : "Nobody is left waiting"}
      </span>
      <span className={empty.length ? "no" : "yes"}>
        {empty.length ? `Empty rooms: ${empty.join(", ")}${infinite && empty.length > 3 ? ", …" : ""}` : "No empty rooms"}
      </span>
    </div>
  );
}
