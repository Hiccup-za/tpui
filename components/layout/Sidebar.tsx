"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user/UserMenu";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">⚪</span>
            {!isCollapsed && (
              <span className="font-semibold text-sm truncate">Central</span>
            )}
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg transition-colors",
                  isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={cn(
          "border-t p-4",
          isCollapsed ? "flex justify-center" : ""
        )}>
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
