"use client";

import dynamic from "next/dynamic";
import { useModal } from "./contexts/ModalContext";
const Navigation = dynamic(() => import("./Navigation"), { ssr: false });
import ProfileEditModal from "./profile/ProfileEditModal";
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
  session: any;
}

export default function Header({ session }: HeaderProps) {
  const { isModalOpen } = useModal();

  return (
    <>
      <header className={`fixed top-4 left-4 right-4 z-[60] bg-white/40 backdrop-blur-md border border-white/20 rounded-xl shadow-sm transition-all duration-300 ${
        isModalOpen ? 'blur-sm' : ''
      }`}>
        <div className="w-full px-4 sm:px-6 py-4 grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <a href="/" className="text-lg font-semibold hover:text-blue-600 transition-colors">
              Tutor Tools
            </a>
          </div>
          <div className="flex justify-center">
            <Navigation session={session} />
          </div>
          <div className="flex justify-end">
            {session ? <ProfileDropdown user={session.user} /> : null}
          </div>
        </div>
      </header>
      {/* Render profile edit modal globally so it works on any page */}
      {session?.user ? <ProfileEditModal user={session.user} /> : null}
    </>
  );
}
