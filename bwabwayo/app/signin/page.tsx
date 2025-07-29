'use client'
import AddressModal from "@/components/shop/AddressModal";
import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';


// --- 아이콘 컴포넌트 (Icons) ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [userNickname, setUserNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  return(
    <div>
      <div>
        <AddressModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        />
      </div>
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <div>
        <form action=""></form>
            <button className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>

        </div>
      </div>
    </div>
  )
}