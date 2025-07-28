'use client';

import React, { useState } from 'react';

// Category.tsx의 CATEGORIES 참고
const CATEGORIES = [
  {
    id: 1,
    name: '여성의류',
    sub: [
      {id: 11, name: '상의'},
      {id: 12, name: '하의'},
      {id: 13, name: '아우터'},
      {id: 14, name: '스웨터'},
    ]
  },
  { 
    id: 2,
    name: '남성의류', 
    sub: [
      {id: 21, name: '상의'},
      {id: 22, name: '하의'},
      {id: 23, name: '아우터'},
    ] 
  },
  { 
    id: 3,
    name: '신발', 
    sub: [
      {id: 31, name: '스니커즈'},
      {id: 32, name: '남성화'},
      {id: 33, name: '여성화'},
      {id: 34, name: '스포츠화'},
    ] 
  },
  { 
    id: 4,
    name: '가방/지갑', 
    sub: [
      {id: 41, name: '가방'},
      {id: 42, name: '지갑'},
    ] 
  },
  { 
    id: 5,
    name: '시계', 
    sub: [] 
  },
  { 
    id: 6,
    name: '쥬얼리', 
    sub: [] 
  },
  { 
    id: 7,
    name: '패션 액세서리', 
    sub: [] 
  },
  { 
    id: 8,
    name: '디지털', 
    sub: [
      {id: 81, name: '모바일'},
      {id: 82, name: 'PC/노트북'},
      {id: 83, name: '카메라'},
    ] 
  },
  { 
    id: 9,
    name: '가전제품', 
    sub: [] 
  },
  { 
    id: 10,
    name: '스포츠/레저', 
    sub: [
      {id: 101, name: '스포츠'},
    ] 
  },
  { 
    id: 11,
    name: '스타굿즈', 
    sub: [] 
  },
  { 
    id: 12,
    name: '키덜트', 
    sub: [] 
  },
  { 
    id: 13,
    name: '예술/희귀/수집품', 
    sub: [] 
  },
  { 
    id: 14,
    name: '음반/악기', 
    sub: [] 
  },
  { 
    id: 15,
    name: '도서/티켓/문구', 
    sub: [] 
  },
  { 
    id: 16,
    name: '뷰티/미용', 
    sub: [] 
  },
  { 
    id: 17,
    name: '생활/주방용품', 
    sub: [] 
  },
  { 
    id: 18,
    name: '식품', 
    sub: [] 
  },
  { 
    id: 19,
    name: '유아/출산', 
    sub: [] 
  },
  { 
    id: 20,
    name: '반려동물용품', 
    sub: [] 
  },
  { 
    id: 21,
    name: '기타', 
    sub: [] 
  },
];

export default function SearchPage({
    searchParams,
}: {
    searchParams: { title?: string }
}) {
  const [showMajorCategories, setShowMajorCategories] = useState<boolean>(false);
  const [showMinorCategories, setShowMinorCategories] = useState<boolean>(false);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<string>('');
  const [selectedMinorCategory, setSelectedMinorCategory] = useState<string>('');
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('전체');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // + 버튼 클릭 시 대분류 표시
  const handleShowMajorCategories = () => {
    setShowMajorCategories(true);
    setShowMinorCategories(false);
    setSelectedMajorCategory('');
    setSelectedMinorCategory('');
  };

  // 대분류 선택 시
  const handleMajorCategorySelect = (categoryName: string) => {
    setSelectedMajorCategory(categoryName);
    setShowMajorCategories(false);
    setShowMinorCategories(true);
    setSelectedCategoryPath(`전체 > ${categoryName}`);
  };

  // 소분류 선택 시
  const handleMinorCategorySelect = (categoryName: string) => {
    setSelectedMinorCategory(categoryName);
    setShowMinorCategories(false);
    setSelectedCategoryPath(`전체 > ${selectedMajorCategory} > ${categoryName}`);
  };

  // 가격 적용
  const handlePriceApply = () => {
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : 0;
    console.log('가격 범위:', min, '~', max);
  };

  return(
    <div>
      <div className="search-category w-full max-w-6xl mx-auto bg-white">
        <table className="w-full">
          <tbody>
            {/* 카테고리 행 */}
            <tr className="border-b border-gray-200">
              <td className="w-48 bg-gray-50 p-4 align-top">
                <h3 className="text-base font-normal text-black mb-4">카테고리</h3>
                <div className="flex items-center">
                  <span className="text-base font-normal text-black">{selectedCategoryPath}</span>
                  <button
                    onClick={handleShowMajorCategories}
                    className="ml-2 text-lg font-light text-gray-500 hover:text-black"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-4">
                {/* 대분류 표시 */}
                {showMajorCategories && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">대분류 선택</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleMajorCategorySelect(category.name)}
                          className="text-sm font-normal px-3 py-2 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 소분류 표시 */}
                {showMinorCategories && selectedMajorCategory && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">소분류 선택</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {CATEGORIES.find(cat => cat.name === selectedMajorCategory)?.sub.map((subCategory) => (
                        <button
                          key={subCategory.id}
                          onClick={() => handleMinorCategorySelect(subCategory.name)}
                          className="text-sm font-normal px-3 py-2 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          {subCategory.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </td>
            </tr>

            {/* 가격 필터 행 */}
            <tr className="border-b border-gray-200">
              <td className="w-48 bg-gray-50 p-4">
                <h3 className="text-base font-normal text-black">가격</h3>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-4">
                  {/* 최소 가격 입력 */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="최소 가격"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-36 h-9 px-3 border border-gray-200 rounded text-sm text-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 구분선 */}
                  <span className="text-sm text-black">~</span>

                  {/* 최대 가격 입력 */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="최대 가격"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-36 h-9 px-3 border border-gray-200 rounded text-sm text-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 적용 버튼 */}
                  <button
                    onClick={handlePriceApply}
                    className="w-14 h-9 bg-blue-600 text-white text-sm font-normal rounded hover:bg-blue-700 transition-colors"
                  >
                    적용
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>{searchParams.title}</div>
    </div>
  )
}