import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="h1 tracking-tight">Solutions for every player in the drywall value chain.</h1>
        <p className="mt-4 text-xl text-slate-600">Whether you&apos;re a specialty drywall contractor, general contractor, or large developer — DryForge has a ruthless-efficient path for you.</p>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div className="card p-9">
            <div className="uppercase text-xs tracking-widest text-[#F97316] font-bold">FOR DRYWALL CONTRACTORS</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Win more bids. Finish faster. Keep more margin.</h3>
            <p className="mt-4 text-slate-600">Replace 60-70% of your finishing labor with robots while your best people supervise and handle complex details. Bid aggressively and still protect 18-25 point margins.</p>
            <Link href="#contact" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">See contractor ROI →</Link>
          </div>
          <div className="card p-9">
            <div className="uppercase text-xs tracking-widest text-[#F97316] font-bold">FOR GENERAL CONTRACTORS &amp; DEVELOPERS</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">De-risk schedules. Control quality. Reduce punch lists.</h3>
            <p className="mt-4 text-slate-600">Guaranteed throughput and Level 5 quality on every sqft. Real-time visibility into every robot on every floor. Fewer callbacks, happier owners, faster turnover.</p>
            <Link href="/enterprise" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">Explore Enterprise program →</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
