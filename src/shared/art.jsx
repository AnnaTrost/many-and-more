// Drawings: lids, pots and character faces.
import { COLORS, DARKER } from "./helpers";

function LidShape({ i }) {
  const shape = (i * 2 + 1) % 5;
  const c = COLORS[(i * 3 + 2) % 7], d = DARKER[(i * 3 + 2) % 7];
  switch (shape) {
    case 0: return (<g>
      <path d="M11 36 Q40 4 69 36 Z" fill={c} />
      <circle cx="40" cy="13" r="5.5" fill={d} />
      <path d="M22 28 Q40 18 58 28" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
      <ellipse cx="40" cy="36" rx="29" ry="4" fill={d} /></g>);
    case 1: return (<g>
      <path d="M30 28 C30 12, 50 12, 50 28" stroke={d} strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="9" y="26" width="62" height="11" rx="5.5" fill={c} />
      {[18, 30, 42, 54, 64].map(x => <circle key={x} cx={x} cy="31.5" r="2" fill="#fff" opacity=".7" />)}</g>);
    case 2: return (<g>
      <path d="M12 36 L40 6 L68 36 Z" fill={c} />
      <path d="M26 21 L54 21" stroke="#fff" strokeWidth="3" opacity=".55" />
      <circle cx="40" cy="6" r="4.5" fill={d} />
      <ellipse cx="40" cy="36" rx="28" ry="4" fill={d} /></g>);
    case 3: return (<g>
      <path d="M7 35 Q40 -2 73 35 Z" fill={c} />
      <circle cx="28" cy="22" r="4" fill="#fff" opacity=".8" /><circle cx="46" cy="16" r="3" fill="#fff" opacity=".8" />
      <circle cx="56" cy="27" r="3.5" fill="#fff" opacity=".8" />
      <ellipse cx="40" cy="35.5" rx="33" ry="4" fill={d} /></g>);
    default: return (<g>
      <rect x="11" y="27" width="58" height="10" rx="4" fill={d} />
      <rect x="21" y="17" width="38" height="11" rx="4" fill={c} />
      <rect x="32" y="8" width="16" height="10" rx="4" fill={d} />
      <rect x="25" y="21" width="30" height="3" rx="1.5" fill="#fff" opacity=".55" /></g>);
  }
}

export function Lid({ i, w = 58 }) {
  return <svg width={w} height={w * 0.5} viewBox="0 0 80 40" aria-hidden="true"><LidShape i={i} /></svg>;
}

const POT_SHAPES = [
  { body: "M24 36 C2 52, 4 106, 40 106 C76 106, 78 52, 56 36 Z", rim: 17 },
  { body: "M30 36 C28 52, 12 60, 14 84 C16 102, 28 106, 40 106 C52 106, 64 102, 66 84 C68 60, 52 52, 50 36 Z", rim: 12 },
  { body: "M14 36 C6 70, 14 102, 40 102 C66 102, 74 70, 66 36 Z", rim: 27, feet: true },
  { body: "M28 36 C26 46, 8 54, 10 76 C12 98, 26 106, 40 106 C54 106, 68 98, 70 76 C72 54, 54 46, 52 36 Z", rim: 13, handles: true },
  { body: "M20 36 L60 36 C66 50, 70 70, 62 92 C58 102, 50 106, 40 106 C30 106, 22 102, 18 92 C10 70, 14 50, 20 36 Z", rim: 21 },
];

function Pattern({ kind }) {
  const W = "rgba(255,255,255,.78)";
  switch (kind) {
    case 0: return <g fill={W}><rect x="0" y="58" width="80" height="5" /><rect x="0" y="70" width="80" height="3" /><rect x="0" y="80" width="80" height="5" /></g>;
    case 1: return <polyline points="0,72 8,62 16,72 24,62 32,72 40,62 48,72 56,62 64,72 72,62 80,72" stroke={W} strokeWidth="4" fill="none" strokeLinejoin="round" />;
    case 2: return <g fill={W}>{[52, 66, 80, 94].flatMap((y, r) => [8, 22, 36, 50, 64, 78].map(x => <circle key={x + "-" + y} cx={x + (r % 2) * 7} cy={y} r="3" />))}</g>;
    case 3: return <g stroke={W} strokeWidth="3.5" fill="none"><path d="M0 62 Q10 54 20 62 T40 62 T60 62 T80 62" /><path d="M0 80 Q10 72 20 80 T40 80 T60 80 T80 80" /></g>;
    default: return <g><rect x="0" y="60" width="80" height="16" fill="rgba(0,0,0,.18)" />
      <g fill={W}>{[0, 16, 32, 48, 64].map(x => <path key={x} d={`M${x} 76 L${x + 8} 62 L${x + 16} 76 Z`} />)}</g></g>;
  }
}

