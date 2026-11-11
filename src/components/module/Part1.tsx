"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MACRO, Macro } from "@/content/kcs";
import type { Condition } from "@/lib/session";
import { track } from "@/lib/track";
import { Practice } from "./Practice";

export function RoleChip({ role, small = false }: { role: Macro; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]"}`}
      style={{ background: MACRO[role].color }}
    >
      {MACRO[role].label}
    </span>
  );
}

/* 1.1 — the four roles */
const ROLES: { role: Macro; body: string; foods: string }[] = [
  { role: "carb", body: "Your body's main quick energy source, especially for the brain and hard exercise. Complex carbohydrates (whole grains, beans) digest more slowly than added sugars.", foods: "rice, bread, pasta, oats, potatoes, fruit, beans" },
  { role: "protein", body: "Building blocks for muscle and other tissues, and it helps a meal keep you full.", foods: "chicken, fish, eggs, tofu, Greek yogurt, beans, lentils" },
  { role: "fat", body: "A concentrated energy source that helps you absorb some vitamins. Small amounts carry a lot of energy.", foods: "oil, nuts, peanut butter, avocado, cheese" },
  { role: "fiber", body: "A kind of carbohydrate you don't fully digest. It supports digestion and fullness.", foods: "vegetables, fruit, whole grains, beans" },
];

export function RolesIntro({ onDone }: { onDone: () => void }) {
  useEffect(onDone, [onDone]);
  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Protein, carbohydrate, and fat are <strong className="text-ink">macronutrients</strong> — the nutrients you eat in large amounts and
        that supply energy. Fiber rides along with many carbohydrate foods. Each one has a color you&rsquo;ll see throughout the module.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.role} className="rounded-3xl bg-tray p-5" style={{ boxShadow: `inset 4px 0 0 ${MACRO[r.role].color}` }}>
            <RoleChip role={r.role} />
            <p className="mt-3 text-[15px] leading-relaxed">{r.body}</p>
            <p className="mt-2 text-[14px] text-muted">For example: {r.foods}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 1.2 — open the bowl: predict roles, then reveal (or be told) */
const BOWL: { key: string; name: string; src: string; roles: Macro[]; note: string }[] = [
  { key: "rice", name: "Rice", src: "/food/rice.jpg", roles: ["carb"], note: "Mostly carbohydrate. White rice has little fiber; brown rice has more." },
  { key: "chicken", name: "Chicken", src: "/food/chicken.jpg", roles: ["protein"], note: "A substantial protein source." },
  { key: "beans", name: "Edamame & beans", src: "/food/beans.jpg", roles: ["protein", "carb", "fiber"], note: "Plays three roles at once: protein, carbohydrate, and fiber." },
  { key: "broccoli", name: "Broccoli", src: "/food/broccoli.jpg", roles: ["fiber"], note: "Vegetables mainly add fiber, vitamins, and volume with little energy." },
  { key: "avocado", name: "Avocado", src: "/food/avocado.jpg", roles: ["fat", "fiber"], note: "Mostly healthy fat, plus a good amount of fiber." },
];
const ALL_ROLES: Macro[] = ["carb", "protein", "fat", "fiber"];

