"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/enterprise", label: "Enterprise" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Ruthless & Clean */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-[-1.5px] text-[#0F172A] group-hover:text-[#F97316] transition-colors">DRYFORGE</span>
              <span className="text-[10px] text-slate-500 -mt-1.5 tracking-[2px] font-mono">AUTONOMOUS SYSTEMS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-9 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-slate-700 hover:text-[#0F172A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Talk to an Expert - High intent CTA */}
            <Link 
              href="#contact" 
              className="hidden md:inline-flex btn-ghost text-sm font-semibold text-slate-700 hover:text-[#0F172A]"
            >
              Talk to an Expert
            </Link>

            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-secondary text-sm px-5 py-2.5 hidden sm:inline-flex">
                  Log in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-full ring-1 ring-slate-200",
                  }
                }}
              />
            </SignedIn>

            {/* Primary CTA - Dominant */}
            <Link 
              href="/pricing" 
              className="btn-primary text-sm px-6 py-2.5 hidden sm:inline-flex"
            >
              Start 14-Day Pilot
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-700 hover:text-[#F97316]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t flex flex-col gap-3">
                <Link href="#contact" className="btn-secondary justify-center">Talk to an Expert</Link>
                <Link href="/pricing" className="btn-primary justify-center">Start 14-Day Pilot</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
