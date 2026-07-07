import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FleetSimulator from "./FleetSimulator";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Fleet Simulator — DryForge AI Orchestration",
  description:
    "Configure a real drywall project and watch the DryForge AI planner orchestrate all five robots end to end: material handling → cutting → hanging → finishing → QA. Live metrics, injectable jobsite variables, and a projected ROI summary. A planning model with disclosed assumptions.",
  alternates: { canonical: "https://dryforge.ai/simulator" },
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950">
      <Header />
      <section className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[1px] text-slate-600">
            <Layers className="h-3.5 w-3.5 text-[#F97316]" /> FLEET ORCHESTRATION • DIGITAL TWIN • PLANNING MODEL
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-[-2px] text-slate-900 max-w-3xl">
            Plan the whole job. <span className="text-[#F97316]">Watch the fleet run it.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            This is a preview of the DryForge AI orchestration platform. Set the project, hit run, and the planner
            sequences five robots through the full workflow — replanning live when you inject real jobsite variables.
            Every figure is a modelled projection with disclosed assumptions.
          </p>
        </div>
      </section>
      <FleetSimulator />
      <Footer />
    </div>
  );
}
