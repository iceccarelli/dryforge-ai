import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RobotGallery from "./RobotGallery";
import { Boxes } from "lucide-react";

export const metadata: Metadata = {
  title: "Robot Demos — The Autonomous Drying Fleet",
  description:
    "Watch DryForge's five-robot drying workflow in interactive 3D: autonomous extraction rover, repositioning air-mover array, self-navigating LGR dehumidifier, thermal inspection drone, and cavity injection system. Built on proven restoration hardware.",
  alternates: { canonical: "https://dryforge.ai/robots-demo" },
};

export default function RobotsDemoPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[1px] text-slate-600">
            <Boxes className="h-3.5 w-3.5 text-[#F97316]" /> INTERACTIVE 3D • THE DRYING FLEET
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-[-2px] text-slate-900 max-w-3xl">
            Five robots. One dry building. <span className="text-[#F97316]">Zero guesswork.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            From standing-water extraction to the final cavity dry-out — step through the full autonomous
            workflow in 3D. Every machine is built on proven restoration hardware; the self-navigation is
            what DryForge is engineering on top.
          </p>
        </div>
      </section>

      <RobotGallery />

      <Footer />
    </div>
  );
}
