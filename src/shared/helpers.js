// Small helpers and the colour palette shared by every chapter.
import { useEffect, useRef } from "react";

const WORDS = ["none", "one", "two", "three"];

export const tribeCount = n => (n <= 3 ? WORDS[n] : "many");

export const range = n => Array.from({ length: n }, (_, i) => i);

export const COLORS = ["#FF5E57", "#14B8A6", "#FFBE2E", "#8B5CF6", "#4CC35B", "#FF6FB5", "#2F8CFF"];

export const DARKER = ["#C93A35", "#0E8577", "#D9930B", "#6236C7", "#2F8F3C", "#D9468D", "#1D63C2"];

export function useTimers() {
  const t = useRef([]);
  useEffect(() => () => t.current.forEach(clearTimeout), []);
  return (fn, ms) => { t.current.push(setTimeout(fn, ms)); };
}
