"use client";

import { useState } from "react";

export type Tab = {
  key: string;
  label: string;
};

export default function TabSwitcher({
  tabs,
  onChange,
  initialKey,
}: {
  tabs: Tab[];
  onChange: (key: string) => void;
  initialKey?: string;
}) {
  const [active, setActive] = useState(initialKey ?? tabs[0]?.key);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10">
        {tabs.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => {
                setActive(t.key);
                onChange(t.key);
              }}
              className={
                "px-3 py-2 text-sm rounded-t-md " +
                (selected
                  ? "bg-blue-600 text-white"
                  : "bg-white/60 dark:bg-white/5 hover:bg-white/80")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


