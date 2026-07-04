import Link from "next/link";
import { 
  Linkedin, Twitter, Youtube, Instagram, Facebook, 
  MessageCircle, Github, Users 
} from "lucide-react";

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/dryforge", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/dryforge", label: "X" },
  { icon: Youtube, href: "https://youtube.com/@dryforge", label: "YouTube" },
  { icon: Instagram, href: "https://instagram.com/dryforge", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/dryforge", label: "Facebook" },
  { icon: MessageCircle, href: "https://tiktok.com/@dryforge", label: "TikTok" },
  { icon: MessageCircle, href: "https://discord.gg/dryforge", label: "Discord" },
  { icon: Github, href: "https://github.com/dryforge", label: "GitHub" },
  { icon: Users, href: "https://reddit.com/r/dryforge", label: "Reddit" },
];

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
    { label: "About DryForge", href: "/enterprise#about" },
    { label: "Leadership", href: "/enterprise#leadership" },
    { label: "Careers", href: "/enterprise#careers" },
    { label: "Press", href: "/enterprise#press" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Security", href: "/legal/security" },
    { label: "Trust & Compliance", href: "/enterprise#compliance" },
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
            <p className="text-sm text-slate-400 max-w-[200px]">
              The Operating System for Autonomous Drywall Finishing. Dominating the labor war.
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

        {/* Social Row - 9 icons */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} DryForge Inc. All rights reserved.</span>
            <Link href="/legal/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-slate-400">Terms</Link>
            <Link href="/legal/security" className="hover:text-slate-400">Security</Link>
            <span className="hidden md:inline">•</span>
            <span>Ontario, Canada • Serving North America</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