function PotShape({ i, uid }) {
  const s = POT_SHAPES[i % 5];
  const c = COLORS[(i * 2) % 7], d = DARKER[(i * 2) % 7];
  const clip = `potclip-${uid}`;
  return (
    <g>
      {s.handles && <g stroke={d} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M27 42 C10 40, 6 56, 14 62" /><path d="M53 42 C70 40, 74 56, 66 62" /></g>}
      {s.feet && <g fill={d}><rect x="20" y="98" width="10" height="9" rx="3" /><rect x="50" y="98" width="10" height="9" rx="3" /></g>}
      <defs><clipPath id={clip}><path d={s.body} /></clipPath></defs>
      <path d={s.body} fill={c} />
      <g clipPath={`url(#${clip})`}>
        <Pattern kind={(i * 3 + 1) % 5} />
        <ellipse cx="24" cy="66" rx="6" ry="20" fill="#fff" opacity=".22" />
      </g>
      <ellipse cx="40" cy="36" rx={s.rim + 3} ry="5" fill={d} />
      <ellipse cx="40" cy="36" rx={s.rim - 2} ry="2.6" fill="rgba(0,0,0,.35)" />
    </g>
  );
}

export function Pot({ i, lid, animate, w = 66, uid }) {
  return (
    <svg width={w} height={w * 110 / 80} viewBox="0 0 80 110" aria-hidden="true">
      <g className={animate ? "pot-wiggle" : ""}>
        <PotShape i={i} uid={uid ?? i} />
        {lid !== undefined && lid !== null && <g key={lid} className={animate ? "lid-drop" : ""}><LidShape i={lid} /></g>}
      </g>
    </svg>
  );
}

export function Face({ who }) {
  const bg = who === "Ura" ? "#FFD3E6" : who === "Mira" ? "#E3DCFF" : "#CFF5EE";
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="24" cy="24" r="23" fill={bg} />
      {who === "Mira" && <circle cx="24" cy="10" r="7" fill="#3A2416" />}
      <circle cx="24" cy="27" r="14" fill={who === "Mira" ? "#C98A5E" : "#B5764A"} />
      {who === "Ura" && <><path d="M10 22 Q24 6 38 22 Q30 14 24 15 Q18 14 10 22 Z" fill="#2B1B12" />
            <rect x="11" y="17" width="26" height="4" rx="2" fill="#FF5E57" />
            <path d="M33 17 L40 4 L37 18 Z" fill="#FFBE2E" /></>}
      {who === "Mira" && <><path d="M10 25 Q12 12 24 13 Q36 12 38 25 Q32 17 24 17 Q16 17 10 25 Z" fill="#3A2416" />
            <circle cx="19" cy="26" r="4.5" fill="none" stroke="#1C2340" strokeWidth="1.6" />
            <circle cx="29" cy="26" r="4.5" fill="none" stroke="#1C2340" strokeWidth="1.6" />
            <path d="M23.5 26 H24.5" stroke="#1C2340" strokeWidth="1.6" /></>}
      {who !== "Ura" && who !== "Mira" && <><path d="M12 30 Q24 48 36 30 Q34 40 24 41 Q14 40 12 30 Z" fill="#EDEDED" />
            <path d="M12 22 Q24 10 36 22" stroke="#EDEDED" strokeWidth="4" fill="none" /></>}
      <circle cx="19" cy="26" r="2" fill="#1C2340" /><circle cx="29" cy="26" r="2" fill="#1C2340" />
      {who !== "Elder Tano" && <path d="M19 32 Q24 36 29 32" stroke="#1C2340" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

export function Say({ who, children }) {
  return <div className="say"><Face who={who} /><div className="bubble"><span className="who">{who}</span>{children}</div></div>;
}
