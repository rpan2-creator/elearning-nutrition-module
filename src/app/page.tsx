import Link from "next/link";
import Hero from "@/components/Hero";

const STEPS = [
  { minutes: 10, title: "Pre-check", body: "A short quiz on what you already know. No feedback yet." },
  { minutes: 30, title: "Learn", body: "Four short parts: nutrients and energy, daily energy use, portions by hand, adjusting a meal." },
  { minutes: 10, title: "Post-check", body: "A similar quiz, then you see both scores and the answers." },
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <h2 className="font-display max-w-[18ch] text-[clamp(30px,4.5vw,52px)] font-bold leading-[0.98]">
          How the 50 minutes work
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-tray p-6 sm:p-8">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[44px] font-bold leading-none text-leaf">{i + 1}</span>
                <span className="text-[14px] text-muted">{s.minutes} min</span>
              </div>
              <h3 className="mt-4 text-[20px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted">
            This is general nutrition education for a class project, not personal advice. What works
            for you depends on your health, activity, preferences, allergies, and food access. For
            personal guidance, talk with a Registered Dietitian. We record your answers and clicks
            anonymously to study how people learn; no names or emails are collected.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center justify-self-start rounded-full bg-ink px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-leaf"
          >
            Start the module
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-8 text-[13px] text-muted sm:px-8">
          A learning module by Team 10 · Food photos are AI-generated illustrations.
        </div>
      </footer>
    </main>
  );
}
