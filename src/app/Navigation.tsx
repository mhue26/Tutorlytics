"use client";

import { usePathname } from 'next/navigation';

interface NavigationProps {
  session: any;
}

export default function Navigation({ session }: NavigationProps) {
  const pathname = usePathname();
  
  return (
    <nav className="text-base flex items-center justify-center gap-2">
      {session ? (
        <>
          <a href="/dashboard" className={pathname === '/dashboard' ? 'font-bold' : 'hover:font-bold'} style={{ color: '#584B53' }}>Dashboard</a>
          <span className="px-2">·</span>
          <a href="/students" className={pathname?.startsWith('/students') ? 'font-bold' : 'hover:font-bold'} style={{ color: '#584B53' }}>Students</a>
          <span className="px-2">·</span>
          <a href="/classes" className={pathname?.startsWith('/classes') ? 'font-bold' : 'hover:font-bold'} style={{ color: '#584B53' }}>Classes</a>
          <span className="px-2">·</span>
          <a href="/calendar" className={pathname === '/calendar' ? 'font-bold' : 'hover:font-bold'} style={{ color: '#584B53' }}>Calendar</a>
          <span className="px-2">·</span>
          <a href="/billing" className={pathname === '/billing' ? 'font-bold' : 'hover:font-bold'} style={{ color: '#584B53' }}>Invoicing</a>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <a href="/about" className="hover:font-bold" style={{ color: '#584B53' }}>About</a>
          <span className="px-2">·</span>
          <a href="/contact" className="hover:font-bold" style={{ color: '#584B53' }}>Contact</a>
        </div>
      )}
    </nav>
  );
}
