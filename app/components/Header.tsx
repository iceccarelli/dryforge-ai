"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap, ChevronRight } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

// Inlined at build time; when Clerk keys are absent the auth UI is hidden
// so the site works without any environment variables.
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/robots-demo", label: "Robots" },
  { href: "/simulator", label: "Simulator" },
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/enterprise", label: "Enterprise" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F172A] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      {/* Primary bar — AWS-style: compact, dark, information-dense */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-[59px] items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="DryForge home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316] text-white">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-lg tracking-[-0.5px] group-hover:text-[#F97316] transition-colors">DRYFORGE</span>
            </Link>

            {/* Desktop nav — flat text links, AWS-style */}
            <nav className="hidden lg:flex items-center" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-[19px] text-[13.5px] font-medium text-slate-300 hover:text-white transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-[#F97316] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right utility cluster — AWS pattern: text links | divider | auth | orange CTA */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/#contact"
              className="hidden md:inline-block px-3 py-2 text-[13.5px] font-medium text-slate-300 hover:text-white transition-colors"
            >
              Contact Us
            </Link>

            <span className="hidden md:block h-5 w-px bg-white/20" aria-hidden="true" />

            {clerkEnabled && (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="hidden sm:inline-block px-3 py-2 text-[13.5px] font-medium text-slate-300 hover:text-white transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 rounded-full ring-1 ring-white/25",
                      },
                    }}
                  />
                </SignedIn>
              </>
            )}

            {/* Primary CTA — the "Create an AWS account" slot */}
            <Link
              href="/#contact"
              className="hidden sm:inline-flex items-center rounded-[4px] bg-[#F97316] px-4 py-[7px] text-[13.5px] font-semibold text-white hover:bg-[#EA580C] transition-colors"
            >
              Apply for Pilot
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -mr-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — dark panel, AWS-style flat list */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#0F172A]"
          >
            <nav className="px-4 py-3 flex flex-col" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-3.5 text-[15px] font-medium text-slate-200 hover:text-white border-b border-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
              <Link
                href="/#contact"
                className="flex items-center justify-between py-3.5 text-[15px] font-medium text-slate-200 hover:text-white border-b border-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Link>
              <div className="py-4 flex flex-col gap-2.5">
                <Link
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex justify-center rounded-[4px] bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] transition-colors"
                >
                  Apply for Pilot
                </Link>
                {clerkEnabled && (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex justify-center rounded-[4px] border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
