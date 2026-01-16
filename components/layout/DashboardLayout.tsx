"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const SIDEBAR_STATE_KEY = "sidebar-collapsed";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isInitialMount = useRef(true);
  const hasUserPreference = useRef(false);
  
  // Initialize state - check localStorage first, then default based on page
  const getInitialState = () => {
    if (typeof window === "undefined") return !isHomePage;
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved !== null) {
      hasUserPreference.current = true;
      return saved === "true";
    }
    return !isHomePage;
  };
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialState);

  // After hydration, mark initial mount as complete
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Update state when pathname changes, but only if no saved preference exists
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialMount.current) return;
    
    // Only update if user hasn't set a preference
    if (!hasUserPreference.current) {
      // No saved preference, use default: collapsed on all pages except home
      setIsSidebarCollapsed(!isHomePage);
    }
  }, [pathname, isHomePage]);

  const handleToggleSidebar = () => {
    hasUserPreference.current = true;
    setIsSidebarCollapsed((prev) => {
      const newValue = !prev;
      // Save to localStorage when user manually toggles
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(newValue));
      }
      return newValue;
    });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
