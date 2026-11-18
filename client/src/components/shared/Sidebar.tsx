'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Stethoscope, Users, ChevronLeft, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  isMobile: boolean;
}

export function Sidebar({ collapsed, setCollapsed, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        {!collapsed && (
          <>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl text-primary-600">⚕</span>
              <span className="font-semibold tracking-tight">Doctor Tracker</span>
            </Link>
            <Button variant="outline" size="icon" onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
        {collapsed && (
          <Button variant="outline" size="icon" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
            <span className="text-xl">⚕</span>
          </Button>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
              `}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          className="w-full text-left gap-2"
          onClick={() => {
            // Logout handled via top bar; keep here as fallback
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={`
        border-r border-border bg-card shadow-soft
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {sidebarContent}
    </aside>
  );
}

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl text-primary-600">⚕</span>
          <span className="font-semibold tracking-tight">Doctor Tracker</span>
        </Link>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Button variant="outline" className="w-full text-left gap-2">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );
}
