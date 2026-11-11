"use client";

import type { Option } from "@/content/tests";

/**
 * Answer options for single- or multi-select items.
 * After `revealed`, the correct options turn green and wrong picks turn red.
 */
export function Options({
  name,
  options,
  multiple = false,
  value,
  onChange,
  revealed = false,
  correct,
}: {
  name: string;
  options: Option[];
  multiple?: boolean;
  value: string | string[] | null;
  onChange: (v: string | string[]) => void;
  revealed?: boolean;
  correct?: string | string[];
}) {
  const picked = (id: string) => (Array.isArray(value) ? value.includes(id) : value === id);
  const isRight = (id: string) => (Array.isArray(correct) ? correct.includes(id) : correct === id);

  return (
    <div role={multiple ? "group" : "radiogroup"} className="grid gap-2">
      {options.map((o) => {
        const on = picked(o.id);
        let tone = on ? "border-ink bg-tray" : "border-line bg-tray hover:border-muted";
        if (revealed && isRight(o.id)) tone = "border-leaf bg-[color-mix(in_srgb,var(--leaf)_8%,white)]";
        else if (revealed && on) tone = "border-wrong bg-[color-mix(in_srgb,var(--wrong)_7%,white)]";
        return (
          <label
            key={o.id}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-[16px] transition-colors ${tone} ${revealed ? "cursor-default" : ""}`}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              checked={on}
              disabled={revealed}
              onChange={() => {
                if (!multiple) return onChange(o.id);
                const cur = Array.isArray(value) ? value : [];
                onChange(on ? cur.filter((x) => x !== o.id) : [...cur, o.id]);
              }}
              className="h-4 w-4 shrink-0 accent-[var(--ink)]"
            />
            <span className="flex-1">{o.text}</span>
            {revealed && isRight(o.id) && <span className="text-[13px] font-semibold text-leaf">Correct</span>}
            {revealed && on && !isRight(o.id) && (
              <span className="text-[13px] font-semibold text-wrong">Your pick</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
