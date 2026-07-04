import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="h1 tracking-tight">Resources &amp; Documentation</h1>
        <p className="text-xl text-slate-600 mt-3">Everything you need to evaluate, deploy, and dominate with autonomous drywall finishing.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {[
            ["Technical Documentation", "Robot specifications, safety protocols, integration guides, API reference."],
            ["Case Studies", "Detailed before/after from 200+ Ontario projects with exact labor displacement and quality metrics."],
            ["ROI Tools & Templates", "Bid templates, crew transition playbooks, floor plan analysis worksheets."],
            ["Support & Training", "Operator certification, supervisor playbooks, on-site deployment checklists."],
          ].map(([title, desc], i) => (
            <div key={i} className="card p-8">
              <h3 className="font-semibold text-xl tracking-tight">{title}</h3>
              <p className="mt-3 text-slate-600 text-sm">{desc}</p>
              <Link href="#contact" className="mt-5 text-xs font-semibold text-[#F97316] inline-block">Access now →</Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
