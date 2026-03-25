import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Coins,
  LogOut,
  Menu,
  Plus,
  Search,
  Shield,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const desktopSearchRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchRef = useRef<HTMLInputElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") ?? "");
  }, [location.search]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const targetRef = window.matchMedia("(min-width: 1024px)").matches
          ? desktopSearchRef.current
          : mobileSearchRef.current;
        targetRef?.focus();
        targetRef?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const claimDaily = async () => {
    const { data, error } = await supabase.rpc("claim_daily_credits");
    const result = data as Record<string, unknown> | null;
    if (error || (result && result.error)) {
      toast.error(String(result?.error || error?.message));
    } else {
      toast.success("50 SI u shtuan ne balancen tuaj.");
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedSearch = searchValue.trim();
    if (trimmedSearch) {
      params.set("q", trimmedSearch);
    }
    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : "",
    });
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Tregjet", icon: TrendingUp },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const initials = profile?.username?.slice(0, 1).toUpperCase() ?? "S";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100/50 bg-white/70 backdrop-blur-md">
      <div className="container py-3">
        <div className="hidden items-center gap-6 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,520px)_minmax(0,1fr)]">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <div>
                <p className="font-serif text-xl font-semibold tracking-tight text-zinc-950">
                  SI Parashikime
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Platforma e tregjeve</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              ref={desktopSearchRef}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Kerko tregje, tema ose sinjale"
              className="h-12 rounded-full border-zinc-200 bg-white/80 pl-11 pr-24 text-sm shadow-sm transition-colors focus-visible:ring-zinc-300"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-500">
              Cmd + K
            </kbd>
          </form>

          <div className="flex items-center justify-end gap-3">
            {user && profile ? (
              <>
                <button
                  onClick={claimDaily}
                  className="inline-flex h-12 shrink-0 items-center gap-3 whitespace-nowrap rounded-full border border-zinc-950/15 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-950/30 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-zinc-500" />
                    <span className="font-mono">{Math.floor(profile.balance).toLocaleString()} SI</span>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white">
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div className="text-sm leading-tight">
                    <p className="font-medium text-zinc-900">{profile.username}</p>
                    <p className="text-zinc-400">Llogari aktive</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button className="h-12 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800">
                  Hyr
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center">
              <div>
                <p className="font-serif text-lg font-semibold text-zinc-950">SI Parashikime</p>
                <p className="text-[11px] uppercase tracking-[0.26em] text-zinc-400">Platforma e tregjeve</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user && profile && (
                <button
                  onClick={claimDaily}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-zinc-950/15 bg-white px-3 text-xs font-medium text-zinc-900"
                >
                  <Coins className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-mono">{Math.floor(profile.balance).toLocaleString()} SI</span>
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-zinc-200 bg-white"
                onClick={() => setMobileOpen((current) => !current)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              ref={mobileSearchRef}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Kerko tregje"
              className="h-11 rounded-full border-zinc-200 bg-white/80 pl-11 pr-24 text-sm"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-500">
              Cmd + K
            </kbd>
          </form>

          {mobileOpen && (
            <div className="space-y-2 rounded-3xl border border-zinc-200 bg-white p-3 shadow-lg">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white"
                >
                  Hyr
                </Link>
              ) : (
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600"
                >
                  <LogOut className="h-4 w-4" />
                  Dil
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
