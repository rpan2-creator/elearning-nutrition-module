"use client";

import { FOODS } from "@/content/foods";
import type { Condition } from "@/lib/session";
import { AutoDone, Illus, Note, RoleChip, Sequence, Slide, Term } from "./kit";
import { GuessDeck, PredictPairs, RoleTagger, SortBins } from "./cards";
import { BmiScale, Estimator, HandCards, OilPlates, PlateBuilder, PlateModelVisual, PortionCounter, SnackMatch, TdeeBar } from "./activities";
import { Explain, Practice } from "./Practice";
import { motion } from "framer-motion";

export interface Lesson {
  id: string;
  chapter: number;
  title: string;
  minutes: number;
  slides: Slide[];
  /** The "Try it" activity. Call onDone when the learner has completed it. */
  Try: (p: { condition: Condition; onDone: () => void }) => React.ReactNode;
  tryTitle: string;
}

export const CHAPTERS = ["Macronutrients", "Energy", "Portions by hand", "Build a plate", "Take it with you"];

function Cluster({ ids, size = "h-24 w-24" }: { ids: string[]; size?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1">
      {ids.map((id, i) => (
        <Illus key={id} src={`/illus/${id}.svg`} className={size} bob delay={i * 0.6} />
      ))}
    </div>
  );
}

function KcalBars() {
  const rows = [
    { l: "Carbohydrate", v: 4, c: "var(--carb)" },
    { l: "Protein", v: 4, c: "var(--protein)" },
    { l: "Fat", v: 9, c: "var(--fat)" },
  ];
  return (
    <div className="w-full max-w-sm">
      {rows.map((r, i) => (
        <div key={r.l} className="mb-3 grid grid-cols-[110px_1fr_60px] items-center gap-3">
          <span className="text-[14px] font-semibold">{r.l}</span>
          <motion.span className="h-9 rounded-r-xl" style={{ background: r.c }} initial={{ width: 0 }} animate={{ width: `${(r.v / 9) * 100}%` }} transition={{ delay: 0.2 + i * 0.25, duration: 0.6 }} />
          <span className="font-display text-[24px] font-extrabold">{r.v}</span>
        </div>
      ))}
      <p className="text-[13px] text-muted">kcal per gram</p>
    </div>
  );
}

