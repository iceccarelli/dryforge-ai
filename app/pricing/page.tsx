import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = { title: "Target Pricing Model" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />

      <div className="border-b bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs tracking-[2px] uppercase font-bold text-[#F97316]">TARGET PRICING MODEL — ROBOTS AS A SERVICE</div>
          <h1 className="h1 tracking-[-2.5px] mt-4">Per finished square foot. No capex. Everything bundled.</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            These are the target tiers we are engineering toward. DryForge is pre-launch: final rates will be validated with founding pilot partners and published from real deployment data — not before.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="card p-8">
            <div className="text-xs tracking-widest uppercase text-slate-500 font-semibold">STARTER — TARGET</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$2.45<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">Intended for contractors testing the model on one active project.</p>

            <ul className="mt-8 space-y-3 text-sm">
              {["1–2 robots", "1 dedicated operator", "Core analytics dashboard", "Email + chat support", "Bounded pilot scope with defined exit"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="/#contact" className="mt-8 btn-secondary w-full justify-center">Apply for Pilot</Link>
          </div>

          {/* Professional */}
          <div className="card p-8 border-[#F97316] relative">
            <div className="absolute -top-3 right-8 bg-[#F97316] text-white text-xs px-5 py-px font-bold tracking-wider rounded">CORE MODEL</div>
            <div className="text-xs tracking-widest uppercase text-[#F97316] font-semibold">PROFESSIONAL — TARGET</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$2.85<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">The tier the platform is designed around: multi-robot fleets on mid-to-large commercial projects.</p>

            <ul className="mt-8 space-y-3 text-sm">
              {["3–8 robots", "Trained supervisor + operators", "Full real-time + historical analytics", "Priority support with on-site options", "ERP / job-costing integrations (roadmap)", "Monthly review with our team"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="/#contact" className="mt-8 btn-primary w-full justify-center">Apply for Pilot</Link>
          </div>

          {/* Enterprise */}
          <div className="card p-8">
            <div className="text-xs tracking-widest uppercase text-slate-500 font-semibold">ENTERPRISE — TARGET</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$1.95<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">Volume model for large GCs and developers running many robots across multiple sites.</p>

            <ul className="mt-8 space-y-3 text-sm">
              {["10+ robots + dedicated fleet manager", "Custom SLAs", "Full API access (roadmap)", "On-site robotics engineers", "Custom training & safety programs", "Multi-year volume agreements"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="/enterprise" className="mt-8 btn-secondary w-full justify-center">Talk Enterprise</Link>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-slate-500 max-w-lg mx-auto">
          The target model is all-in: robot hardware, trained personnel, software platform, preventive maintenance, and quality reporting in a single per-sqft rate.
          Founding pilot partners lock preferential pricing before public rates are set. No number on this page is a measured result — pilots exist to produce those numbers.
        </div>
      </div>

      <Footer />
    </div>
  );
}
