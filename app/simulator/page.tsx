import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DryingSimulator from "./DryingSimulator";
import { Boxes } from "lucide-react";

export const metadata: Metadata = {
  title: "Structural Drying Simulator",
  description:
    "An interactive, browser-based structural-drying simulator: set the room, water class, air movers and dehumidifiers, and watch a psychrometric drying curve play out. A planning model built on IICRC S500-style rules of thumb — not a live job or a guarantee.",
  alternates: { canonical: "https://dryforge.ai/simulator" },
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[1px] text-slate-600">
            <Boxes className="h-3.5 w-3.5 text-[#F97316]" /> PLANNING SIMULATION • IICRC S500-STYLE MODEL
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-[-2px] text-slate-900 max-w-3xl">
            Watch a room dry out — <span className="text-[#F97316]">before</span> the truck rolls.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Set the room, the water class, and the equipment. The simulator runs a real psychrometric
            drying curve so you can see how airflow and dehumidification interact — and where an
            undersized setup stalls. It&apos;s a planning aid, not a promise: every assumption is disclosed.
          </p>
        </div>
      </section>

      <DryingSimulator />

      <Footer />
    </div>
  );
}