function Compare({ a, b, label }: { a: { img: string; t: string; v: string }; b: { img: string; t: string; v: string }; label: string }) {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-[13px] font-semibold text-muted">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((x) => (
          <div key={x.t} className="rounded-[22px] bg-cream-2 p-4 text-center">
            <img src={x.img} alt="" className="illus mx-auto h-24 w-24" />
            <p className="mt-2 text-[14px] font-semibold leading-tight">{x.t}</p>
            <p className="font-display mt-1 text-[26px] font-extrabold">{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const LESSONS: Lesson[] = [
  /* ───────── Chapter 1 ───────── */
  {
    id: "1.1-macros",
    chapter: 0,
    title: "Meet the macronutrients",
    minutes: 3,
    slides: [
      {
        title: "Food is made of a few big building blocks",
        body: (
          <>
            <p>
              Carbohydrate, protein, and fat are the nutrients you eat in large amounts. They&rsquo;re called <strong>macronutrients</strong>, and all three
              supply energy. Fiber travels with many plant foods and plays its own role.
            </p>
            <Term word="Macronutrient">A nutrient you need in large amounts (grams a day) that provides energy: carbohydrate, protein, or fat.</Term>
          </>
        ),
        visual: <Cluster ids={["rice", "salmon", "avocado", "broccoli"]} size="h-28 w-28" />,
      },
      {
        title: "Each one has a main job",
        body: (
          <div className="grid gap-3">
            {[
              ["carb", "Main quick fuel for your brain and muscles."],
              ["protein", "Builds and repairs tissue; helps a meal keep you full."],
              ["fat", "Concentrated energy; helps absorb some vitamins."],
              ["fiber", "Supports digestion and fullness."],
            ].map(([r, t]) => (
              <div key={r} className="flex items-center gap-3">
                <RoleChip role={r as "carb"} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        ),
        visual: (
          <div className="grid grid-cols-2 gap-2">
            {["bread", "egg", "olive-oil", "raspberries"].map((id, i) => (
              <Illus key={id} src={`/illus/${id}.svg`} className="h-28 w-28" bob delay={i} />
            ))}
          </div>
        ),
      },
      {
        title: "Many foods play more than one role",
        body: (
          <>
            <p>
              Black beans are a carbohydrate, a protein, <em>and</em> a fiber source. Salmon brings protein and fat. Peanut butter is shelved with protein
              foods, but most of its energy comes from fat.
            </p>
            <Note>The question isn&rsquo;t &ldquo;is this food a protein?&rdquo; but &ldquo;which roles does it play, and how much?&rdquo;</Note>
          </>
        ),
        visual: <Cluster ids={["black-beans", "salmon", "peanut-butter"]} size="h-32 w-32" />,
      },
    ],
    tryTitle: "Tag each food with its roles",
    Try: ({ condition, onDone }) => <RoleTagger id="1.1-try" foods={[FOODS.beans, FOODS.pb, FOODS.salmon, FOODS.banana]} condition={condition} onDone={onDone} />,
  },
  {
    id: "1.2-carbs",
    chapter: 0,
    title: "Carbohydrates",
    minutes: 4,
    slides: [
      {
        title: "Carbohydrate is your main quick fuel",
        body: (
          <>
            <p>
              Your brain runs mostly on glucose, and hard exercise draws heavily on carbohydrate. That&rsquo;s why removing carbohydrate before practice or a
              long study day often backfires.
            </p>
            <Term word="Complex carbohydrate">Starches and fiber in whole grains, beans, and potatoes. They digest more slowly than added sugars.</Term>
          </>
        ),
        visual: <Cluster ids={["oatmeal", "potato", "pasta"]} size="h-32 w-32" />,
      },
      {
        title: "Same macronutrient, very different packages",
        body: (
          <>
            <p>
              A can of soda and a bowl of oatmeal have similar grams of carbohydrate. The oatmeal also brings fiber and some protein; the soda&rsquo;s carbohydrate is
              all <strong>added sugar</strong>.
            </p>
            <Note tone="warn">Look at the &ldquo;Added sugars&rdquo; line on a label to tell them apart.</Note>
          </>
        ),
        visual: <Compare label="Carbohydrate per portion" a={{ img: "/illus/soda.svg", t: "Soda, 12 oz", v: "39 g" }} b={{ img: "/illus/oatmeal.svg", t: "Oatmeal, 1 cup", v: "27 g" }} />,
      },
      {
        title: "Portions change the number a lot",
        body: (
          <p>
            One cup of cooked rice — about one fist — has roughly <strong>45 g</strong> of carbohydrate, about the same as three slices of bread. A dining-hall
            scoop is often two fists. Next you&rsquo;ll estimate a few common foods, then flip the card to check.
          </p>
        ),
        visual: (
          <div className="flex items-center gap-3">
            <Illus src="/illus/rice.svg" className="h-32 w-32" bob />
            <span className="font-display text-[34px] font-bold">≈</span>
            <div className="flex -space-x-8">
              {[0, 1, 2].map((i) => (
                <Illus key={i} src="/illus/bread.svg" className="h-24 w-24" bob delay={i} />
              ))}
            </div>
          </div>
        ),
      },
    ],
    tryTitle: "Guess the carbs, then flip the card",
    Try: ({ onDone }) => <GuessDeck id="1.2-try" kc="carb_amounts" macro="carb" foods={[FOODS.rice, FOODS.bread, FOODS.banana, FOODS.soda, FOODS.beans, FOODS.oatmeal]} onDone={onDone} />,
  },
  {
    id: "1.3-protein",
    chapter: 0,
    title: "Protein",
    minutes: 3,
    slides: [
      {
        title: "Protein builds, repairs, and keeps you full",
        body: (
          <>
            <p>Muscle, skin, enzymes — protein supplies their building blocks. A meal with a substantial protein source usually keeps you satisfied longer.</p>
            <Term word="Meaningful source">A food where protein is a main part of what it gives you — not just &ldquo;contains some.&rdquo;</Term>
          </>
        ),
        visual: <Cluster ids={["chicken", "tofu", "egg", "edamame"]} size="h-28 w-28" />,
      },
      {
        title: "Look-alikes can be very different",
        body: (
          <>
            <p>
              Greek yogurt is strained, so it has about twice the protein of regular yogurt. Dairy and soy milk have 7–8 g per cup; almond and oat milk usually
              have 1–3 g.
            </p>
            <Note>The name and the shelf don&rsquo;t tell you. The label does.</Note>
          </>
        ),
        visual: <Compare label="Protein per cup" a={{ img: "/illus/milk.svg", t: "Dairy milk", v: "8 g" }} b={{ img: "/illus/almond-milk.svg", t: "Almond milk", v: "1 g" }} />,
      },
    ],
    tryTitle: "Which has more protein?",
    Try: ({ condition, onDone }) => (
      <PredictPairs
        id="1.3-try"
        kc="product_diff"
        macro="protein"
        condition={condition}
        onDone={onDone}
        pairs={[
          { a: FOODS.regular, b: FOODS.greek, question: "Same size cup — which yogurt has more protein?", explain: "Greek yogurt is strained, which removes liquid and concentrates protein: about 17 g vs 9 g." },
          { a: FOODS.almondmilk, b: FOODS.milk, question: "One cup each — which milk has more protein?", explain: "Dairy milk has about 8 g; unsweetened almond milk about 1 g. Soy milk is the plant milk closest to dairy." },
          { a: FOODS.pb, b: FOODS.chicken, question: "Peanut butter (2 tbsp) or chicken (3 oz)?", explain: "Peanut butter has 7 g protein but 16 g fat. Chicken has 26 g protein — a far more meaningful source." },
        ]}
      />
    ),
  },
  {
    id: "1.4-fat-fiber",
    chapter: 0,
    title: "Fat, fiber, and energy density",
    minutes: 3,
    slides: [
      {
        title: "Fat carries more than twice the energy per gram",
        body: (
          <>
            <p>
              A <strong>calorie (kcal)</strong> is a unit of food energy. Carbohydrate and protein give about 4 kcal per gram; fat gives about 9.
            </p>
            <Note>
              Worked example: a granola bar with 29 g carbohydrate, 4 g protein, and 7 g fat → 29 × 4 + 4 × 4 + 7 × 9 = 116 + 16 + 63 ≈ 195 kcal.
            </Note>
          </>
        ),
        visual: <KcalBars />,
      },
      {
        title: "Energy density: a lot in a little",
        body: (
          <>
            <Term word="Energy density">How much energy a food packs into its size. Oil and nuts are high; vegetables and fruit are low.</Term>
            <p>One tablespoon of olive oil (120 kcal) has more energy than two whole cups of spinach (14 kcal). Healthy fats are worth eating — just know the amount.</p>
          </>
        ),
        visual: <Compare label="Energy per portion" a={{ img: "/illus/olive-oil.svg", t: "Olive oil, 1 tbsp", v: "120 kcal" }} b={{ img: "/illus/spinach.svg", t: "Spinach, 2 cups", v: "14 kcal" }} />,
      },
      {
        title: "Fiber comes with plants",
        body: <p>Fiber is a carbohydrate you don&rsquo;t fully digest. It supports digestion and fullness. Beans, berries, vegetables, and whole grains are the big sources.</p>,
        visual: <Cluster ids={["raspberries", "broccoli", "black-beans", "apple"]} size="h-28 w-28" />,
      },
    ],
    tryTitle: "Sort: energy-dense or light?",
    Try: ({ onDone }) => (
      <Sequence
        onDone={onDone}
        first={(done) => (
        <SortBins
          id="1.4-try"
          kc="energy_density"
          items={[FOODS.oil, FOODS.spinach, FOODS.almonds, FOODS.broccoli, FOODS.pb, FOODS.raspberries, FOODS.avocado, FOODS.carrot]}
          bins={["Energy-dense", "Light"]}
          answer={(f) => (f.kcal / Math.max(1, f.carb + f.protein + f.fat) > 6 || f.fat >= 10 ? 0 : 1)}
          explain={(f) => (f.fat >= 10 ? `${f.fat} g fat in a small portion → ${f.kcal} kcal.` : `Mostly water and fiber → only ${f.kcal} kcal.`)}
          onDone={done}
        />)}
        second={(done) => (
        <Practice
          onDone={done}
          item={{
            id: "1.4-calc",
            kc: "energy_calc",
            prompt: "A snack has 12 g carbohydrate, 3 g protein, and 8 g fat. About how much energy is that?",
            options: [
              { id: "a", text: "About 92 kcal" },
              { id: "b", text: "About 132 kcal" },
              { id: "c", text: "About 207 kcal" },
              { id: "d", text: "About 23 kcal" },
            ],
            correct: "b",
            explain: "12 × 4 + 3 × 4 + 8 × 9 = 48 + 12 + 72 = 132 kcal. If you chose 92, you used 4 for fat instead of 9.",
          }}
        />)}
      />
    ),
  },

  /* ───────── Chapter 2 ───────── */
  {
    id: "2.1-energy",
    chapter: 1,
    title: "How much energy you use",
    minutes: 4,
    slides: [
      {
        title: "Your day's energy has three parts",
        body: (
          <>
            <Term word="TDEE">Total daily energy expenditure — the energy you use in a day: resting metabolism + activity + digesting food.</Term>
            <p>Basal metabolism is usually the biggest part. Activity is the part that changes most from day to day.</p>
          </>
        ),
        visual: <TdeeBar />,
      },
      {
        title: "Estimating it: an equation, then an activity factor",
        body: (
          <>
            <p>
              Dietitians often estimate BMR with the <strong>Mifflin–St Jeor equation</strong> using weight, height, age, and sex, then multiply by an activity
              factor from 1.2 (mostly sitting) to 1.9 (extremely active).
            </p>
            <Note>Worked example: BMR 1,600 × 1.375 (lightly active) = 2,200 kcal a day — an estimate, not a target.</Note>
          </>
        ),
        visual: <Cluster ids={["banana", "oatmeal", "salmon"]} size="h-28 w-28" />,
      },
      {
        title: "Balance happens over weeks, not meals",
        body: (
          <p>
            Eating more energy than you use over weeks tends to raise body weight; less tends to lower it. A single meal or day matters much less than the pattern.
            Personal targets depend on many factors — that&rsquo;s a conversation for a Registered Dietitian.
          </p>
        ),
        visual: <Cluster ids={["apple", "granola-bar", "crackers"]} size="h-28 w-28" />,
      },
    ],
    tryTitle: "Estimate Sam's daily energy use",
    Try: ({ onDone }) => (
      <Sequence
        onDone={onDone}
        first={(done) => <Estimator onDone={done} />}
        second={(done) => (
        <Practice
          onDone={done}
          item={{
            id: "2.1-check",
            kc: "tdee_calc",
            prompt: "Another student's estimated BMR is 1,700 kcal. They mostly sit (factor 1.2). About how much energy do they use in a day?",
            options: [
              { id: "a", text: "About 1,700 kcal" },
              { id: "b", text: "About 2,040 kcal" },
              { id: "c", text: "About 2,640 kcal" },
              { id: "d", text: "About 1,420 kcal" },
            ],
            correct: "b",
            explain: "1,700 × 1.2 = 2,040 kcal. The factor is always above 1, because a day includes more than resting.",
          }}
        />)}
      />
    ),
  },
  {
    id: "2.2-bmi",
    chapter: 1,
    title: "What BMI can and can't tell you",
    minutes: 3,
    slides: [
      {
        title: "BMI is weight relative to height",
        body: (
          <>
            <Term word="BMI">Body mass index = weight (kg) ÷ height (m)². For Sam: 65 ÷ 1.70² ≈ 22.5.</Term>
            <p>It&rsquo;s quick to calculate and useful for comparing large groups of adults.</p>
          </>
        ),
        visual: <BmiScale />,
      },
      {
        title: "But it can't see what the weight is made of",
        body: (
          <>
            <p>BMI can&rsquo;t tell muscle from fat, where fat is stored, how fit someone is, or what they should eat. A muscular athlete can land in &ldquo;overweight.&rdquo;</p>
            <Note tone="warn">Treat BMI as a rough screening number, never a verdict about one person.</Note>
          </>
        ),
        visual: <Cluster ids={["chicken", "potato", "spinach"]} size="h-28 w-28" />,
      },
    ],
    tryTitle: "Read a BMI correctly",
    Try: ({ onDone }) => (
      <Practice
        onDone={onDone}
        item={{
          id: "2.2-check",
          kc: "bmi_limits",
          prompt: "Two students both have a BMI of 29. One lifts weights five days a week; the other rarely exercises. What does BMI tell you about the difference?",
          options: [
            { id: "a", text: "They have the same amount of body fat" },
            { id: "b", text: "Very little — BMI doesn't separate muscle from fat" },
            { id: "c", text: "The lifter is less healthy" },
            { id: "d", text: "Both should eat 500 kcal less per day" },
          ],
          correct: "b",
          explain: "BMI only uses weight and height. Two people with the same BMI can differ a lot in body composition and health.",
        }}
      />
    ),
  },

  /* ───────── Chapter 3 ───────── */
  {
    id: "3.1-hands",
    chapter: 2,
    title: "Your hand is a measuring tool",
    minutes: 4,
    slides: [
      {
        title: "Why not just count calories?",
        body: (
          <p>
            Counting is easy on a package and hard everywhere else: mixed dishes, sauces, dining halls, parties. A registered dietitian we consulted put it
            simply — practical, visual estimates transfer better than exact numbers.
          </p>
        ),
        visual: <Cluster ids={["pasta", "salmon", "spinach"]} size="h-28 w-28" />,
      },
      {
        title: "Four hand measures (tap each card)",
        body: (
          <>
            <p>These are rough reference amounts — not how much you should eat. Hand sizes vary; compare your fist to a measuring cup once.</p>
            <Note>Source: Human Performance Resources by CHAMP (HPRC) hand guide.</Note>
          </>
        ),
        visual: <HandCards />,
      },
    ],
    tryTitle: "Size these portions with your hand",
    Try: ({ onDone }) => <PortionCounter onDone={onDone} />,
  },
  {
    id: "3.2-hidden",
    chapter: 2,
    title: "The energy you can't see",
    minutes: 2,
    slides: [
      {
        title: "Small additions, big energy",
        body: (
          <>
            <p>Oil, butter, dressing, and sauces barely change how a plate looks, but they can add hundreds of calories. One thumb of oil (2 tbsp) ≈ 240 kcal.</p>
            <Note>When estimating a plate, ask: was it cooked in or topped with fat?</Note>
          </>
        ),
        visual: <Cluster ids={["olive-oil", "peanut-butter", "avocado"]} size="h-28 w-28" />,
      },
    ],
    tryTitle: "Two plates that look alike",
    Try: ({ condition, onDone }) => <OilPlates condition={condition} onDone={onDone} />,
  },

  /* ───────── Chapter 4 ───────── */
  {
    id: "4.1-plate",
    chapter: 3,
    title: "Build a balanced plate",
    minutes: 4,
    slides: [
      {
        title: "A plate as a reference, not a rule",
        body: (
          <>
            <p>
              The Harvard Healthy Eating Plate suggests about half vegetables and fruit, a quarter whole grains, a quarter protein, plus some healthy fat. Athletes,
              people with health conditions, and different goals may need different proportions.
            </p>
          </>
        ),
        visual: <PlateModelVisual />,
      },
      {
        title: "Three ways to improve a plate",
        body: (
          <ol className="grid gap-3">
            {[
              ["Add what's missing.", "If a role is absent or tiny, add a food that plays it."],
              ["Swap within a role.", "No chicken? Beans or tofu play the same role."],
              ["Adjust amounts before removing.", "Often the fix is a smaller or larger portion, not deleting a food group."],
            ].map(([t, b], i) => (
              <li key={t} className="grid grid-cols-[32px_1fr] gap-2">
                <span className="font-display text-[26px] font-extrabold leading-none text-red">{i + 1}</span>
                <span>
                  <strong>{t}</strong> {b}
                </span>
              </li>
            ))}
          </ol>
        ),
        visual: <Cluster ids={["tofu", "black-beans", "chicken"]} size="h-28 w-28" />,
      },
    ],
    tryTitle: "Fix a pasta lunch",
    Try: ({ onDone }) => (
      <Sequence
        onDone={onDone}
        first={(done) => <PlateBuilder onDone={done} />}
        second={(done) => (
          <Explain
            id="4.1-why"
            kc="causal_justification"
            prompt="Explain one change in a sentence."
            placeholder="Adding chicken gives the plate … which …"
            example="Adding a palm of chicken gives the plate a protein source, which the pasta alone lacked and which helps keep me full until practice."
            onDone={done}
          />
        )}
      />
    ),
  },
  {
    id: "4.2-snack",
    chapter: 3,
    title: "Build a balanced snack",
    minutes: 3,
    slides: [
      {
        title: "Pair a carbohydrate with a protein",
        body: (
          <>
            <p>
              A simple principle from a registered dietitian: <strong>in general, pair a carbohydrate with a protein.</strong> Carbohydrate gives quick energy;
              protein, fat, and fiber slow digestion, so the snack tends to last longer.
            </p>
            <Term word="Gastric emptying">How fast food leaves your stomach. Protein, fat, and fiber slow it down.</Term>
          </>
        ),
        visual: (
          <div className="flex items-center gap-2">
            <Illus src="/illus/apple.svg" className="h-28 w-28" bob />
            <span className="font-display text-[40px] font-bold">+</span>
            <Illus src="/illus/peanut-butter.svg" className="h-28 w-28" bob delay={1} />
          </div>
        ),
      },
    ],
    tryTitle: "Complete three snacks",
    Try: ({ onDone }) => (
      <Sequence
        onDone={onDone}
        first={(done) => <SnackMatch onDone={done} />}
        second={(done) => (
          <Explain
            id="4.2-why"
            kc="causal_justification"
            prompt="Pick one snack and explain why the pairing works."
            placeholder="Adding … gives … which …"
            example="Adding a cheese stick to crackers gives the snack protein, which pairs with the crackers' carbohydrate and usually keeps me full longer between classes."
            onDone={done}
          />
        )}
      />
    ),
  },

  /* ───────── Wrap ───────── */
  {
    id: "5.1-wrap",
    chapter: 4,
    title: "A checklist for any meal",
    minutes: 1,
    slides: [
      {
        title: "Four questions you can ask anywhere",
        body: (
          <ol className="grid gap-3">
            {[
              ["What roles are on my plate?", "Carbohydrate, protein, fat, fiber — and foods that play several."],
              ["About how much is there?", "Fist, palm, cupped hand, thumb."],
              ["What's missing or out of proportion?", "Add, swap within a role, or adjust the amount."],
              ["Does it fit my day?", "More active days use more energy. For personal needs, ask a Registered Dietitian."],
            ].map(([q, a], i) => (
              <li key={q} className="grid grid-cols-[32px_1fr] gap-2">
                <span className="font-display text-[26px] font-extrabold leading-none text-red">{i + 1}</span>
                <span>
                  <strong>{q}</strong> <span className="text-muted">{a}</span>
                </span>
              </li>
            ))}
          </ol>
        ),
        visual: <Cluster ids={["salmon", "rice", "broccoli", "avocado"]} size="h-24 w-24" />,
      },
    ],
    tryTitle: "Ready for the post-check",
    Try: ({ onDone }) => (
      <AutoDone onDone={onDone}>
        <p className="rounded-2xl bg-tray p-5 text-[16px]">That&rsquo;s the module. The post-check is next — about 10 minutes, and you can skip anything.</p>
      </AutoDone>
    ),
  },
];
