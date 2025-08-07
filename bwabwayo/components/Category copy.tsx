// 파일 경로: components/CategoryModal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/stores/categoryStore';

// --- Props 타입 정의 ---
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- 카테고리 모달 컴포넌트 ---
export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  // Zustand 스토어에서 카테고리 목록과 로딩 상태를 가져옵니다.
  const { categories, loading } = useCategoryStore();
  // 현재 마우스를 올린(선택한) 대분류의 상태를 관리합니다.
  const [selectedMajorCategory, setSelectedMajorCategory] = useState(categories[0] || null);
  const router = useRouter();

  // 소분류 클릭 시, 해당 카테고리 검색 페이지로 이동하고 모달을 닫습니다.
  const handleSubCategoryClick = (categoryId: number) => {
    router.push(`/search?category=${categoryId}`);
    onClose();
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  return (
    // 모달 배경 (Overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      {/* 모달 컨텐츠 (이벤트 버블링을 막아, 배경 클릭 시에만 닫히도록 함) */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[70vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 좌측: 대분류 목록 */}
        <nav className="w-1/4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <ul>
            {loading ? (
              <li className="p-4 text-center text-gray-500">로딩 중...</li>
            ) : (
              categories.map((majorCat) => (
                <li key={majorCat.categoryId}>
                  <button
                    onMouseEnter={() => setSelectedMajorCategory(majorCat)}
                    className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                      selectedMajorCategory?.categoryId === majorCat.categoryId
                        ? 'bg-white font-bold text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {majorCat.categoryName}
                  </button>
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* 우측: 소분류 목록 */}
        <main className="w-3/4 p-8 overflow-y-auto">
          {selectedMajorCategory ? (
            <div>
              <h2 className="text-xl font-bold mb-6">{selectedMajorCategory.categoryName}</h2>
              {selectedMajorCategory.subCategories.length > 0 ? (
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  {selectedMajorCategory.subCategories.map((subCat) => (
                    <li key={subCat.categoryId}>
                      <button
                        onClick={() => handleSubCategoryClick(subCat.categoryId)}
                        className="text-gray-600 hover:text-blue-600 hover:underline text-sm"
                      >
                        {subCat.categoryName}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">이 카테고리에는 하위 항목이 없습니다.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">왼쪽에서 카테고리를 선택해주세요.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
