import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function Navbar({ brandTo, links, user, onLogout }: NavbarProps) {
  return (
    <>
      <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 w-full border-b border-border/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Link
            to={brandTo}
            className="flex shrink-0 items-center"
            aria-label="NeuroLog"
          >
            <img
              src="/logo-nav.png"
              alt="NeuroLog"
              className="h-9 w-auto mix-blend-multiply"
            />
          </Link>

          <nav
            className="ml-4 hidden items-center gap-1 lg:flex"
            aria-label="Điều hướng"
          >
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-full pr-2 pl-1"
                    aria-label="Mở menu tài khoản"
                  >
                    <Avatar className="size-8 border border-border/60">
                      {user.picture && (
                        <AvatarImage
                          src={user.picture}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <AvatarFallback>
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
                      {user.name || "Tài khoản"}
                    </span>
                    <ChevronDown className="text-muted-foreground size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {user.name || "Tài khoản"}
                  </DropdownMenuLabel>
                  {onLogout && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={onLogout}
                      >
                        <LogOut className="size-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>

      <nav
        className="bg-card/95 fixed inset-x-0 bottom-0 z-50 border-t border-border/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
        aria-label="Điều hướng di động"
      >
        <div className="mx-auto flex w-full max-w-md items-end justify-around px-2 py-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary",
                )
              }
            >
              <item.icon className="size-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
