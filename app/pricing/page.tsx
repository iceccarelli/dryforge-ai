import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      
      <div className="border-b bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs tracking-[2px] uppercase font-bold text-[#F97316]">ROBOT AS A SERVICE — NO CAPEX. EVER.</div>
          <h1 className="h1 tracking-[-2.5px] mt-4">Pricing that makes traditional crews look expensive.</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-lg mx-auto">Transparent per-square-foot pricing. Everything included. The more you finish, the more you save.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Same 3 tiers as home but more detail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="card p-8">
            <div className="text-xs tracking-widest uppercase text-slate-500 font-semibold">STARTER</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$2.45<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">Ideal for contractors testing the model on 1-2 active projects.</p>
            
            <ul className="mt-8 space-y-3 text-sm">
              {["Up to 2 ForgePro robots", "1 dedicated operator", "Core analytics dashboard", "Email + chat support", "Standard SLA (next business day)", "14-day pilot included"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="#contact" className="mt-8 btn-secondary w-full justify-center">Start 14-Day Pilot</Link>
          </div>

          {/* Pro - highlighted */}
          <div className="card p-8 border-[#F97316] relative">
            <div className="absolute -top-3 right-8 bg-[#F97316] text-white text-xs px-5 py-px font-bold tracking-wider rounded">RECOMMENDED FOR MOST</div>
            <div className="text-xs tracking-widest uppercase text-[#F97316] font-semibold">PROFESSIONAL</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$2.85<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">The tier our fastest-growing contractors choose. Full platform + priority support.</p>
            
            <ul className="mt-8 space-y-3 text-sm">
              {["3–8 robots included", "Trained supervisor + operators", "Full real-time + historical analytics + API", "4-hour priority support + on-site options", "Procore, ACC, job-costing integrations", "Monthly strategy reviews"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="#contact" className="mt-8 btn-primary w-full justify-center">Deploy Professional Fleet</Link>
          </div>

          {/* Enterprise */}
          <div className="card p-8">
            <div className="text-xs tracking-widest uppercase text-slate-500 font-semibold">ENTERPRISE</div>
            <div className="mt-4 text-6xl font-bold tracking-[-2px]">$1.95<span className="text-2xl align-super text-slate-400">/sqft</span></div>
            <p className="mt-2 text-sm text-slate-600">For large GCs and developers running 10+ robots across multiple sites with custom needs.</p>
            
            <ul className="mt-8 space-y-3 text-sm">
              {["10+ robots + dedicated fleet manager", "Custom SLAs & 24/7 support", "Private data lake + full API access", "Embedded robotics engineers on-site", "Custom training & safety programs", "Multi-year volume locks available"].map((f,i)=><li key={i} className="flex gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"/>{f}</li>)}
            </ul>
            <Link href="/enterprise" className="mt-8 btn-secondary w-full justify-center">Contact Enterprise Sales</Link>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-slate-500 max-w-md mx-auto">
          All pricing is all-in: robot hardware, trained personnel, software platform (including API), preventive maintenance, insurance, and quality reporting. 
          3-month minimum. Volume discounts and multi-year agreements available. Ontario deployment lead time currently 3 weeks.
        </div>
      </div>

      <Footer />
    </div>
  );
}
