"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Clock } from "lucide-react";
import { getHistory } from "@/lib/history";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAnalyzePage = pathname?.startsWith("/analyze");
  const showHowItWorks = !isAnalyzePage;
  
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setHistoryCount(getHistory().length);
    }
    updateCount();
    window.addEventListener("historyUpdated", updateCount);
    return () => window.removeEventListener("historyUpdated", updateCount);
  }, []);

  const handleOpenHistory = () => {
    window.dispatchEvent(new Event("openHistory"));
    setMobileOpen(false);
  };

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
            {showHowItWorks && navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#888] hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}

            {isAnalyzePage ? (
              <button
                onClick={handleOpenHistory}
                className="group border border-[#333] text-[#888] hover:border-white hover:text-white 
                           px-4 py-1.5 rounded-full text-sm flex items-center justify-center gap-2 transition-colors font-medium bg-[#111]"
              >
                <Clock size={15} />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="bg-[#222] text-[#888] group-hover:bg-[#333] group-hover:text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold transition-colors">
                    {historyCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="/analyze"
                className="bg-[#00ff87] text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-white transition-all duration-200"
              >
                Start Analyzing →
              </Link>
            )}
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
              {showHowItWorks && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#888] hover:text-white transition-colors py-2 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}

              {isAnalyzePage ? (
                <button
                  onClick={handleOpenHistory}
                  className="group mt-2 border border-[#333] text-[#888] hover:border-white hover:text-white 
                             px-5 py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-colors w-full font-semibold bg-[#111]"
                >
                  <Clock size={16} />
                  <span>History</span>
                  {historyCount > 0 && (
                    <span className="bg-[#222] text-[#888] group-hover:bg-[#333] group-hover:text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold transition-colors">
                      {historyCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href="/analyze"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 bg-[#00ff87] text-black font-semibold px-5 py-3 rounded-full text-sm text-center hover:bg-white transition-all duration-200"
                >
                  Start Analyzing →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
