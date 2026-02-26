"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("./Navigation"), { ssr: false });
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
  session: any;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 transition-all duration-300">
        <div className="w-full px-4 sm:px-6 py-4 grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link href={session ? "/dashboard" : "/"} className="text-lg font-semibold transition-colors text-[#584b53] hover:text-[#E4BB97]">
              Tutorlytics
            </Link>
          </div>
          <div className="flex justify-center">
            <Navigation session={session} />
          </div>
          <div className="flex justify-end">
            {session ? (
              <ProfileDropdown user={session.user} />
            ) : (
              <a href="/signin" className="bg-[#3D4756] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#2A3441] transition-colors duration-200">Log in</a>
            )}
          </div>
        </div>
      </header>
  );
}
