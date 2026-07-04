import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="h1 tracking-tight">Resources</h1>
        <p className="text-xl text-slate-600 mt-3">What exists today, and what will be published as the pilot program produces real data.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {[
            ["ROI Planning Model", "Interactive model comparing manual finishing cost against our target RaaS rate, with all assumptions disclosed.", "/#roi-calculator", "Open the model →", true],
            ["Pilot Program Overview", "How the founding pilot is structured: scope, metrics, mutual exit, and what partners give and get.", "/#contact", "Read on the homepage →", true],
            ["Case Studies", "Published as pilots complete — measured results only, including misses. Nothing here yet, and we won't pretend otherwise.", "/#contact", "Get notified →", false],
            ["Technical Documentation", "Robot design specs, safety approach, and platform docs — published as the hardware and software mature.", "/#contact", "Get notified →", false],
          ].map(([title, desc, href, cta], i) => (
            <div key={i} className="card p-8">
              <h3 className="font-semibold text-xl tracking-tight">{title as string}</h3>
              <p className="mt-3 text-slate-600 text-sm">{desc as string}</p>
              <Link href={href as string} className="mt-5 text-xs font-semibold text-[#F97316] inline-block">{cta as string}</Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
