"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Store" },
  { href: "/admin", label: "Admin" },
];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-base font-semibold">Half-life Bookstore</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm ${
                  pathname === link.href ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {menuOpen ? (
          <nav className="border-t border-zinc-200 bg-white px-4 py-2 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`mb-2 block rounded-lg px-3 py-2 text-sm last:mb-0 ${
                  pathname === link.href ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
      <footer className="mt-12 border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-zinc-700 sm:px-6 lg:px-8">
          Website Designed by OD Studios, the creator of{" "}
          <a
            href="https://examarchive.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            ExamArchive
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
