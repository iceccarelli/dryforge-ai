import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = { title: "Solutions" };

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="h1 tracking-tight">Built for both sides of the drywall contract.</h1>
        <p className="mt-4 text-xl text-slate-600">Whether you&apos;re a specialty drywall contractor or a general contractor / developer, the founding pilot is designed to answer your specific question with your own data.</p>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div className="card p-9">
            <div className="uppercase text-xs tracking-widest text-[#F97316] font-bold">FOR DRYWALL CONTRACTORS</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Can robots let a smaller crew finish more, without quality risk?</h3>
            <p className="mt-4 text-slate-600">That&apos;s the question the pilot measures: robot-assisted throughput and finish quality versus your own manual baseline, on your own project, with your best finishers supervising instead of leaving the trade.</p>
            <Link href="/#contact" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">Apply as a contractor →</Link>
          </div>
          <div className="card p-9">
            <div className="uppercase text-xs tracking-widest text-[#F97316] font-bold">FOR GENERAL CONTRACTORS &amp; DEVELOPERS</div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Can automation de-risk your interior schedule?</h3>
            <p className="mt-4 text-slate-600">Drywall finishing sits on the critical path. The pilot gives you real visibility: measured throughput, per-sqft quality records, and a documented comparison against manual crews — before you commit anything at portfolio scale.</p>
            <Link href="/enterprise" className="mt-6 inline-block text-sm font-semibold text-[#F97316]">Explore the Enterprise program →</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
