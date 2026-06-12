"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "今日概览", icon: "📊" },
  { href: "/cases", label: "案件列表", icon: "📁" },
  { href: "/review", label: "待确认", icon: "✅" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
      <div className="max-w-content mx-auto flex items-center justify-between px-lg h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-sm text-heading text-primary font-bold no-underline">
          <span className="text-xl">⚖️</span>
          <span className="hidden sm:inline">律案助理</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-xs">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-md py-sm rounded-md text-body font-medium transition-colors no-underline",
                pathname === item.href
                  ? "bg-primary-pale text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-secondary-light"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-text-secondary p-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[#E0E0E0] bg-white px-lg py-md space-y-xs">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-sm px-md py-sm rounded-md text-body font-medium no-underline",
                pathname === item.href
                  ? "bg-primary-pale text-primary"
                  : "text-text-secondary"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
