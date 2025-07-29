'use client'
import AddressModal from "@/components/shop/AddressModal";
import { useState } from "react";


export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(false)

  return(
    <div>
      <div>
        <AddressModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        />
      </div>
      <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
      </div>
    </div>
  )
}