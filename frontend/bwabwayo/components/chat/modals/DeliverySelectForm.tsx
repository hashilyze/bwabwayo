'use client'

import { useMemo, useState } from 'react'
import { X, MapPin, CheckCircle2, Circle, Plus } from 'lucide-react'
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal"
import AddressAddForm from '@/components/chat/modals/DeliveryForm'

export type AddressItem = {
  id: string | number
  address: string        // 예: '부산광역시 연제구 중앙대로 1134번길'
  detail?: string    // 예: '부산광역시 연제구 중앙대로 1134번길 34'
}


export default function AddressSelectModal({
  items,
  initialSelectedId,
  onConfirm,
  onClose,
  onAddAddress,
}: {
  items: AddressItem[]
  initialSelectedId?: string | number
  onConfirm: (selected: AddressItem) => void
  onClose: () => void
  onAddAddress?: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | number | undefined>(
    initialSelectedId ?? items[0]?.id
  )

  const selected = useMemo(
    () => items.find(i => i.id === selectedId),
    [items, selectedId]
  )

  const handleConfirm = () => {
    if (selected) onConfirm(selected)
  }

  const [openAdd, setOpenAdd] = useState(false)

  const handleCreateAddress = async (payload: {
    zipcode: string
    address: string
    address_detail: string
    recipient_name: string
    recipient_phone_number: string
  }) => {
    // TODO: 서버 전송하거나, 상위 리스트에 추가
    // await fetch('/api/addresses', {...})
    console.log('새 주소 추가:', payload)
    setOpenAdd(false)
  }

  return (
    <div className="relative w-[720px] max-w-[92vw] rounded-2xl border-2 border-black bg-white p-6 shadow-xl">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-black">배송지 선택</h2>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 리스트 */}
      <div className="mt-4 space-y-3" role="radiogroup" aria-label="배송지 목록">
        {items.map((addr) => {
          const active = addr.id === selectedId
          return (
            <button
              key={addr.id}
              role="radio"
              aria-checked={active}
              onClick={() => setSelectedId(addr.id)}
              className={[
                'w-full text-left rounded-2xl px-5 py-4 border transition',
                active
                  ? 'bg-[#F5F5F5] border-transparent'
                  : 'bg-[#F5F5F5]/70 border-transparent hover:bg-[#F5F5F5]'
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-black/70" />
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-black">
                    {addr.address}
                  </div>
                  {addr.detail && (
                    <div className="text-sm text-gray-600 mt-1">
                      {addr.detail}
                    </div>
                  )}
                </div>
                <div className="shrink-0 mt-0.5">
                  {active ? (
                    <CheckCircle2 className="w-6 h-6 text-[#ffae00]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {/* 배송지 추가 */}
        <button
          type="button"
          onClick={() => setOpenAdd(true)}
          className="w-full h-9 rounded-full border border-[#DDDDDD] text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          배송지 추가
        </button>

        <OverlayPortal open={openAdd} onClose={() => setOpenAdd(false)}>
          <AddressAddForm
            onSubmit={handleCreateAddress}
            onClose={() => setOpenAdd(false)}
          />
        </OverlayPortal>
      </div>

      {/* 액션 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleConfirm}
          className="h-11 px-6 rounded-full border-2 border-black bg-[#ffae00] text-black font-semibold hover:scale-[1.02] transition"
        >
          선택하기
        </button>
      </div>
    </div>
  )
}