export function BowlSort({ condition, onDone }: { condition: Condition; onDone: () => void }) {
  const [picks, setPicks] = useState<Record<string, Macro[]>>({});
  const [revealed, setRevealed] = useState(condition === "told");
  const shownAt = useRef(performance.now());

  useEffect(() => {
    if (condition === "told") onDone();
  }, [condition, onDone]);

  function toggle(k: string, r: Macro) {
    if (revealed) return;
    setPicks((p) => {
      const cur = p[k] ?? [];
      const next = cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r];
      track({ phase: "learn", screen: "1.2-bowl", event_type: "click", item_id: `bowl-${k}`, kc: "multi_roles", response: next });
      return { ...p, [k]: next };
    });
  }

  function check() {
    const results = BOWL.map((b) => {
      const p = [...(picks[b.key] ?? [])].sort().join(",");
      return { key: b.key, response: picks[b.key] ?? [], correct: p === [...b.roles].sort().join(",") };
    });
    for (const r of results) {
      track({ phase: "learn", screen: "1.2-bowl", event_type: "answer", item_id: `bowl-${r.key}`, kc: "multi_roles", response: r.response, correct: r.correct, duration_ms: performance.now() - shownAt.current });
    }
    setRevealed(true);
    onDone();
  }

  const allPicked = BOWL.every((b) => (picks[b.key] ?? []).length > 0);

  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        {condition === "predict"
          ? "Before we tell you, make a prediction. Tap the roles each ingredient plays. Some play more than one."
          : "Here is what each ingredient in a typical grain bowl contributes. Notice that some play more than one role."}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {BOWL.map((b, i) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
            className="flex flex-col items-center text-center"
          >
            <img src={b.src} alt="" className="food h-28 w-28 object-contain" draggable={false} />
            <p className="mt-2 text-[15px] font-semibold">{b.name}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {(revealed ? ALL_ROLES : ALL_ROLES).map((r) => {
                const picked = (picks[b.key] ?? []).includes(r);
                const right = b.roles.includes(r);
                if (revealed && condition === "told" && !right) return null;
                if (revealed && condition === "predict" && !right && !picked) return null;
                const style =
                  revealed && right
                    ? { background: MACRO[r].color, color: "white", borderColor: MACRO[r].color }
                    : revealed && picked && !right
                      ? { background: "white", color: "var(--wrong)", borderColor: "var(--wrong)", textDecoration: "line-through" }
                      : picked
                        ? { background: MACRO[r].color, color: "white", borderColor: MACRO[r].color }
                        : { background: "white", color: "var(--muted)", borderColor: "var(--line)" };
                return (
                  <button
                    key={r}
                    disabled={revealed}
                    onClick={() => toggle(b.key, r)}
                    aria-pressed={picked}
                    className="rounded-full border px-2 py-0.5 text-[11.5px] font-semibold transition-colors"
                    style={style}
                  >
                    {MACRO[r].label}
                  </button>
                );
              })}
            </div>
            {revealed && <p className="mt-2 text-[13px] leading-snug text-muted">{b.note}</p>}
          </motion.div>
        ))}
      </div>
      {condition === "predict" && !revealed && (
        <button
          onClick={check}
          disabled={!allPicked}
          className="mt-8 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
        >
          Reveal the answers
        </button>
      )}
      {condition === "predict" && revealed && (
        <p className="mt-6 max-w-[62ch] rounded-2xl bg-tray p-4 text-[15px] leading-relaxed">
          Colored chips are correct. Crossed-out chips were your guesses that don&rsquo;t fit. Which ingredient surprised you? Beans and
          avocado are the ones most people under-label.
        </p>
      )}
    </div>
  );
}

/* 1.3 — energy per gram */
const PER_GRAM: { role: Macro; kcal: number }[] = [
  { role: "carb", kcal: 4 },
  { role: "protein", kcal: 4 },
  { role: "fat", kcal: 9 },
];

