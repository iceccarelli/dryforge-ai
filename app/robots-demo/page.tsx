import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RobotShowcase from "./RobotShowcase";
import { Boxes } from "lucide-react";

export const metadata: Metadata = {
  title: "The Fleet — 5 Robots, One Drywall Workflow",
  description:
    "DryForge's modular drywall automation fleet: material-handling AMR, AI cutting & panelization, robotic hanger, semi-autonomous finishing, and vision QA — orchestrated by one software layer. Benchmarked to real industry results, priced as RaaS.",
  alternates: { canonical: "https://dryforge.ai/robots-demo" },
};

export default function RobotsDemoPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950">
      <Header />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[1px] text-slate-600">
            <Boxes className="h-3.5 w-3.5 text-[#F97316]" /> THE DRYFORGE FLEET • MODULAR • RaaS + SaaS
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-[-2px] text-slate-900 max-w-3xl">
            Five robots. One workflow. <span className="text-[#F97316]">One intelligent layer.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Material handling, cutting, hanging, finishing, and quality — each a proven-or-emerging machine,
            unified by the DryForge software brain. Explore each robot, then model a deployment. Every DryForge
            number is a labelled projection; every industry figure is sourced.
          </p>
        </div>
      </section>
      <RobotShowcase />
      <Footer />
    </div>
  );
}
