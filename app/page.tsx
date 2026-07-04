import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingChatbot from "./components/FloatingChatbot";
import ROICalculator from "./components/ROICalculator";
import { 
  Zap, Clock, TrendingUp, Users, Shield, Award, 
  ArrowRight, CheckCircle, Play, MapPin, Target 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DryForgeHome() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-950 overflow-hidden">
      <Header />

      {/* 1. HERO */}
      <section className="relative pt-16 pb-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold tracking-[1px] text-slate-600 mb-6">
            ONTARIO • GTA • NOW EXPANDING ACROSS CANADA
          </div>

          <h1 className="h1 tracking-[-3.2px] text-balance max-w-[18ch] mx-auto">
            Finish Drywall <span className="text-[#F97316]">3× Faster.</span><br />Eliminate Labor Headaches Forever.
          </h1>
          
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 leading-tight">
            The Operating System for Autonomous Drywall Finishing. <br className="hidden md:block" />
            Semi-autonomous robots + human supervisors. Per-sqft RaaS. <br />
            Proven on 200+ GTA job sites. Deploy in under 14 days.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#roi-calculator" className="btn-primary text-base px-9 py-3.5 w-full sm:w-auto group">
              Calculate Your ROI <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link href="/pricing" className="btn-secondary text-base px-9 py-3.5 w-full sm:w-auto">
              Start 14-Day Pilot
            </Link>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[1.5px] text-slate-500 font-medium">
            The contractors winning the labor war are switching to DryForge
          </p>
        </div>

        <div className="mt-16 border-t border-b border-slate-200 bg-white py-5">
          <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 200+ robots deployed</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 94% Level 5 first-pass rate</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 4.1 mo average payback</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 65% faster finishing</div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="section bg-white border-b">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-8">
            <p className="uppercase text-xs tracking-[2px] font-semibold text-slate-500">PROVEN ON THE TOUGHEST GTA SITES</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden">
            {[
              { value: "65%", label: "Faster Finishing vs Manual Crews" },
              { value: "40-60%", label: "Labor Cost Reduction" },
              { value: "<14", label: "Days to Full Deployment" },
              { value: "91%", label: "Reduction in Callbacks" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 text-center">
                <div className="text-5xl font-bold tracking-tighter text-[#0F172A]">{stat.value}</div>
                <div className="mt-3 text-sm text-slate-600 font-medium leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">Data aggregated from 847 completed drywall robot jobs across the Greater Toronto Area • 2023–2026</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <div className="text-[#F97316] text-xs font-bold tracking-[2px] mb-3">THE DRYFORGE ADVANTAGE</div>
            <h2 className="h2 tracking-tight">Built to dominate the drywall labor crisis.</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">Every component engineered for maximum throughput and minimum human dependency.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Mud • Tape • Sand Automation", desc: "Full-stack automation of the entire finishing process. One robot handles compound application, taping, and multi-pass sanding with adaptive pressure." },
              { icon: Target, title: "Level 4 & 5 Finish Standard", desc: "Proprietary closed-loop vision + force control delivers Level 4.8–5.0 finishes on first or second pass. 91% fewer punch-list items." },
              { icon: Users, title: "Semi-Autonomous + Human Supervisor", desc: "One trained operator supervises up to 4 robots. Human judgment for edges, complex geometry. Full safety compliance built in." },
              { icon: TrendingUp, title: "Per-Sqft RaaS Pricing", desc: "No capex. Pay only for finished square footage. Transparent, predictable costs. Includes robot, operator, software platform, maintenance & insurance." },
              { icon: Shield, title: "Real-Time Data Moat from GTA Sites", desc: "Every square foot scanned, timestamped, and logged. 3D quality reports auto-generated. Your competitive advantage compounds with every job." },
              { icon: Clock, title: "Deploy in Under 14 Days", desc: "From contract signature to production robots on your floor in 9–14 days in Ontario. We handle logistics, calibration, and crew training." },
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

      {/* HOW IT WORKS */}
      <section className="section bg-white border-y">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <div className="text-xs uppercase tracking-[2px] text-[#F97316] font-bold">4-STEP DEPLOYMENT</div>
              <h2 className="h2 tracking-tight mt-2">From bid to production in under two weeks.</h2>
            </div>
            <Link href="/pricing" className="mt-4 lg:mt-0 inline-flex items-center text-sm font-semibold text-[#F97316] hover:underline">See full deployment timeline <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Site Assessment", desc: "Our team scans your floor plans and current crew metrics. We deliver a precise robot count + ROI projection within 48 hours." },
              { step: "02", title: "Contract & Onboarding", desc: "Simple RaaS agreement. We handle WSIB, insurance, and site-specific safety plans. 2-day virtual + on-site training for your supervisor." },
              { step: "03", title: "Robot Deployment", desc: "Robots arrive calibrated. 3-day production ramp with our lead technician on-site. Your crew learns to supervise while we optimize paths." },
              { step: "04", title: "Full Production + Data", desc: "Robots run 2 shifts. Real-time dashboard shows sqft finished, quality scores, and labor hours saved. Continuous improvement via our data moat." },
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

      {/* ROI IMPACT */}
      <section className="section">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="uppercase text-xs tracking-[2px] font-bold text-[#F97316] mb-3">REAL NUMBERS FROM REAL GTA JOBS</div>
          <h2 className="h2 tracking-tight">The math is brutal for traditional crews.</h2>
          <p className="mt-4 text-lg text-slate-600">DryForge customers are winning bids they used to lose and protecting margins they used to give away.</p>
        </div>

        <div className="mt-12 mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-6">
          {[
            { number: "$2.85", unit: "/sqft", label: "All-in RaaS cost — robot, operator, software, maintenance" },
            { number: "4.1", unit: "months", label: "Average payback period across 200+ deployments" },
            { number: "847", unit: "jobs", label: "Completed autonomous drywall projects in Ontario to date" },
          ].map((item, i) => (
            <div key={i} className="card card-stat">
              <div className="text-6xl font-bold tracking-[-2px] text-[#0F172A]">{item.number}<span className="text-3xl font-normal text-slate-400">{item.unit}</span></div>
              <p className="mt-4 text-sm text-slate-600 leading-snug">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="roi-calculator" className="section bg-white border-y">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className="text-[#F97316] text-xs tracking-[2px] font-bold">INTERACTIVE TOOL</div>
            <h2 className="h2 tracking-tight mt-2">Run your own numbers. See the truth.</h2>
            <p className="text-slate-600 mt-3">Input your project specs. Get instant savings, robots required, and payback period.</p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* USE CASES */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#F97316] font-bold">WINNING CONTRACTORS</div>
              <h2 className="h2 tracking-tight">The ones who switched are dominating their markets.</h2>
            </div>
            <Link href="/resources#cases" className="hidden md:inline text-sm font-semibold text-[#F97316] hover:underline">Read full case studies →</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { company: "Summit Drywall Systems", location: "Mississauga, ON", quote: "We went from 22 finishers to 7 supervisors + DryForge robots on a 180k sqft hospital. Finished 11 weeks early and won our next three bids on price.", metric: "68% labor reduction", project: "180,000 sqft healthcare" },
              { company: "ForgeLine Construction", location: "Downtown Toronto", quote: "Level 5 finish on a 42-storey condo with 4 robots and 2 guys. Zero callbacks on the first 18 floors. Our competitors are still figuring out how we bid so low.", metric: "3.9 month payback", project: "42-storey residential tower" },
              { company: "Atlas Interiors Ltd.", location: "Markham & Vaughan", quote: "DryForge paid for itself on the second job. We now bid every large commercial project with robots included. Our win rate on 50k+ sqft jobs went from 31% to 67%.", metric: "2.1x bid win rate", project: "Multiple commercial fit-outs" },
            ].map((story, idx) => (
              <div key={idx} className="card p-7 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-4">
                    <MapPin className="h-3.5 w-3.5" /> {story.location}
                  </div>
                  <h4 className="font-semibold text-xl tracking-tight mb-1">{story.company}</h4>
                  <p className="text-sm text-slate-500 mb-5">{story.project}</p>
                  <p className="text-[15px] text-slate-700 leading-relaxed italic">“{story.quote}”</p>
                </div>
                <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm">
                  <span className="font-semibold text-emerald-600">{story.metric}</span>
                  <span className="text-xs text-slate-400">VERIFIED CASE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="section bg-[#0F172A] text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
            <div>
              <div className="uppercase tracking-[2px] text-xs text-[#F97316] font-bold mb-3">PROPRIETARY ROBOTICS PLATFORM</div>
              <h2 className="h2 tracking-[-1.5px] text-white">Engineered for the drywall battlefield.</h2>
              <p className="mt-5 text-lg text-slate-300">Our robots are purpose-built for the chaos of active construction sites — dust, uneven floors, tight timelines, and zero tolerance for defects.</p>
              
              <ul className="mt-8 space-y-4 text-sm">
                {[
                  "Multi-sensor fusion: LiDAR + stereo vision + force/torque at 2kHz",
                  "Adaptive compound delivery with real-time viscosity compensation",
                  "Self-calibrating sanding heads with automatic grit progression",
                  "Fleet orchestration software that optimizes paths across 8+ robots",
                  "Full integration with Procore, Autodesk Construction Cloud, and job costing systems",
                  "SOC 2 Type II + WSIB compliant. Every action logged for insurance & QA.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F97316]" /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-9 text-sm">
              <div className="uppercase text-xs tracking-widest text-[#F97316] mb-4">INTEGRATIONS & DATA</div>
              <div className="space-y-6 text-slate-300">
                <div><span className="font-semibold text-white">Live Dashboard:</span> Sqft finished per hour, quality score heatmaps, labor hours displaced, predictive maintenance alerts.</div>
                <div><span className="font-semibold text-white">API Access:</span> Push finished quantities, quality reports, and robot utilization directly into your ERP or job costing platform.</div>
                <div><span className="font-semibold text-white">Safety Layer:</span> ISO 13849 PLd, collaborative speed limiting, emergency stop on every unit, full audit trail.</div>
              </div>
              <Link href="/enterprise" className="mt-8 inline-flex items-center text-sm font-semibold text-white hover:text-[#F97316] transition">Explore Enterprise integrations →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[2px] uppercase font-bold text-[#F97316]">ROBOT AS A SERVICE</div>
            <h2 className="h2 tracking-tight mt-3">Simple. Transparent. Aggressive on value.</h2>
            <p className="text-slate-600 mt-3 max-w-md mx-auto">No hidden fees. No capex. Pay for finished square footage and dominate your bids.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card pricing-card p-8 flex flex-col">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">STARTER FLEET</div>
                <div className="mt-3 flex items-baseline"><span className="text-5xl font-bold tracking-tighter">$2.45</span><span className="text-xl text-slate-400 ml-1">/sqft</span></div>
                <p className="text-sm text-slate-600 mt-1">Perfect for first-time robot users and smaller commercial projects.</p>
              </div>
              <ul className="mt-8 space-y-3 text-sm flex-1">
                {["1–2 robots included", "Dedicated operator (1 per 2 robots)", "Basic analytics dashboard", "Standard support (next business day)", "14-day pilot available"].map((f,i) => <li key={i} className="flex gap-2.5"><CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />{f}</li>)}
              </ul>
              <Link href="/pricing" className="mt-8 btn-secondary w-full justify-center">Start with Starter</Link>
            </div>

            <div className="card pricing-card popular p-8 flex flex-col relative">
              <div className="absolute -top-3 right-6 bg-[#F97316] text-white text-xs font-bold px-4 py-1 rounded tracking-wider">MOST POPULAR</div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#F97316] font-semibold">PROFESSIONAL RaaS</div>
                <div className="mt-3 flex items-baseline"><span className="text-5xl font-bold tracking-tighter">$2.85</span><span className="text-xl text-slate-400 ml-1">/sqft</span></div>
                <p className="text-sm text-slate-600 mt-1">The sweet spot for mid-to-large contractors running multiple concurrent jobs.</p>
              </div>
              <ul className="mt-8 space-y-3 text-sm flex-1">
                {["3–8 robots", "Trained supervisor + operator team", "Full real-time + historical analytics", "Priority 4-hour support + on-site SLA", "Procore + ACC integration", "Monthly business review with our team"].map((f,i) => <li key={i} className="flex gap-2.5"><CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />{f}</li>)}
              </ul>
              <Link href="/pricing" className="mt-8 btn-primary w-full justify-center">Deploy Professional Fleet</Link>
            </div>

            <div className="card pricing-card p-8 flex flex-col">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">ENTERPRISE</div>
                <div className="mt-3 flex items-baseline"><span className="text-5xl font-bold tracking-tighter">$1.95</span><span className="text-xl text-slate-400 ml-1">/sqft</span></div>
                <p className="text-sm text-slate-600 mt-1">Volume pricing + white-glove service for large GCs and multi-year programs.</p>
              </div>
              <ul className="mt-8 space-y-3 text-sm flex-1">
                {["10+ robots + dedicated fleet manager", "Custom SLAs & 24/7 support", "Private data lake + API access", "On-site robotics engineers", "Co-branded safety & training programs", "Volume discounts + multi-year locks"].map((f,i) => <li key={i} className="flex gap-2.5"><CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />{f}</li>)}
              </ul>
              <Link href="/enterprise" className="mt-8 btn-secondary w-full justify-center">Talk to Enterprise Team</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">All plans include robot hardware, trained personnel, software platform, maintenance, insurance, and quality reporting. Minimum 3-month commitment. 14-day pilot available on all tiers.</p>
        </div>
      </section>

      {/* RESOURCES TEASER */}
      <section className="section bg-white border-y">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="h2 tracking-tight">Everything you need to win with robots.</h2>
          <p className="mt-3 text-lg text-slate-600">Deep documentation, real case studies, and the industry’s most advanced ROI tools.</p>
          
          <div className="mt-10 grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: "Technical Documentation", desc: "Robot specs, integration guides, API reference, safety protocols, and deployment playbooks." },
              { title: "Case Studies & Benchmarks", desc: "Detailed breakdowns from 200+ Ontario projects with before/after metrics and bid comparisons." },
              { title: "ROI & Planning Tools", desc: "Interactive calculators, bid templates, crew transition playbooks, and floor-plan analysis templates." },
            ].map((res, i) => (
              <Link key={i} href="/resources" className="card p-7 group hover:border-[#F97316]/30">
                <h4 className="font-semibold tracking-tight text-lg group-hover:text-[#F97316] transition">{res.title}</h4>
                <p className="mt-3 text-sm text-slate-600">{res.desc}</p>
                <div className="mt-5 text-xs font-semibold text-[#F97316] flex items-center">Explore resources <ArrowRight className="ml-1.5 h-3 w-3" /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#0F172A] py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-1.8px]">Ready to finish drywall like the winners do?</h2>
          <p className="mt-4 text-xl text-slate-300">Book a site assessment or start your 14-day pilot this month. The labor shortage isn’t going away — but your dependency on it can.</p>
          
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#contact" className="btn-primary bg-white text-[#0F172A] hover:bg-slate-100 px-10 py-3.5 text-base">Book Site Assessment</Link>
            <Link href="/pricing" className="btn-secondary border-white/30 text-white hover:bg-white/10 px-10 py-3.5 text-base">Start 14-Day Pilot</Link>
          </div>
          <p className="mt-5 text-xs text-slate-400">Current Ontario deployment slots filling for Q3 2026 • Limited fleet availability</p>
        </div>
      </section>

      <Footer />
      <FloatingChatbot />
    </div>
  );
}
