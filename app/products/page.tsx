import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = { title: "Platform & Robots (In Development)" };

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-xs tracking-[2px] uppercase font-bold text-[#F97316]">IN DEVELOPMENT</div>
        <h1 className="h1 tracking-tight mt-3">The DryForge platform &amp; robots</h1>
        <p className="mt-4 text-xl text-slate-600">Purpose-built finishing hardware plus the orchestration and quality software that turns robots into a system. Everything below is a design specification we are engineering toward — not a shipped product.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="card p-9">
            <h3 className="font-semibold text-2xl tracking-tight">ForgePro Robot (Design Spec)</h3>
            <p className="mt-4 text-sm text-slate-600">Our production robot concept for taping, mudding, and sanding on active commercial sites. Design targets:</p>
            <ul className="mt-6 text-sm space-y-2 text-slate-600">
              <li>• 850+ sqft/day sustained throughput target</li>
              <li>• 3D vision + force control for adaptive finishing</li>
              <li>• Adaptive mud delivery &amp; multi-pass sanding</li>
              <li>• Hot-swappable battery for full-shift operation</li>
              <li>• Designed toward ISO 13849 functional-safety requirements</li>
            </ul>
          </div>
          <div className="card p-9">
            <h3 className="font-semibold text-2xl tracking-tight">DryForge OS Platform</h3>
            <p className="mt-4 text-sm text-slate-600">The command layer: real-time dashboards, per-sqft quality records, predictive maintenance, and fleet coordination. ERP and job-costing integrations are on the roadmap.</p>
            <Link href="/dashboard" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">See the interface demo (sample data) →</Link>
          </div>
        </div>

        <p className="mt-10 text-xs text-slate-500 max-w-prose">
          We deliberately publish design targets rather than performance claims. Measured numbers will come from founding pilot deployments and will be published as measured — including where we miss.
        </p>
      </div>
      <Footer />
    </div>
  );
}
