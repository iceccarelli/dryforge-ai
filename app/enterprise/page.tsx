import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[2px] text-[#F97316] font-bold">FOR LARGE GCs, DEVELOPERS &amp; ENTERPRISE PROGRAMS</div>
          <h1 className="h1 tracking-[-2px] mt-3">Scale autonomous drywall across your entire portfolio.</h1>
          <p className="mt-5 text-xl text-slate-600">Dedicated fleet managers. Private data lakes. Custom SLAs. Embedded engineers. Multi-year volume pricing locked in today.</p>
        </div>

        <div className="mt-14">
          <Link href="#contact" className="btn-primary text-base px-10 py-4">Talk to our Enterprise team</Link>
        </div>

        <div className="mt-16 text-sm text-slate-600 max-w-prose">
          DryForge Enterprise customers include some of Canada&apos;s largest developers and general contractors running 15–60+ robots across simultaneous high-rise, healthcare, and commercial projects. We become an extension of your operations team.
        </div>
      </div>
      <Footer />
    </div>
  );
}