export function EnergyPerGram({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        A <strong className="text-ink">calorie (kcal)</strong> is a unit of food energy. Each gram of a macronutrient carries a fixed amount.
        This is why a little oil adds a lot of energy, while a pile of vegetables adds little.
      </p>
      <div ref={ref} className="mt-8 grid max-w-xl gap-4">
        {PER_GRAM.map((g, i) => (
          <div key={g.role} className="grid grid-cols-[110px_1fr] items-center gap-4">
            <RoleChip role={g.role} />
            <div className="flex items-center gap-3">
              <motion.div
                className="h-9 rounded-r-xl"
                style={{ background: MACRO[g.role].color }}
                initial={{ width: 0 }}
                animate={{ width: inView ? `${(g.kcal / 9) * 100}%` : 0 }}
                transition={{ delay: 0.2 + i * 0.25, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <span className="font-display text-[26px] font-bold tabular-nums">{g.kcal}</span>
              <span className="text-[13px] text-muted">kcal per gram</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 max-w-xl rounded-3xl bg-tray p-5">
        <p className="text-[14px] font-semibold text-muted">Worked example</p>
        <p className="mt-2 text-[16px] leading-relaxed">
          A granola bar has 15 g carbohydrate, 6 g protein, and 4 g fat.
          <br />
          15 × 4 + 6 × 4 + 4 × 9 = 60 + 24 + 36 = <strong>120 kcal</strong>. Fat is the smallest amount here but adds the most energy per gram.
        </p>
      </div>
      <div className="mt-10 max-w-xl">
        <Practice
          onDone={onDone}
          item={{
            id: "1.3-calc",
            kc: "energy_calc",
            prompt: "Your turn: a snack has 12 g carbohydrate, 3 g protein, and 8 g fat. About how much energy is that?",
            options: [
              { id: "a", text: "About 92 kcal" },
              { id: "b", text: "About 132 kcal" },
              { id: "c", text: "About 207 kcal" },
              { id: "d", text: "About 23 kcal" },
            ],
            correct: "b",
            explain: "12 × 4 + 3 × 4 + 8 × 9 = 48 + 12 + 72 = 132 kcal. If you picked 92, you likely used 4 for fat too.",
          }}
        />
      </div>
    </div>
  );
}

/* 1.4 — similar foods, different nutrition */
const YOGURT = [
  { name: "Plain Greek yogurt", protein: "about 15–17 g", value: 16 },
  { name: "Plain regular yogurt", protein: "about 6–10 g", value: 8 },
];
const MILK = [
  { name: "Dairy milk", protein: "about 8 g", value: 8 },
  { name: "Soy milk", protein: "about 7 g", value: 7 },
  { name: "Oat milk", protein: "about 2–3 g", value: 2.5 },
  { name: "Almond milk", protein: "about 1 g", value: 1 },
];

function ProteinRows({ rows, max, unit }: { rows: typeof MILK; max: number; unit: string }) {
  return (
    <div className="grid gap-2">
      {rows.map((r, i) => (
        <div key={r.name} className="grid grid-cols-[150px_1fr] items-center gap-3 text-[15px] sm:grid-cols-[180px_1fr]">
          <span>{r.name}</span>
          <div className="flex items-center gap-3">
            <motion.div
              className="h-6 rounded-r-lg"
              style={{ background: "var(--protein)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            />
            <span className="whitespace-nowrap text-[13px] text-muted">{r.protein} {unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarFoods({ condition, onDone }: { condition: Condition; onDone: () => void }) {
  const [guess, setGuess] = useState<string | null>(null);
  const [shown, setShown] = useState(condition === "told");
  const shownAt = useRef(performance.now());

  return (
    <div>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">
        Foods with the same name can be very different. The label, not the category, tells you how much a food actually contributes.
      </p>
      <div className="mt-6 flex items-end gap-6">
        <img src="/food/yogurt.jpg" alt="" className="food h-28 w-auto" draggable={false} />
      </div>

      {condition === "predict" && !shown && (
        <div className="mt-4 max-w-xl">
          <p className="text-[19px] font-semibold leading-snug">
            Predict first: in the same 170 g cup, how does plain Greek yogurt compare with plain regular yogurt for protein?
          </p>
          <div className="mt-4 grid gap-2">
            {[
              ["less", "Greek has less protein"],
              ["same", "About the same"],
              ["more", "Greek has noticeably more protein"],
            ].map(([id, text]) => (
              <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-tray px-4 py-3 ${guess === id ? "border-ink" : "border-line"}`}>
                <input type="radio" name="yogurt-guess" checked={guess === id} onChange={() => setGuess(id)} className="accent-[var(--ink)]" />
                {text}
              </label>
            ))}
          </div>
          <button
            disabled={!guess}
            onClick={() => {
              track({ phase: "learn", screen: "1.4-similar", event_type: "answer", item_id: "1.4-yogurt-predict", kc: "product_diff", response: guess, correct: guess === "more", duration_ms: performance.now() - shownAt.current });
              setShown(true);
            }}
            className="mt-4 rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
          >
            Reveal the labels
          </button>
        </div>
      )}

      {shown && (
        <div className="mt-6 grid max-w-2xl gap-8">
          <div>
            <p className="text-[15px] font-semibold">Protein per 170 g cup (typical values — check the label)</p>
            <div className="mt-3">
              <ProteinRows rows={YOGURT} max={17} unit="" />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">
              {condition === "predict" && guess && (guess === "more" ? "Your prediction was right. " : "Many people expect them to be similar. ")}
              Greek yogurt is strained, which removes liquid and concentrates the protein. Flavored versions of either can add a lot of added
              sugar, so the plain cup and the flavored cup are different foods too.
            </p>
          </div>
          <div>
            <p className="text-[15px] font-semibold">Protein per cup of milk (unsweetened, typical values)</p>
            <div className="mt-3">
              <ProteinRows rows={MILK} max={8} unit="" />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">
              All four are called &ldquo;milk,&rdquo; but only dairy and soy are meaningful protein sources.
            </p>
          </div>
          <Practice
            onDone={onDone}
            item={{
              id: "1.4-check",
              kc: "product_diff",
              prompt: "You want your morning cereal to include a protein source, and you avoid dairy. Which milk fits best?",
              options: [
                { id: "a", text: "Almond milk" },
                { id: "b", text: "Oat milk" },
                { id: "c", text: "Soy milk" },
                { id: "d", text: "They are all about the same" },
              ],
              correct: "c",
              explain: "Soy milk usually has about 7 g protein per cup, close to dairy. Almond and oat milk usually have much less.",
            }}
          />
        </div>
      )}
    </div>
  );
}
