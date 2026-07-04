import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingChatbot from "./components/FloatingChatbot";
import ROICalculator from "./components/ROICalculator";
import {
  Zap, Clock, TrendingUp, Users, Shield, ArrowRight, CheckCircle, Target, Mail
} from "lucide-react";
import Link from "next/link";

export default function DryForgeHome() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950 overflow-hidden">
      <Header />

      {/* 1. HERO */}
      <section className="relative pt-16 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold tracking-[1px] text-slate-600 mb-6">
            IN DEVELOPMENT • FOUNDING PILOT PROGRAM • GREATER TORONTO AREA
          </div>

          <h1 className="h1 tracking-[-3.2px] text-balance max-w-[20ch] mx-auto">
            Drywall finishing is running out of <span className="text-[#F97316]">finishers.</span><br />We&apos;re building the machines.
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 leading-tight">
            DryForge is developing robot-assisted drywall finishing as a service:<br className="hidden md:block" />
            semi-autonomous taping, mudding, and sanding robots supervised by trained operators,<br className="hidden md:block" />
            priced per finished square foot with no capital outlay for contractors.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#contact" className="btn-primary text-base px-9 py-3.5 w-full sm:w-auto group">
              Apply for the Founding Pilot <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link href="#roi-calculator" className="btn-secondary text-base px-9 py-3.5 w-full sm:w-auto">
              Model Your Project Economics
            </Link>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[1.5px] text-slate-500 font-medium">
            Pre-launch. No deployed fleet yet — that&apos;s exactly why founding partners get to shape it.
          </p>
        </div>

        <div className="mt-16 border-t border-b border-slate-200 bg-white py-5">
          <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Robots-as-a-Service — no capex</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Human-supervised, always</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Per-sqft pricing</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Built with pilot partners, not for them</div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="section bg-white border-b">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-8">
            <p className="uppercase text-xs tracking-[2px] font-semibold text-slate-500">WHY THIS, WHY NOW</p>
            <h2 className="h2 tracking-tight mt-3">The finishing trades are aging out faster than they&apos;re being replaced.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "A shrinking workforce", desc: "Industry bodies like BuildForce Canada have warned for years that a large share of Canada's construction workforce is approaching retirement, with too few new entrants in the finishing trades to replace them." },
              { title: "Schedule risk lands on drywall", desc: "Taping, mudding, and sanding sit on the critical path of nearly every interior fit-out. When finishing crews are short, whole floors wait — and GCs feel it in liquidated damages." },
              { title: "The work suits automation", desc: "Large, flat, repetitive surfaces with measurable quality criteria are one of the most tractable problems in construction robotics. Companies in the US have already proven robot-assisted finishing works. The GTA deserves its own." },
            ].map((item, i) => (
              <div key={i} className="card p-7">
                <h3 className="font-semibold text-lg tracking-tight mb-3">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE'RE BUILDING */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <div className="text-[#F97316] text-xs font-bold tracking-[2px] mb-3">WHAT WE&apos;RE BUILDING</div>
            <h2 className="h2 tracking-tight">A finishing system, not just a robot.</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">These are our design targets — the spec we&apos;re engineering toward and will validate openly with pilot partners.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Mud • Tape • Sand Automation", desc: "Automation of the core finishing sequence: compound application, taping, and multi-pass sanding — with humans handling edges, corners, and complex geometry." },
              { icon: Target, title: "Level 4/5 Finish Target", desc: "Closed-loop vision and surface measurement so quality is inspected continuously, not argued about at punch-list time." },
              { icon: Users, title: "Human Supervisor Model", desc: "One trained operator supervising multiple robots. Your best finishers become supervisors instead of leaving the trade." },
              { icon: TrendingUp, title: "Per-Sqft RaaS Pricing", desc: "No capex. Pay per finished square foot, with robot, operator, software, and maintenance bundled. Pilot pricing set jointly with founding partners." },
              { icon: Shield, title: "Every Sqft Documented", desc: "Scanned, timestamped quality records for every section finished — evidence for QA disputes, not marketing decks." },
              { icon: Clock, title: "Fast, Low-Friction Deployment", desc: "The design goal is measured in days, not months: site assessment, calibration, and supervisor training as a repeatable playbook." },
            ].map((feature, index) => (
              <div key={index} className="card card-feature group">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#0F172A] group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xl tracking-tight mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILOT STRUCTURE */}
      <section className="section bg-white border-y">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <div className="text-xs uppercase tracking-[2px] text-[#F97316] font-bold">HOW THE FOUNDING PILOT WORKS</div>
              <h2 className="h2 tracking-tight mt-2">Four steps. Full transparency. Real measurement.</h2>
            </div>
            <Link href="#contact" className="mt-4 lg:mt-0 inline-flex items-center text-sm font-semibold text-[#F97316] hover:underline">Apply for a pilot slot <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Site Assessment", desc: "We walk your floor plans and current crew metrics with you and agree on measurable success criteria before anything is signed." },
              { step: "02", title: "Pilot Agreement", desc: "A short, honest pilot agreement: defined scope, defined section of a real project, defined metrics, and a defined exit for both sides." },
              { step: "03", title: "Supervised Deployment", desc: "Robots run on a bounded section with our engineers on-site and your crew observing. Every square foot is measured against the manual baseline." },
              { step: "04", title: "Open Results", desc: "You get the full data — throughput, quality scores, cost per sqft — whether it flatters us or not. Founding partners get locked preferential pricing if we proceed." },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                <div className="step-number mb-6 -ml-4">{item.step}</div>
                <h4 className="font-semibold text-lg tracking-tight mb-2.5">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="roi-calculator" className="section">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className="text-[#F97316] text-xs tracking-[2px] font-bold">PLANNING MODEL</div>
            <h2 className="h2 tracking-tight mt-2">Model what robot-assisted finishing could mean for your project.</h2>
            <p className="text-slate-600 mt-3">An interactive model built on published industry productivity benchmarks and our target pricing. It is a planning tool — not measured DryForge performance data.</p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* FOUNDING PARTNERS */}
      <section className="section bg-white border-y">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-[#F97316] font-bold">FOUNDING PILOT PARTNERS</div>
            <h2 className="h2 tracking-tight mt-2">We&apos;re recruiting a small number of GTA contractors. Here&apos;s the deal.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "What you give", items: ["A bounded section of a real active project", "Honest baseline data from your manual crews", "Blunt feedback from your finishers and supervisors"] },
              { title: "What you get", items: ["First access to the technology in your market", "Locked founding-partner pricing if the pilot converts", "Full pilot data and quality documentation, no spin"] },
              { title: "What we promise", items: ["No fabricated metrics — we publish what we measure", "Humans supervise every robot, on every site", "A defined exit if the numbers don't work for you"] },
            ].map((col, idx) => (
              <div key={idx} className="card p-7">
                <h4 className="font-semibold text-xl tracking-tight mb-5">{col.title}</h4>
                <ul className="space-y-3 text-sm text-slate-700">
                  {col.items.map((it, i) => (
                    <li key={i} className="flex gap-2.5"><CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGINEERING APPROACH */}
      <section className="section bg-[#0F172A] text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
            <div>
              <div className="uppercase tracking-[2px] text-xs text-[#F97316] font-bold mb-3">ENGINEERING APPROACH</div>
              <h2 className="h2 tracking-[-1.5px] text-white">Built for active construction sites, not lab demos.</h2>
              <p className="mt-5 text-lg text-slate-300">Dust, uneven floors, tight schedules, and zero tolerance for defects. That&apos;s the environment we&apos;re engineering for from day one.</p>

              <ul className="mt-8 space-y-4 text-sm">
                {[
                  "Multi-sensor perception: LiDAR + stereo vision + force/torque sensing",
                  "Adaptive compound delivery with viscosity compensation",
                  "Automated multi-pass sanding with progressive grit control",
                  "Fleet orchestration software for multi-robot coordination",
                  "Integrations with Procore, Autodesk Construction Cloud, and job-costing systems on the roadmap",
                  "Designed toward ISO 13849 functional-safety requirements and Ontario site-safety compliance — certification claims only when certified",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F97316]" /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-9 text-sm">
              <div className="uppercase text-xs tracking-widest text-[#F97316] mb-4">THE SOFTWARE LAYER</div>
              <div className="space-y-6 text-slate-300">
                <div><span className="font-semibold text-white">Live Dashboard:</span> Sqft finished, quality heatmaps, and maintenance status per robot. Preview the interface in our <Link href="/dashboard" className="underline hover:text-white">product demo</Link>.</div>
                <div><span className="font-semibold text-white">API Access (planned):</span> Push finished quantities and quality reports into your ERP or job-costing platform.</div>
                <div><span className="font-semibold text-white">Safety Layer:</span> Speed limiting, emergency stops, and a full audit trail of every robot action — designed in from the start.</div>
              </div>
              <Link href="/products" className="mt-8 inline-flex items-center text-sm font-semibold text-white hover:text-[#F97316] transition">See the platform in detail →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING DIRECTION */}
      <section id="pricing" className="section">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs tracking-[2px] uppercase font-bold text-[#F97316]">PRICING DIRECTION</div>
          <h2 className="h2 tracking-tight mt-3">Per finished square foot. No capex. Set with pilot partners.</h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Our target model bundles robots, trained operators, software, and maintenance into a single per-sqft rate that undercuts fully-loaded manual finishing cost on large commercial projects. Exact rates will be validated and published from real pilot data — founding partners lock preferential pricing before anyone else.
          </p>
          <div className="mt-8">
            <Link href="/pricing" className="btn-secondary px-8 py-3">See the target pricing model</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="bg-[#0F172A] py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-1.8px]">Help build the machine that fixes your labor problem.</h2>
          <p className="mt-4 text-xl text-slate-300">If you run drywall crews in the GTA and want first access — with honest numbers and a defined exit — we want to talk.</p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:pilot@dryforge.ai?subject=Founding%20Pilot%20Application" className="btn-primary bg-white text-[#0F172A] hover:bg-slate-100 px-10 py-3.5 text-base inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> Apply for the Founding Pilot
            </a>
            <Link href="/pricing" className="btn-secondary border-white/30 text-white hover:bg-white/10 px-10 py-3.5 text-base">See Target Pricing</Link>
          </div>
          <p className="mt-5 text-xs text-slate-400">DryForge is pre-launch. We will never show you a metric we didn&apos;t measure.</p>
        </div>
      </section>

      <Footer />
      <FloatingChatbot />
    </div>
  );
}
