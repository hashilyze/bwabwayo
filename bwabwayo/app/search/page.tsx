'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStore } from '../../stores/productStore';
import ProductCard from '../../components/product/ProductCard';

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
    searchParams: { title?: string, category?: string }
}) {
  const router = useRouter();
  const { products, loading, error, searchProducts, getProductsByCategory, clearProducts } = useProductStore();
  const [showMajorCategories, setShowMajorCategories] = useState<boolean>(false);
  const [showMinorCategories, setShowMinorCategories] = useState<boolean>(false);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<string>('');
  const [selectedMinorCategory, setSelectedMinorCategory] = useState<string>('');
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('전체');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // 쿼리 파라미터에서 카테고리 정보 설정 및 API 호출
  React.useEffect(() => {
    if (searchParams.category) {
      const categoryId = parseInt(searchParams.category);
      
      // 대분류인지 확인
      const majorCategory = CATEGORIES.find(cat => cat.id === categoryId);
      if (majorCategory) {
        setSelectedMajorCategory(majorCategory.name);
        setSelectedCategoryPath(`전체 > ${majorCategory.name}`);
        getProductsByCategory(categoryId);
        return;
      }
      
      // 소분류인지 확인
      for (const majorCat of CATEGORIES) {
        const minorCategory = majorCat.sub.find(sub => sub.id === categoryId);
        if (minorCategory) {
          setSelectedMajorCategory(majorCat.name);
          setSelectedMinorCategory(minorCategory.name);
          setSelectedCategoryPath(`전체 > ${majorCat.name} > ${minorCategory.name}`);
          getProductsByCategory(categoryId);
          return;
        }
      }
    } else if (searchParams.title) {
      // 검색어가 있으면 검색 API 호출
      searchProducts(searchParams.title);
    } else {
      // category 파라미터가 없으면 카테고리 초기화
      setSelectedMajorCategory('');
      setSelectedMinorCategory('');
      setSelectedCategoryPath('전체');
      setShowMajorCategories(false);
      setShowMinorCategories(false);
      clearProducts();
    }
  }, [searchParams.category, searchParams.title, searchProducts, getProductsByCategory, clearProducts]);

  // 전체 클릭 시
  const handleAllCategoryClick = () => {
    setSelectedMajorCategory('');
    setSelectedMinorCategory('');
    setSelectedCategoryPath('전체');
    setShowMajorCategories(false);
    setShowMinorCategories(false);
    
    // 카테고리 쿼리 파라미터 제거
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    
    // 기존 쿼리 파라미터 유지 (category 제외)
    const title = searchParams.get('title');
    
    // 새로운 URL 생성
    const newUrl = new URL('/search', window.location.origin);
    if (title) newUrl.searchParams.set('title', title);
    
    router.push(newUrl.pathname + newUrl.search);
  };

  // + 버튼 클릭 시 카테고리 토글
  const handleShowMajorCategories = () => {
    if (showMajorCategories) {
      // 대분류가 열려있으면 닫기
      setShowMajorCategories(false);
    } else if (showMinorCategories) {
      // 소분류가 열려있으면 닫기
      setShowMinorCategories(false);
    } else if (selectedMajorCategory && !showMinorCategories) {
      // 대분류가 선택되어 있고 소분류가 닫혀있으면 소분류 열기
      setShowMinorCategories(true);
    } else {
      // 아무것도 열려있지 않으면 대분류 열기
      setShowMajorCategories(true);
    }
  };

  // 대분류 선택 시
  const handleMajorCategorySelect = (categoryName: string) => {
    const selectedCategory = CATEGORIES.find(cat => cat.name === categoryName);
    if (selectedCategory) {
      setSelectedMajorCategory(categoryName);
      setSelectedMinorCategory(''); // 소분류 초기화
      setShowMajorCategories(false);
      setShowMinorCategories(true);
      setSelectedCategoryPath(`전체 > ${categoryName}`);
      
      // 대분류 선택 시 검색 페이지로 이동
      const currentUrl = new URL(window.location.href);
      const searchParams = new URLSearchParams(currentUrl.search);
      
      // 기존 쿼리 파라미터 유지
      const title = searchParams.get('title');
      
      // 새로운 URL 생성
      const newUrl = new URL('/search', window.location.origin);
      if (title) newUrl.searchParams.set('title', title);
      newUrl.searchParams.set('category', selectedCategory.id.toString());
      
      router.push(newUrl.pathname + newUrl.search);
    }
  };

  // 소분류 선택 시
  const handleMinorCategorySelect = (categoryName: string) => {
    const selectedMajorCategoryObj = CATEGORIES.find(cat => cat.name === selectedMajorCategory);
    const selectedSubCategory = selectedMajorCategoryObj?.sub.find(sub => sub.name === categoryName);
    
    if (selectedSubCategory) {
      setSelectedMinorCategory(categoryName);
      setShowMinorCategories(false);
      setSelectedCategoryPath(`전체 > ${selectedMajorCategory} > ${categoryName}`);
      
      // 소분류 선택 시 검색 페이지로 이동
      const currentUrl = new URL(window.location.href);
      const searchParams = new URLSearchParams(currentUrl.search);
      
      // 기존 쿼리 파라미터 유지
      const title = searchParams.get('title');
      
      // 새로운 URL 생성
      const newUrl = new URL('/search', window.location.origin);
      if (title) newUrl.searchParams.set('title', title);
      newUrl.searchParams.set('category', selectedSubCategory.id.toString());
      
      router.push(newUrl.pathname + newUrl.search);
    }
  };

  // 가격 적용
  const handlePriceApply = () => {
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : 0;
    console.log('가격 범위:', min, '~', max);
  };

      return(
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <h1 className='text-2xl font-bold text-black'>
            {searchParams.title ? `'${searchParams.title}'` : ''}검색결과
          </h1>
          <span className='text-sm text-[#5a5a5a]'>총 0개</span>
        </div>
        <div className="search-category w-full bg-white">
          <table className="w-full">
            <tbody>
              {/* 카테고리 헤더 행 */}
              <tr className="border-t-2 border-t-[#000000] border-b border-b-[#dadee5]">
                <td className="flex justify-between items-center w-36 bg-gray-50 px-4 py-4 text-left">
                  <div className="text-base text-black">카테고리</div>
                  <div
                    onClick={handleShowMajorCategories}
                    className="ml-2 text-lg font-light text-gray-500 hover:text-black cursor-pointer"
                  >
                    {(showMajorCategories || showMinorCategories) ? '-' : '+'}
                  </div>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center">
                    {selectedCategoryPath === '전체' ? (
                      <span className="">{selectedCategoryPath}</span>
                    ) : (
                      <ul className="flex items-center gap-2">
                        <li 
                          className="cursor-pointer hover:text-[#155dfc]"
                          onClick={handleAllCategoryClick}
                        >
                          전체
                        </li>
                        <li className="text-sm leading-5 text-[#9ca3af]">&gt;</li>
                        <li 
                          className="cursor-pointer hover:text-[#155dfc]"
                          onClick={() => handleMajorCategorySelect(selectedMajorCategory)}
                        >
                          {selectedMajorCategory}
                        </li>
                        {selectedMinorCategory && (
                          <>
                            <li className="text-sm leading-5 text-[#9ca3af]">&gt;</li>
                            <li 
                              className="cursor-pointer hover:text-[#155dfc]"
                              onClick={() => handleMinorCategorySelect(selectedMinorCategory)}
                            >
                              {selectedMinorCategory}
                            </li>
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
              {/* 대분류 선택 행 */}
              {showMajorCategories && (
              <tr className="category border-b border-[#dadee5]">
                <td className="w-36 bg-gray-50 p-4">대분류 선택</td>
                <td className="p-4">
                  <ul className="grid grid-cols-8 gap-2">
                    {CATEGORIES.map((category) => (
                      <li 
                        key={category.id}
                        onClick={() => handleMajorCategorySelect(category.name)}
                        className="text-sm text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer"
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              )}

              {/* 소분류 선택 행 */}
              {showMinorCategories && selectedMajorCategory && (
              <tr className="category border-b border-[#dadee5]">
                <td className="w-36 bg-gray-50 p-4">소분류 선택</td>
                <td className="p-4">
                  <ul className="grid grid-cols-8 gap-2">
                    {CATEGORIES.find(cat => cat.name === selectedMajorCategory)?.sub.map((subCategory) => (
                      <li 
                        key={subCategory.id}
                        onClick={() => handleMinorCategorySelect(subCategory.name)}
                        className="text-sm text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer"
                      >
                        {subCategory.name}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              )}

            {/* 가격 필터 행 */}
            <tr className="border-b border-[#dadee5]">
              <td className="w-36 bg-gray-50 p-4">
                <h3 className="text-base font-normal text-black">가격</h3>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {/* 최소 가격 입력 */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="최소 가격"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className="w-36 px-3 py-2 border border-gray-200 rounded-sm text-sm text-black focus:outline-none focus:border-[#000000] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className="w-36 px-3 py-2 border border-gray-200 rounded-sm text-sm text-black focus:outline-none focus:border-[#000000] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* 적용 버튼 */}
                  <button
                    onClick={handlePriceApply}
                    className="w-14 h-9 bg-black text-white text-sm font-normal rounded-sm cursor-pointer"
                  >
                    적용
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      ) : products.length > 0 ? (
        <ProductCard products={products} />
      ) : (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-500">검색 결과가 없습니다.</div>
        </div>
      )}
    </div>
  )
}