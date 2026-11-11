import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/figtree/index.css";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "./globals.css";
import { Analytics } from "@/lib/posthog";

export const metadata: Metadata = {
  title: "What's in your bowl? · A practical nutrition module",
  description:
    "A 50-minute learning module on nutrients, food energy, and portions you can see.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
