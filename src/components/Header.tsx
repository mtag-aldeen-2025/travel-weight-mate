import { useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Menu, User, Plus, List, LogOut, Plane } from "lucide-react";

export function Header({
  session,
  loading,
}: {
  session: Session | null;
  loading: boolean;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">وزني معاك</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/">الرحلات</NavLink>
          {session && (
            <>
              <NavLink to="/listings/new">
                <Plus className="ml-1 h-4 w-4" />
                أضف عرض
              </NavLink>
              <NavLink to="/my-listings">رحلاتي</NavLink>
              <NavLink to="/bookings">حجوزاتي</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    حسابي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-listings" className="w-full cursor-pointer">
                    رحلاتي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookings" className="w-full cursor-pointer">
                    حجوزاتي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
              الرحلات
            </MobileNavLink>
            {session && (
              <>
                <MobileNavLink to="/listings/new" onClick={() => setMobileOpen(false)}>
                  <Plus className="ml-2 h-4 w-4" />
                  أضف عرض
                </MobileNavLink>
                <MobileNavLink to="/my-listings" onClick={() => setMobileOpen(false)}>
                  <List className="ml-2 h-4 w-4" />
                  رحلاتي
                </MobileNavLink>
                <MobileNavLink to="/bookings" onClick={() => setMobileOpen(false)}>
                  حجوزاتي
                </MobileNavLink>
              </>
            )}
            {!session && (
              <MobileNavLink to="/auth" onClick={() => setMobileOpen(false)}>
                تسجيل الدخول
              </MobileNavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
      className="flex items-center rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
    >
      {children}
    </Link>
  );
}
