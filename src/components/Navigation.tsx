"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Map as MapIcon, PlusCircle, Search, Gift } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const navItems = [
    { href: "/today", icon: Calendar, label: "Today" },
    { href: "/map", icon: MapIcon, label: "Map" },
    { href: "/capture", icon: PlusCircle, label: "Capture" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/wrapped", icon: Gift, label: "Wrapped" },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
      <ul className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
