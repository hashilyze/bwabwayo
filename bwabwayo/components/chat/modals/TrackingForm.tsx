'use client'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const CARRIERS = [
  {
    name:'CJ대한통운',
    courier_code:'04'
  },
  {
    name:'롯데택배',
    courier_code:'08'
  },
  {
    name:'우체국택배',
    courier_code:'01'
  },
  {
    name:'한진택배',
    courier_code:'05'
  },
  {
    name:'로젠택배',
    courier_code:'06'
  },
  {
    name:'대신택배',
    courier_code:'22'
  },
  {
    name:'기타',
    courier_code:'99'
  }
]

type Carrier = {
  name: string;
  courier_code: string;
}

export default function TrackingNumberModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (v: { carrier: Carrier; trackingNumber: string }) => void
}) {
  const [isCarrierDropdownOpen, setIsCarrierDropdownOpen] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | ''>('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [error, setError] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setIsCarrierDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const handleCarrierSelect = (c: Carrier) => {
    setSelectedCarrier(c)
    setIsCarrierDropdownOpen(false)
  }

  const handleSubmit = () => {
    if (!selectedCarrier) return setError('택배사를 선택해 주세요.')
    if (!trackingNumber.trim()) return setError('송장번호를 입력해 주세요.')
    setError('')
    onSubmit({ carrier: selectedCarrier as Carrier, trackingNumber })
  }

  return (

    <div
      ref={boxRef}
      className="bg-white w-[476px] h-[209px] relative rounded-2xl border-2 border-black shadow"
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute !w-6 !h-6 !top-[18px] !left-[428px] inline-flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 헤더 */}
      <header className="absolute top-[37px] left-[35px]">
        <h1 className="font-bold text-black text-xl tracking-[0] leading-normal">
          운송장 번호 입력하기
        </h1>
      </header>

      {/* 입력 버튼 */}
      <button
        onClick={handleSubmit}
        className="absolute w-[121px] h-[41px] top-[150px] left-[336px] bg-[#ffae00] rounded-[30px] border-2 border-solid border-black transition-transform hover:scale-105 "
        aria-label="운송장 번호 입력하기"
      >
        <span className="absolute top-2 left-8 font-semibold text-black text-base text-center tracking-[0] leading-normal">
          입력하기
        </span>
      </button>

      {/* 택배사 선택 */}
      <div className="absolute w-[143px] h-[43px] top-[89px] left-[25px]">
        <button
          onClick={() => setIsCarrierDropdownOpen((v) => !v)}
          className="w-[143px] h-[43px] bg-white rounded-[20px] border border-solid border-[#dddddd] text-left px-[21px] text-sm text-black relative"
          aria-label="택배사 선택"
          aria-expanded={isCarrierDropdownOpen}
          aria-haspopup="listbox"
        >
          {selectedCarrier ? selectedCarrier.name : '택배사선택'}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            ▾
          </span>
        </button>

        {isCarrierDropdownOpen && (
          <ul
            className="absolute top-[45px] left-0 w-[143px] bg-white border border-solid border-[#dddddd] rounded-[10px] shadow-lg z-10"
            role="listbox"
            aria-label="택배사 목록"
          >
            {CARRIERS.map((carrier) => (
              <li key={carrier.name}>
                <button
                  type="button"
                  onClick={() => handleCarrierSelect(carrier)}
                  className="w-full px-4 py-2 text-left text-sm font-normal text-black hover:bg-gray-100 focus:outline-none first:rounded-t-[10px] last:rounded-b-[10px]"
                  role="option"
                  aria-selected={selectedCarrier === carrier}
                >
                  {carrier.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 송장번호 입력 */}
      <div className="absolute w-[271px] h-[43px] top-[89px] left-[181px] rounded-[20px] border border-solid border-[#dddddd]">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="송장번호"
          className="w-full h-full px-[18px] text-black text-sm rounded-[20px] border-0 outline-none placeholder:text-[#7c7c7c]"
          aria-label="송장번호 입력"
        />
      </div>

      {error && (
        <p className="absolute left-[25px] top-[140px] text-xs text-red-600">
          {error}
        </p>
      )}
    </div>

  )
}
