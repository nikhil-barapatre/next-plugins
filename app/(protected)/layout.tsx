"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Package,
  Users,
  LogOut,
  TextAlignJustify
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
  ];

  // Close mobile sidebar on resize above breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden ">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          "md:relative absolute z-40"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b">
          {!collapsed && <h1 className="font-semibold text-lg">Next-Plugins</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.innerWidth < 768
                ? setMobileOpen(!mobileOpen)
                : setCollapsed(!collapsed)
            }
          >
            {collapsed ? (
              <TextAlignJustify className="h-5 w-5" />
            ) : (
              <TextAlignJustify className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;  
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed ? "justify-center px-2" : "gap-3"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "border-t p-3",
            collapsed && "p-2 flex justify-center"
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 mr-2 shrink-0" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Dim background on mobile */}
      {mobileOpen && (
        <div
          className="absolute inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center h-14 px-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="ml-3 font-semibold text-lg">Dashboard</h2>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
