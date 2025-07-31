'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore, Category, SubCategory } from '@/stores/categoryStore';
import ProductCard from '@/components/product/ProductCard';

export default function SearchPage({
    searchParams,
}: {
    searchParams: { title?: string, category?: string }
}) {
  const router = useRouter();
  const { products, loading, error, getProducts, clearProducts } = useProductStore();
  const { categories, getCategories } = useCategoryStore();
  const [showMajorCategories, setShowMajorCategories] = useState<boolean>(false);
  const [showMinorCategories, setShowMinorCategories] = useState<boolean>(false);
  const [selectedMajorCategoryId, setSelectedMajorCategoryId] = useState<number | null>(null);
  const [selectedMinorCategoryId, setSelectedMinorCategoryId] = useState<number | null>(null);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('전체');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');

  // 숫자에 콤마 추가하는 함수
  const formatNumber = (value: string): string => {
    if (!value) return '';
    const number = value.replace(/,/g, '');
    if (isNaN(Number(number))) return value;
    return Number(number).toLocaleString();
  };

  // 콤마 제거하는 함수 (API 호출시 사용)
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // 페이지 진입 시 가격 필터 초기화
  React.useEffect(() => {
    // 가격 필터 상태 초기화
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // URL에서 카테고리 정보를 파싱하여 브레드크럼 구성
  const parseCategoryFromUrl = React.useCallback(() => {
    if (!searchParams.category) {
      return {
        majorCategory: null,
        minorCategory: null,
        breadcrumb: '전체',
        categoryType: 'none'
      };
    }

    const categoryId = parseInt(searchParams.category);
    
    // 대분류인지 확인
    const majorCategory = categories.find(cat => cat.categoryId === categoryId);
    if (majorCategory) {
      return {
        majorCategory: majorCategory,
        minorCategory: null,
        breadcrumb: `전체 > ${majorCategory.categoryName}`,
        categoryType: 'major'
      };
    }
    
    // 소분류인지 확인 (해당 대분류도 함께 찾기)
    for (const majorCat of categories) {
      const minorCategory = majorCat.subCategories.find(sub => sub.categoryId === categoryId);
      if (minorCategory) {
        return {
          majorCategory: majorCat,
          minorCategory: minorCategory,
          breadcrumb: `전체 > ${majorCat.categoryName} > ${minorCategory.categoryName}`,
          categoryType: 'minor'
        };
      }
    }
    
    // 카테고리를 찾지 못한 경우
    return {
      majorCategory: null,
      minorCategory: null,
      breadcrumb: '전체',
      categoryType: 'none'
    };
  }, [searchParams.category, categories]);

  // URL 파라미터 변경 시 브레드크럼 및 상태 업데이트
  React.useEffect(() => {
    // 가격 필터 초기화
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    
    const categoryInfo = parseCategoryFromUrl();
    
    // 브레드크럼 및 선택된 카테고리 상태 업데이트
    setSelectedCategoryPath(categoryInfo.breadcrumb);
    setSelectedMajorCategoryId(categoryInfo.majorCategory?.categoryId || null);
    setSelectedMinorCategoryId(categoryInfo.minorCategory?.categoryId || null);
    
    // 탭 상태 설정
    if (categoryInfo.categoryType === 'major') {
      // 대분류 선택 시: 소분류 탭 열기
      setShowMajorCategories(false);
      setShowMinorCategories(true);
    } else if (categoryInfo.categoryType === 'minor') {
      // 소분류 선택 시: 모든 탭 닫기
      setShowMajorCategories(false);
      setShowMinorCategories(false);
    } else {
      // 카테고리 없음: 현재 탭 상태 유지 (전체 클릭 시 대분류 탭이 열려있을 수 있음)
      setShowMinorCategories(false);
    }
    
    // API 호출 - 모든 쿼리 파라미터를 조합하여 전달
    const searchQuery: any = {};
    
    if (searchParams.title) {
      searchQuery.title = searchParams.title;
    }
    
    if (searchParams.category) {
      searchQuery.category_id = parseInt(searchParams.category);
    }
    
    // 쿼리 파라미터가 있으면 API 호출
    if (Object.keys(searchQuery).length > 0) {
      getProducts(searchQuery);
    }
  }, [searchParams.category, searchParams.title, parseCategoryFromUrl, getProducts]);

  // URL 생성 헬퍼 함수
  const createSearchUrl = (categoryId?: number) => {
    const params = new URLSearchParams();
    if (searchParams.title) params.set('title', searchParams.title);
    if (categoryId) params.set('category', categoryId.toString());
    return `/search${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // + 버튼 클릭 시 카테고리 토글
  const handleShowMajorCategories = () => {
    if (showMajorCategories) {
      // 대분류가 열려있으면 닫기
      setShowMajorCategories(false);
    } else if (showMinorCategories) {
      // 소분류가 열려있으면 닫기
      setShowMinorCategories(false);
    } else if (selectedMajorCategoryId && !showMinorCategories) {
      // 대분류가 선택되어 있고 소분류가 닫혀있으면 소분류 열기
      setShowMinorCategories(true);
    } else {
      // 아무것도 열려있지 않으면 대분류 열기
      setShowMajorCategories(true);
    }
  };

  // 가격 적용
  const handlePriceApply = () => {
    const min = minPrice ? parseInt(removeCommas(minPrice)) : 0;
    const max = maxPrice ? parseInt(removeCommas(maxPrice)) : undefined;
    
    // 적용된 가격 상태 업데이트
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    
    // 기존 검색 조건과 가격 조건을 조합
    const searchQuery: any = {};
    
    if (searchParams.title) {
      searchQuery.title = searchParams.title;
    }
    
    if (searchParams.category) {
      searchQuery.category_id = parseInt(searchParams.category);
    }
    
    if (minPrice || maxPrice) {
      if (minPrice) searchQuery.minPrice = min;
      if (maxPrice) searchQuery.maxPrice = max;
    }
    
    getProducts(searchQuery);
  };

  return(
    <div className="py-12">
      <div className='flex items-center gap-2 mb-4'>
        <h1 className='text-2xl font-bold text-black'>
          {searchParams.title ? `'${searchParams.title}'` : ''}검색결과
        </h1>
        <span className='text-sm text-[#5a5a5a]'>총 {products.length}개</span>
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
                      <li>
                        <Link 
                          href={createSearchUrl()}
                          className="cursor-pointer hover:text-[#155dfc]"
                        >
                          전체
                        </Link>
                      </li>
                      <li className="text-sm leading-5 text-[#9ca3af]">&gt;</li>
                      <li>
                        {(() => {
                          const majorCat = categories.find(cat => cat.categoryId === selectedMajorCategoryId);
                          return (
                            <Link 
                              href={majorCat ? createSearchUrl(majorCat.categoryId) : createSearchUrl()}
                              className="cursor-pointer hover:text-[#155dfc]"
                            >
                              {majorCat?.categoryName || ''}
                            </Link>
                          );
                        })()}
                      </li>
                      {selectedMinorCategoryId && (
                        <>
                          <li className="text-sm leading-5 text-[#9ca3af]">&gt;</li>
                          <li>
                            {(() => {
                              const minorCat = categories
                                .flatMap(cat => cat.subCategories)
                                .find(sub => sub.categoryId === selectedMinorCategoryId);
                              return (
                                <Link 
                                  href={searchParams.category ? createSearchUrl(parseInt(searchParams.category)) : createSearchUrl()}
                                  className="cursor-pointer hover:text-[#155dfc]"
                                >
                                  {minorCat?.categoryName || ''}
                                </Link>
                              );
                            })()}
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
                  {categories.map((category) => (
                    <li key={category.categoryId}>
                      <Link 
                        href={createSearchUrl(category.categoryId)}
                        className="text-sm text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer block"
                      >
                        {category.categoryName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            )}

            {/* 소분류 선택 행 */}
            {showMinorCategories && selectedMajorCategoryId && (
            <tr className="category border-b border-[#dadee5]">
              <td className="w-36 bg-gray-50 p-4">소분류 선택</td>
              <td className="p-4">
                <ul className="grid grid-cols-8 gap-2">
                  {categories.find(cat => cat.categoryId === selectedMajorCategoryId)?.subCategories.map((subCategory) => (
                    <li key={subCategory.categoryId}>
                      <Link 
                        href={createSearchUrl(subCategory.categoryId)}
                        className="text-sm text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer block"
                      >
                        {subCategory.categoryName}
                      </Link>
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
            <td className="p-4 flex gap-2 items-center">
              <div className="flex items-center gap-2">
                {/* 최소 가격 입력 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="최소 가격"
                    value={minPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (value === '' || !isNaN(Number(value))) {
                        setMinPrice(formatNumber(value));
                      }
                    }}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-36 px-3 py-2 border border-gray-200 rounded-sm text-sm text-black focus:outline-none focus:border-[#000000] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {/* 구분선 */}
                <span className="text-sm text-black">~</span>
                {/* 최대 가격 입력 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="최대 가격"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (value === '' || !isNaN(Number(value))) {
                        setMaxPrice(formatNumber(value));
                      }
                    }}
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
              <div>
                {(appliedMinPrice || appliedMaxPrice) && (
                  <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>
                      {appliedMinPrice || '0'} ~ {appliedMaxPrice || ''}
                    </span>
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setAppliedMinPrice('');
                        setAppliedMaxPrice('');
                        
                        // 기존 검색 조건은 유지하고 가격 필터만 초기화
                        const searchQuery: any = {};
                        
                        if (searchParams.title) {
                          searchQuery.title = searchParams.title;
                        }
                        
                        if (searchParams.category) {
                          searchQuery.category_id = parseInt(searchParams.category);
                        }
                        
                        // 쿼리 파라미터가 있으면 API 호출, 없으면 전체 상품 조회
                        getProducts(Object.keys(searchQuery).length > 0 ? searchQuery : undefined);
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className='mt-10'>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      ) : products.length > 0 ? (
        <ul className="grid grid-cols-6 gap-6 gap-y-12">
          {products.map((item) => (
            <li key={item.product.id}>
              <ProductCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-500">검색 결과가 없습니다.</div>
        </div>
      )}
    </div>
  </div>
  )
}