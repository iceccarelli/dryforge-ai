import Link from "next/link";
import {
  Mail, Linkedin, Twitter, Youtube, Instagram, Facebook,
  MessageCircle, Github, Users, Music2,
} from "lucide-react";

/**
 * Social accounts — the 9 highest-reach platforms for this niche.
 * IMPORTANT: `enabled` stays false until the account actually exists.
 * Flip it to true after creating each profile; disabled entries never
 * render, so the site can never ship a dead social link.
 */
const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/dryforge", label: "LinkedIn", enabled: false },
  { icon: Twitter, href: "https://x.com/dryforge", label: "X (Twitter)", enabled: false },
  { icon: Youtube, href: "https://youtube.com/@dryforge", label: "YouTube", enabled: false },
  { icon: Instagram, href: "https://instagram.com/dryforge", label: "Instagram", enabled: false },
  { icon: Facebook, href: "https://facebook.com/dryforge", label: "Facebook", enabled: false },
  { icon: Music2, href: "https://tiktok.com/@dryforge", label: "TikTok", enabled: false },
  { icon: MessageCircle, href: "https://discord.gg/dryforge", label: "Discord", enabled: false },
  { icon: Github, href: "https://github.com/dryforge", label: "GitHub", enabled: false },
  { icon: Users, href: "https://reddit.com/r/dryforge", label: "Reddit", enabled: false },
];

const footerLinks = {
  Product: [
    { label: "Robots (Design Spec)", href: "/products" },
    { label: "DryForge OS Platform", href: "/products" },
    { label: "Interface Demo", href: "/dashboard" },
    { label: "Target Pricing", href: "/pricing" },
  ],
  Solutions: [
    { label: "Drywall Contractors", href: "/solutions" },
    { label: "General Contractors", href: "/solutions" },
    { label: "Enterprise & Developers", href: "/enterprise" },
  ],
  Resources: [
    { label: "ROI Planning Model", href: "/#roi-calculator" },
    { label: "Pilot Program", href: "/#contact" },
    { label: "All Resources", href: "/resources" },
  ],
  Company: [
    { label: "Enterprise Program", href: "/enterprise" },
    { label: "Contact", href: "/#contact" },
  ],
};

export default function Footer() {
  const liveSocials = socialLinks.filter((s) => s.enabled);

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-16 pb-10 sm:pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 sm:gap-x-8 gap-y-10">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 lg:pr-10">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-[#0F172A] font-bold text-xl tracking-tighter">DF</span>
              </div>
              <span className="font-bold text-2xl text-white tracking-[-1px]">DRYFORGE</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-[260px]">
              Building robot-assisted drywall finishing as a service for GTA contractors. Pre-launch — founding pilot partners wanted.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">{category}</h4>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar: contact, socials, legal line */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <a href="mailto:pilot@dryforge.ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <Mail className="h-4 w-4" /> pilot@dryforge.ai
            </a>

            {liveSocials.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                {liveSocials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
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
            )}
          </div>

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
