import React, { createContext, useContext, useEffect, useState } from "react";
import { Chart } from "chart.js";
const Context = createContext();
const key = "taih-reading-size-v1";
export function ReadingProvider({ children }) {
  const [size, setSize] = useState(() => {
    try {
      const n = Number(localStorage.getItem(key));
      return [100, 110, 120, 130, 140, 150].includes(n) ? n : 100;
    } catch {
      return 100;
    }
  });
  useEffect(() => {
    document.documentElement.style.setProperty("--reading-scale", size / 100);
    Chart.defaults.font.size = (12 * size) / 100;
    for (const chart of Object.values(Chart.instances)) chart.update("none");
    try {
      localStorage.setItem(key, String(size));
    } catch {}
  }, [size]);
  return (
    <Context.Provider value={{ size, setSize }}>{children}</Context.Provider>
  );
}
export function ReadingControls() {
  const { size, setSize } = useContext(Context);
  return (
    <div className="reading-controls" role="group" aria-label="閱讀字體大小">
      <span>字體大小</span>
      <button
        aria-label="縮小字體"
        disabled={size === 100}
        onClick={() => setSize((s) => Math.max(100, s - 10))}
      >
        A−
      </button>
      <output aria-live="polite" aria-label="目前字體大小">
        {size}%
      </output>
      <button
        aria-label="放大字體"
        disabled={size === 150}
        onClick={() => setSize((s) => Math.min(150, s + 10))}
      >
        A＋
      </button>
      <button
        className="reading-reset"
        aria-label="恢復預設字體大小"
        disabled={size === 100}
        onClick={() => setSize(100)}
      >
        重設
      </button>
    </div>
  );
}
