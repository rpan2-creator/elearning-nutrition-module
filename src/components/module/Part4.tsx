"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";
import { track } from "@/lib/track";
import { Explain, Practice } from "./Practice";
import { RoleChip } from "./Part1";

/* 4.1 — the plate as a reference, and three rules */
export function PlateModel({ onDone }: { onDone: () => void }) {
  useEffect(onDone, [onDone]);
  const R = 90;
  const arc = (from: number, to: number) => {
    const a0 = (from - 0.25) * 2 * Math.PI;
    const a1 = (to - 0.25) * 2 * Math.PI;
    const large = to - from > 0.5 ? 1 : 0;
    return `M100 100 L${100 + R * Math.cos(a0)} ${100 + R * Math.sin(a0)} A${R} ${R} 0 ${large} 1 ${100 + R * Math.cos(a1)} ${100 + R * Math.sin(a1)} Z`;
  };
  const slices = [
    { from: 0, to: 0.5, color: "var(--fiber)", label: "Vegetables & fruit" },
    { from: 0.5, to: 0.75, color: "var(--carb)", label: "Whole grains" },
    { from: 0.75, to: 1, color: "var(--protein)", label: "Protein" },
  ];
  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-start">
      <figure>
        <svg viewBox="0 0 200 200" className="w-56" role="img" aria-label="A plate: half vegetables and fruit, a quarter whole grains, a quarter protein">
          <circle cx="100" cy="100" r="98" fill="white" stroke="var(--line)" />
          {slices.map((s, i) => (
            <motion.path
              key={s.label}
              d={arc(s.from, s.to)}
              fill={s.color}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.2 }}
              style={{ transformOrigin: "100px 100px" }}
            />
          ))}
          <circle cx="100" cy="100" r="98" fill="none" stroke="white" strokeWidth="6" />
        </svg>
        <figcaption className="mt-3 grid gap-1 text-[13px]">
          {slices.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--fat)" }} />
            Plus some healthy fat, like oil or avocado
          </span>
        </figcaption>
      </figure>
      <div>
        <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
          A plate like this (based on the Harvard Healthy Eating Plate) is a general reference, not a prescription. Athletes, people with
          health conditions, and people with different goals may need different proportions.
        </p>
        <ol className="mt-6 grid max-w-[62ch] gap-3">
          {[
            ["Add what's missing.", "If a role is absent or tiny, add a food that plays it."],
            ["Swap within a role.", "If a food isn't available, choose another that plays the same role — beans for chicken, potato for rice."],
            ["Adjust amounts before removing.", "Often the fix is a smaller or larger portion, not deleting a whole food group."],
          ].map(([t, b], i) => (
            <li key={t} className="grid grid-cols-[32px_1fr] gap-3 rounded-2xl bg-tray p-4">
              <span className="font-display text-[24px] font-bold leading-none text-leaf">{i + 1}</span>
              <span className="text-[15px] leading-relaxed">
                <strong>{t}</strong> {b}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* 4.2 — fix a pasta plate */
const CHANGES: { id: string; label: string; adds: Macro[]; removes: Macro[]; note: string }[] = [
  { id: "protein", label: "Add a palm of chicken or ½ cup beans", adds: ["protein"], removes: [], note: "Adds the missing protein." },
  { id: "veg", label: "Add a fist of roasted vegetables", adds: ["fiber"], removes: [], note: "Adds fiber and volume with little energy." },
  { id: "remove", label: "Remove the pasta", adds: [], removes: ["carb"], note: "Tradeoff: removes the meal's main energy source, which matters before afternoon practice." },
  { id: "sauce", label: "Add more tomato sauce", adds: [], removes: [], note: "Adds flavor and a little vegetable, but doesn't fill a missing role." },
  { id: "juice", label: "Add a glass of juice", adds: [], removes: [], note: "Adds more carbohydrate (mostly sugar) to a plate that already has plenty." },
];

export function PlateFix({ onDone }: { onDone: () => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [explained, setExplained] = useState(false);
  const shownAt = useRef(performance.now());

  const roles = new Set<Macro>(["carb"]);
  for (const c of CHANGES.filter((c) => chosen.includes(c.id))) {
    c.adds.forEach((r) => roles.add(r));
    c.removes.forEach((r) => roles.delete(r));
  }
  const best = chosen.length === 2 && chosen.includes("protein") && chosen.includes("veg");

  return (
    <div className="max-w-2xl">
      <p className="text-[17px] leading-relaxed text-muted">
        Your lunch: a large plate of pasta with a little tomato sauce. You have practice later this afternoon. Pick <strong className="text-ink">two</strong> changes.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-tray p-4" aria-live="polite">
        <span className="mr-1 text-[14px] text-muted">Roles on the plate:</span>
        {(["carb", "protein", "fiber", "fat"] as Macro[]).map((r) => (
          <motion.span
            key={r}
            animate={{ opacity: roles.has(r) ? 1 : 0.25, scale: roles.has(r) ? 1 : 0.95 }}
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-white"
            style={{ background: MACRO[r].color }}
          >
            {MACRO[r].label}
          </motion.span>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {CHANGES.map((c) => {
          const on = chosen.includes(c.id);
          return (
            <button
              key={c.id}
              disabled={checked || (!on && chosen.length >= 2)}
              aria-pressed={on}
              onClick={() => {
                const next = on ? chosen.filter((x) => x !== c.id) : [...chosen, c.id];
                setChosen(next);
                track({ phase: "learn", screen: "4.2-plate", event_type: "click", item_id: `plate-${c.id}`, kc: "plate_adjust", response: next });
              }}
              className={`rounded-2xl border px-4 py-3 text-left text-[15px] transition-colors disabled:cursor-not-allowed ${on ? "border-ink bg-tray" : "border-line bg-tray hover:border-muted disabled:opacity-50"}`}
            >
              <span className="font-medium">{c.label}</span>
              {checked && on && <span className="mt-1 block text-[14px] text-muted">{c.note}</span>}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button
          disabled={chosen.length !== 2}
          onClick={() => {
            setChecked(true);
            track({ phase: "learn", screen: "4.2-plate", event_type: "answer", item_id: "4.2-plate", kc: "plate_adjust", response: chosen, correct: best, duration_ms: performance.now() - shownAt.current });
          }}
          className="mt-5 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
        >
          Check my plate
        </button>
      ) : (
        <div className={`mt-5 rounded-2xl p-4 text-[15px] leading-relaxed ${best ? "bg-[color-mix(in_srgb,var(--leaf)_10%,white)]" : "bg-[color-mix(in_srgb,var(--carb)_10%,white)]"}`}>
          <p className="font-semibold">{best ? "A balanced fix." : "One possible stronger option"}</p>
          <p className="mt-1">
            {best
              ? "You kept the pasta for energy and added the two missing roles: protein and vegetables."
              : "Adding a protein source and a fist of vegetables fills both missing roles while keeping the pasta's energy for practice."}
          </p>
        </div>
      )}

      {checked && (
        <div className="mt-10">
          <Explain
            id="4.2-why"
            kc="causal_justification"
            prompt="Explain one of the changes in a sentence."
            placeholder="Adding chicken gives the plate … which …"
            example="Adding a palm of chicken gives the plate a protein source, which the pasta alone lacked and which helps the meal keep me full until practice."
            onDone={() => {
              if (!explained) {
                setExplained(true);
                onDone();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

/* 4.3 — pairing snacks */
export function SnackPairs({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const items = [
    {
      id: "4.3-crackers",
      kc: "snack_pairing" as const,
      image: "/food/crackers.jpg",
      prompt: "You have whole-wheat crackers. Which addition makes it a carbohydrate + protein snack?",
      options: [
        { id: "a", text: "A cheese stick" },
        { id: "b", text: "A handful of pretzels" },
        { id: "c", text: "A juice box" },
        { id: "d", text: "More crackers" },
      ],
      correct: "a",
      explain: "Crackers are the carbohydrate; a cheese stick adds protein. In general, pairing the two makes a snack more satisfying.",
    },
    {
      id: "4.3-jerky",
      kc: "snack_pairing" as const,
      image: "/food/apple-jerky.jpg",
      prompt: "You have beef jerky. Which addition brings in a carbohydrate source?",
      options: [
        { id: "a", text: "A hard-boiled egg" },
        { id: "b", text: "An apple" },
        { id: "c", text: "A cheese stick" },
        { id: "d", text: "More jerky" },
      ],
      correct: "b",
      explain: "Jerky is mostly protein. An apple adds carbohydrate and fiber, which jerky lacks.",
    },
    {
      id: "4.3-yogurt",
      kc: "snack_pairing" as const,
      image: "/food/yogurt.jpg",
      prompt: "You're adding yogurt to a bowl of berries. Which choice adds the most protein for the same cup size?",
      options: [
        { id: "a", text: "Flavored regular yogurt" },
        { id: "b", text: "Plain regular yogurt" },
        { id: "c", text: "Plain Greek yogurt" },
        { id: "d", text: "They are all the same" },
      ],
      correct: "c",
      explain: "Plain Greek yogurt usually has the most protein. Flavored versions often add sugar without adding protein.",
    },
  ];
  const [explained, setExplained] = useState(false);
  return (
    <div className="max-w-xl">
      <p className="text-[17px] leading-relaxed text-muted">
        A simple principle from a registered dietitian: <strong className="text-ink">in general, pair a carbohydrate with a protein.</strong>{" "}
        Carbohydrate gives quick energy; protein, fat, and fiber slow digestion (gastric emptying), so the snack tends to last longer.
      </p>
      <div className="mt-4 flex gap-2">
        <RoleChip role="carb" />
        <span className="text-[18px]">+</span>
        <RoleChip role="protein" />
      </div>
      <div className="mt-8 grid gap-10">
        {items.slice(0, step + 1).map((it, i) => (
          <Practice key={it.id} item={it} onDone={() => setStep((s) => Math.max(s, i + 1))} />
        ))}
        {step >= items.length && (
          <Explain
            id="4.3-why"
            kc="causal_justification"
            prompt="Pick one snack above and explain why the pairing works."
            placeholder="Adding … gives … which …"
            example="Adding a cheese stick to crackers gives the snack protein, which pairs with the crackers' carbohydrate and usually keeps me full longer between classes."
            onDone={() => {
              if (!explained) {
                setExplained(true);
                onDone();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

/* Wrap-up */
export function Wrap({ onDone }: { onDone: () => void }) {
  useEffect(onDone, [onDone]);
  const qs = [
    ["What roles are on my plate?", "Carbohydrate, protein, fat, fiber — and foods that play several."],
    ["About how much is there?", "Use your fist, palm, cupped hand, and thumb."],
    ["What's missing or out of proportion?", "Add, swap within a role, or adjust the amount before removing."],
    ["Does it fit my day?", "More active days use more energy. For personal needs, ask a Registered Dietitian."],
  ];
  return (
    <div className="max-w-2xl">
      <p className="text-[17px] leading-relaxed text-muted">Four questions you can ask at any meal:</p>
      <ol className="mt-6 grid gap-3">
        {qs.map(([q, a], i) => (
          <motion.li
            key={q}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="grid grid-cols-[36px_1fr] gap-3 rounded-2xl bg-tray p-5"
          >
            <span className="font-display text-[28px] font-bold leading-none text-leaf">{i + 1}</span>
            <span>
              <span className="block text-[17px] font-semibold">{q}</span>
              <span className="mt-1 block text-[15px] text-muted">{a}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
