'use client'

import { useModalStore } from '@/stores/modalStore';
import LoginModal from '@/components/auth/LoginModal';

export default function LoginModalWrapper() {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();

  return (
    <>
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
        />
      )}
    </>
  );
} 