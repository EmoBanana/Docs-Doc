"use client";

import { useEffect, useState } from "react";

const KEY = "docsdoc-emoji-on";

export default function EmojiToggle({ onChange }: { onChange: (on: boolean) => void }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "true" || stored === "false") {
      const val = stored === "true";
      setOn(val);
      onChange(val);
    } else {
      onChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(KEY, String(next));
    onChange(next);
  };

  return (
    <button
      onClick={toggle}
      className={
        "rounded-md px-3 py-1.5 text-xs shadow-sm transition-colors " +
        (on
          ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
          : "border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 hover:bg-white/90")
      }
    >
      {on ? "Emoji On" : "Emoji Off"}
    </button>
  );
}


