// components/shipping/AddressAddForm.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

type Payload = {
  zipcode: string
  address: string
  address_detail: string
  recipient_name: string
  recipient_phone_number: string
}

// 타입 선언(옵셔널)
declare global {
  interface Window {
    daum: { Postcode: new (opts: { oncomplete: (data: any) => void }) => { open: () => void } }
  }
}

export default function AddressAddForm({
  initial,
  onSubmit,
  onClose: onClose,
}: {
  initial?: Partial<Payload>
  onSubmit: (data: Payload) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Payload>({
    zipcode: initial?.zipcode ?? '',
    address: initial?.address ?? '',
    address_detail: initial?.address_detail ?? '',
    recipient_name: initial?.recipient_name ?? '',
    recipient_phone_number: initial?.recipient_phone_number ?? '',
  })
  const [error, setError] = useState<string>('')
  const [daumReady, setDaumReady] = useState(false)

  // ✅ 스크립트 미리 로드 (한 번만)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.daum?.Postcode) { setDaumReady(true); return }

    const s = document.createElement('script')
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.async = true
    s.onload = () => setDaumReady(true)
    s.onerror = () => console.error('Daum Postcode script load failed')
    document.body.appendChild(s)

    return () => { s.parentNode?.removeChild(s) }
  }, [])

  const set = (k: keyof Payload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const valid = useMemo(() => {
    const phoneDigits = form.recipient_phone_number.replace(/\D/g, '')
    const zipDigits = form.zipcode.replace(/\D/g, '')
    return (
      zipDigits.length === 5 &&
      form.address.trim().length > 0 &&
      form.recipient_name.trim().length > 0 &&
      (phoneDigits.length === 10 || phoneDigits.length === 11)
    )
  }, [form])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError('필수 항목을 올바르게 입력해 주세요.')
      return
    }
    setError('')
    onSubmit({
      ...form,
      zipcode: form.zipcode.replace(/\D/g, '').slice(0, 5),
      recipient_phone_number: form.recipient_phone_number.replace(/\D/g, ''),
    })
  }

  // ✅ 주소 검색 (로드되었을 때만 오픈)
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) return
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // 두목님이 쓰던 로직 동일
        let fullAddress = data.address
        if (data.addressType === 'R') {
          let extra = ''
          if (data.bname) extra += data.bname
          if (data.buildingName) extra += (extra ? `, ${data.buildingName}` : data.buildingName)
          if (extra) fullAddress += ` (${extra})`
        }
        setForm(prev => ({
          ...prev,
          address: fullAddress,
          zipcode: String(data.zonecode).slice(0, 5),
        }))
      },
    }).open()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[640px] max-w-[95vw] rounded-[24px] border-2 border-black bg-white p-6 shadow-xl"
    >
      <h2 className="text-lg font-semibold text-black mb-4 flex items-start justify-between">새 배송지 추가

        <button
          type="button"     
          onClick={(e) => {                         
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="닫기"
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </h2>

      {/* 우편번호 + 찾기 */}
      <div className="flex items-center gap-3 mb-3">
        <input
          value={form.zipcode}
          onChange={(e) =>
            setForm(p => ({ ...p, zipcode: e.target.value.replace(/\D/g, '').slice(0, 5) }))
          }
          placeholder="우편번호"
          inputMode="numeric"
          className="h-11 flex-1 min-w-0 rounded-full border border-[#DDDDDD] px-4 text-sm outline-none"
          aria-label="우편번호"
        />
        <button
          type="button"
          onClick={handleAddressSearch}
          className="h-11 w-[150px] shrink-0 rounded-full border border-[#DDDDDD] px-4 text-sm hover:bg-gray-50"
        >
          우편번호 찾기
        </button>
      </div>


      {/* 기본주소지 */}
      <input
        value={form.address}
        onChange={set('address')}
        placeholder="기본주소지"
        className="mb-3 h-11 w-full rounded-full border border-[#DDDDDD] px-4 text-sm outline-none"
        aria-label="기본주소지"
        readOnly
      />

      {/* 상세주소지 */}
      <input
        value={form.address_detail}
        onChange={set('address_detail')}
        placeholder="상세주소지"
        className="mb-3 h-11 w-full rounded-full border border-[#DDDDDD] px-4 text-sm outline-none"
        aria-label="상세주소지"
      />

      {/* 수령인 */}
      <input
        value={form.recipient_name}
        onChange={set('recipient_name')}
        placeholder="수령인"
        className="mb-3 h-11 w-full rounded-full border border-[#DDDDDD] px-4 text-sm outline-none"
        aria-label="수령인"
      />

      {/* 수령인 전화번호 */}
      <input
        value={form.recipient_phone_number}
        onChange={(e) =>
          setForm(p => ({
            ...p,
            recipient_phone_number: e.target.value.replace(/[^\d-]/g, ''),
          }))
        }
        placeholder="수령인 전화번호"
        inputMode="numeric"
        className="mb-6 h-11 w-full rounded-full border border-[#DDDDDD] px-4 text-sm outline-none"
        aria-label="수령인 전화번호"
      />

      {error && <p className="text-xs text-red-600 -mt-4 mb-4">{error}</p>}

      <button
        type="submit"
        className={`h-12 w-full rounded-full border-2 border-black text-black font-medium
          ${valid ? 'bg-[#ffae00] hover:scale-[1.01] transition' : 'bg-[#ffae00]/60 cursor-not-allowed'}`}
      >
        새 주소 추가
      </button>
    </form>
  )
}
