import { create } from 'zustand';

interface ModalState {
  isLoginModalOpen: boolean;
  isPaymentModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  isPaymentModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),
}));

