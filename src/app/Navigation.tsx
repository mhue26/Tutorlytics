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
      ) : null}
      {!session ? (
        <div className="flex items-center gap-2">
          <a href="/about" className="hover:font-bold">About us</a>
          <span className="px-2">·</span>
          <a href="/signin" className="rounded-md border px-3 py-1.5 hover:bg-gray-50">Log in</a>
          <a href="/signup" className="rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700">Sign up</a>
        </div>
      ) : null }
    </nav>
  );
}
