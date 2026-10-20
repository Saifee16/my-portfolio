"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const links = [
  ["Work", "/#work"],
  ["Experience", "/experience"],
  ["Research", "/research"],
  ["Writing", "/#writing"],
  ["About", "/#about"],
  ["Contact", "/#contact"],
] as const;

export function MobileNav({ links: visibleLinks = links }: { links?: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <div className="lg:hidden" onKeyDown={event => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      toggle.current?.focus();
    }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={toggle} className="nav-link min-h-11 rounded border border-white/10 px-3 py-2 text-white" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? "Close" : "Menu"}</button>
    <nav id="mobile-navigation" hidden={!open} className="mobile-navigation absolute inset-x-0 top-16 border-b border-white/10 bg-[#08080a] p-4 shadow-2xl" aria-label="Mobile navigation">
      {visibleLinks.map(([label, href]) => <Link key={href} href={href} className="nav-link block border-b border-white/10 px-2 py-4 text-white" onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
  </div>;
}
