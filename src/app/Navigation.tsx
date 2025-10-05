"use client";

interface NavigationProps {
  session: any;
}

export default function Navigation({ session }: NavigationProps) {
  return (
    <nav className="text-base flex items-center justify-center gap-2">
      {session ? (
        <>
          <a href="/dashboard" className="hover:font-bold">DASHBOARD</a>
          <span className="px-2">·</span>
          <a href="/students" className="hover:font-bold">STUDENTS</a>
          <span className="px-2">·</span>
          <a href="/classes" className="hover:font-bold">CLASSES</a>
          <span className="px-2">·</span>
          <a href="/calendar" className="hover:font-bold">CALENDAR</a>
          <span className="px-2">·</span>
          <a href="/billing" className="hover:font-bold">INVOICING</a>
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
