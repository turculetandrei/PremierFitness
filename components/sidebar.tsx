"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const linkuri = [
  { href: "/", eticheta: "Dashboard", icon: LayoutDashboard },
  { href: "/membri", eticheta: "Membri", icon: Users },
  { href: "/abonamente", eticheta: "Abonamente", icon: CreditCard },
  { href: "/statistici", eticheta: "Statistici", icon: BarChart3 },
];

export function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function esteActiv(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  // Închide meniul mobil când se schimbă pagina
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Blochează scroll-ul în spatele drawer-ului mobil
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Conținutul comun (navigație + footer) — refolosit pe mobil și desktop
  const continutNav = (
    <>
      <nav className="flex-1 space-y-1 p-4">
        {linkuri.map(({ href, eticheta, icon: Icon }) => {
          const activ = esteActiv(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all",
                activ
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(232,119,34,0.3)]"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="uppercase tracking-wide">{eticheta}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        {email && (
          <p className="mb-2 truncate px-3 text-xs text-muted" title={email}>
            {email}
          </p>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-muted transition-all hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="uppercase tracking-wide">Deconectare</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bară de sus — doar mobil */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Deschide meniul"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Overlay + drawer glisant — doar mobil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-r border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-6">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide meniul"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {continutNav}
          </aside>
        </div>
      )}

      {/* Sidebar fix — doar desktop */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="border-b border-border p-6">
          <Logo />
        </div>
        {continutNav}
      </aside>
    </>
  );
}
