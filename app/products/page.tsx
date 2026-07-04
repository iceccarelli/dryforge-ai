import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="h1 tracking-tight">The DryForge Platform &amp; Robot Fleet</h1>
        <p className="mt-4 text-xl text-slate-600">Purpose-built hardware + the most advanced orchestration and quality platform in construction robotics.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="card p-9">
            <h3 className="font-semibold text-2xl tracking-tight">ForgePro-7 &amp; ForgePro-X Robots</h3>
            <p className="mt-4 text-sm text-slate-600">Our 7th generation production robots. 850+ sqft/day sustained throughput. Level 5 capable. Dust-hardened. Self-calibrating. Fleet-orchestrated.</p>
            <ul className="mt-6 text-sm space-y-2 text-slate-600">
              <li>• 3D vision + force control at 2kHz</li>
              <li>• Adaptive mud delivery &amp; sanding</li>
              <li>• 14-hour battery + hot-swap</li>
              <li>• ISO 13849 PLd safety rated</li>
            </ul>
          </div>
          <div className="card p-9">
            <h3 className="font-semibold text-2xl tracking-tight">DryForge OS Platform</h3>
            <p className="mt-4 text-sm text-slate-600">The command layer that turns individual robots into a coordinated, data-generating finishing system. Real-time dashboards, predictive maintenance, quality heatmaps, and direct ERP integration.</p>
            <Link href="/dashboard" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">See live demo dashboard →</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
