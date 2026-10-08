import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
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
}

export default function Navbar({ brandTo, links }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link to={brandTo} className="mr-2 text-lg font-bold">
          Neurolog
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
      </div>
    </header>
  );
}
