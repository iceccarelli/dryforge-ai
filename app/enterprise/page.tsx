import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = { title: "Enterprise Program" };

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[2px] text-[#F97316] font-bold">FOR LARGE GCs &amp; DEVELOPERS</div>
          <h1 className="h1 tracking-[-2px] mt-3">Shape autonomous drywall finishing before it scales.</h1>
          <p className="mt-5 text-xl text-slate-600">The Enterprise track of the founding pilot is for organizations that want early influence over the platform: portfolio-scale requirements, custom SLAs, and multi-year volume pricing locked at founding-partner rates — in exchange for real project scope and honest baselines.</p>
        </div>

        <div className="mt-14">
          <Link href="/#contact" className="btn-primary text-base px-10 py-4">Talk to us about an Enterprise pilot</Link>
        </div>

        <div className="mt-16 text-sm text-slate-600 max-w-prose">
          DryForge is pre-launch and has no enterprise customers yet. That is precisely the opportunity: the first large GCs and developers in the program will define the integration, safety, and reporting requirements everyone else inherits.
        </div>
      </div>
      <Footer />
    </div>
  );
}
