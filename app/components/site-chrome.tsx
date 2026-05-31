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
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex flex-col">
            <span className="font-editorial text-base font-semibold tracking-tight">
              Half-life Bookstore
            </span>
            <span className="font-label text-[0.6rem] text-[var(--color-on-surface-variant)]">
              Lambda Archive Edition
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-md border border-[var(--color-outline-variant)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label border-b-2 pb-1 text-[0.65rem] ${
                  pathname === link.href
                    ? "border-[var(--color-primary)] text-[var(--color-on-surface)]"
                    : "border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {menuOpen ? (
          <nav className="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-6 py-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`mb-2 block rounded-md px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] last:mb-0 ${
                  pathname === link.href
                    ? "bg-[var(--color-on-surface)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
      <footer className="mt-16 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10 text-sm text-[var(--color-on-surface-variant)] lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="font-editorial text-base text-[var(--color-on-surface)]">
                Half-life Bookstore
              </p>
              <p className="mt-2 text-sm">
                Curated used academic books, verified partner editions, and local delivery for
                researchers and students.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-label text-[0.65rem]">
              {links.map((link) => (
                <Link key={`footer-${link.href}`} href={link.href} className="hover:text-[var(--color-on-surface)]">
                  {link.label}
                </Link>
              ))}
              <a
                href="https://examarchive.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-on-surface)]"
              >
                ExamArchive
              </a>
            </div>
          </div>
          <p className="mt-6 text-xs">
            Website designed by OD Studios. Built for focused discovery and high-contrast reading.
          </p>
        </div>
      </footer>
    </div>
  );
}
