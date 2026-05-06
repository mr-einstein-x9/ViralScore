"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="font-display text-3xl text-[#00ff87] leading-none tracking-wider">
              VIRAL
            </span>
            <span className="font-display text-3xl text-white leading-none tracking-wider">
              SCORE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse ml-1" />
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}

            <Link
              href="/analyze"
              className="bg-[#00ff87] text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-white transition-all duration-200"
            >
              Start Analyzing →
            </Link>
          </nav>

          {/* ── Mobile Hamburger ─────────────────────────────────── */}
          <button
            className="md:hidden text-[#888] hover:text-white transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#0a0a0a] border-t border-[#222]"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#888] hover:text-white transition-colors py-2 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}

              <Link
                href="/analyze"
                onClick={() => setMobileOpen(false)}
                className="mt-2 bg-[#00ff87] text-black font-semibold px-5 py-3 rounded-full text-sm text-center hover:bg-white transition-all duration-200"
              >
                Start Analyzing →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
