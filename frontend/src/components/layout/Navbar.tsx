import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon: LucideIcon;
}

interface NavbarProps {
  brandTo: string;
  links: NavItem[];
  user?: { name: string; picture?: string };
  onLogout?: () => void;
}

function UserBadge({
  user,
  onLogout,
  className,
}: {
  user: { name: string; picture?: string };
  onLogout?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {user.picture ? (
        <img
          src={user.picture}
          alt=""
          referrerPolicy="no-referrer"
          className="size-8 rounded-full"
        />
      ) : (
        <span className="bg-brand-magenta/15 text-brand-magenta flex size-8 items-center justify-center rounded-full text-sm font-semibold">
          {(user.name || "?").charAt(0).toUpperCase()}
        </span>
      )}
      <span className="max-w-32 truncate text-sm font-medium">
        {user.name || "Tài khoản"}
      </span>
      {onLogout && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          aria-label="Đăng xuất"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      )}
    </div>
  );
}

export default function Navbar({ brandTo, links, user, onLogout }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4">
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mở menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1" aria-label="Điều hướng">
                {links.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex items-center gap-3 rounded-md px-4 font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        "h-12 text-base",
                        isActive && "bg-secondary text-secondary-foreground",
                      )
                    }
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </NavLink>
                ))}
                {user && (
                  <div className="mt-4 border-t pt-4">
                    <UserBadge
                      user={user}
                      onLogout={() => {
                        setOpen(false);
                        onLogout?.();
                      }}
                    />
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link to={brandTo} className="mr-2 text-lg font-bold">
          NeuroLog
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Điều hướng"
        >
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  "h-9 px-4 text-sm",
                  isActive && "bg-secondary text-secondary-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="ml-auto">
            <UserBadge user={user} onLogout={onLogout} />
          </div>
        )}
      </div>
    </header>
  );
}
