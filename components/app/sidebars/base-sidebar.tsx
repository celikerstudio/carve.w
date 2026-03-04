"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { iconMap } from "@/components/icons/sidebar-icons";

type NavItem = {
  title: string;
  href: string;
  icon: any;
  description: string;
};

type NavGroup = {
  label: string;
  icon: any;
  items: NavItem[];
};

interface BaseSidebarProps {
  navigationGroups: NavGroup[];
  ariaLabel: string;
}

export function BaseSidebar({ navigationGroups, ariaLabel }: BaseSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 transition-all duration-300 ease-in-out bg-surface"
      style={{
        width: isHovered ? "180px" : "52px",
        zIndex: 45,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="navigation"
      aria-label={ariaLabel}
    >
      <nav className="flex-1 px-1.5 pt-2 overflow-y-auto scrollbar-thin-auto-hide">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-1.5">
            {/* Group divider - minimal line */}
            <div className="flex items-center justify-center mb-1 h-4">
              <div className={cn(
                "h-px bg-gray-300 transition-all duration-300",
                isHovered ? "w-full mx-2" : "w-3"
              )} />
            </div>

            {/* Group items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const IconComponent = iconMap[item.icon?.name] || iconMap['HomeIcon'];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-center rounded-md mb-0.5 transition-all duration-200",
                    isHovered ? "h-8 px-2 justify-start" : "h-9 w-9 mx-auto",
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-900"
                  )}
                >
                  {IconComponent && (
                    <IconComponent
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        isHovered ? "h-4 w-4" : "h-5 w-5",
                        isActive
                          ? "text-gray-700"
                          : "text-gray-500 group-hover:text-gray-700"
                      )}
                    />
                  )}
                  {isHovered && (
                    <span className="ml-2.5 text-sm font-medium truncate">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
