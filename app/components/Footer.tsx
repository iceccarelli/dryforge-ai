import Link from "next/link";
import { Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Robots & Fleet", href: "/products" },
    { label: "RaaS Platform", href: "/pricing" },
    { label: "Data & Analytics", href: "/products#data" },
    { label: "Integrations", href: "/products#integrations" },
  ],
  Solutions: [
    { label: "Drywall Contractors", href: "/solutions#contractors" },
    { label: "General Contractors", href: "/solutions#gc" },
    { label: "Enterprise & GCs", href: "/enterprise" },
    { label: "Ontario Housing", href: "/solutions#ontario" },
  ],
  Resources: [
    { label: "Documentation", href: "/resources" },
    { label: "Case Studies", href: "/resources#cases" },
    { label: "ROI Calculator", href: "/#roi-calculator" },
    { label: "Blog & Insights", href: "/resources#blog" },
    { label: "Support", href: "/resources#support" },
  ],
  Company: [
    { label: "Enterprise Program", href: "/enterprise" },
    { label: "Contact", href: "/#contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-[#0F172A] font-bold text-xl tracking-tighter">DF</span>
              </div>
              <span className="font-bold text-2xl text-white tracking-[-1px]">DRYFORGE</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-[220px]">
              Building robot-assisted drywall finishing as a service for GTA contractors. Pre-launch — founding pilot partners wanted.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">{category}</h4>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <a href="mailto:pilot@dryforge.ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <Mail className="h-4 w-4" /> pilot@dryforge.ai
          </a>

          <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} DryForge. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Greater Toronto Area, Ontario, Canada</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
