"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type ModalType = 'none' | 'profile' | 'teachingPeriods';

interface ModalContextType {
  // Derived open flag for UI effects like blur
  isModalOpen: boolean;
  // Back-compat: toggles profile modal when opening; prefer setModalType
  setIsModalOpen: (open: boolean) => void;
  // New explicit modal API
  modalType: ModalType;
  setModalType: (type: ModalType) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>('none');

  const value = useMemo<ModalContextType>(() => ({
    isModalOpen: modalType !== 'none',
    setIsModalOpen: (open: boolean) => setModalType(open ? 'profile' : 'none'),
    modalType,
    setModalType,
  }), [modalType]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
