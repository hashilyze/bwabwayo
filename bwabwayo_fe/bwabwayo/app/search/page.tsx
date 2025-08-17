'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProductStore, ProductWithSeller } from '@/stores/product/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/common/Pagination';
import { transformToProductCardData } from '@/lib/dataTransFormers';

// ✨ useSearchParams를 사용하는 모든 로직을 이 컴포넌트로 분리합니다.
function SearchResultComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { products, totalElements, totalPages, loading, error, getProducts } = useProductStore();
    const { categories, getCategories } = useCategoryStore();

    // UI 상태
    const [showMajorCategories, setShowMajorCategories] = useState(false);
    const [showMinorCategories, setShowMinorCategories] = useState(false);
    const [selectedMajorCategoryId, setSelectedMajorCategoryId] = useState<number | null>(null);
    
    // 가격 필터 입력 상태
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    // 판매중인 상품만 보기 상태
    const [onlySale, setOnlySale] = useState(false);

    // URL에서 현재 검색 조건들을 가져옵니다.
    const titleQuery = searchParams.get('title') || '';
    const categoryQuery = searchParams.get('category');
    const minPriceQuery = searchParams.get('minPrice');
    const maxPriceQuery = searchParams.get('maxPrice');
    const onlySaleQuery = searchParams.get('onlySale');
    const currentPage = Number(searchParams.get('page')) || 1;

    // --- 데이터 포맷팅 함수 ---
    const PRODUCTS_PER_API_PAGE = 1000; // 백엔드에서 한 번에 받아올 개수
    const PRODUCTS_PER_PAGE = 20; // 프론트에서 보여줄 개수
    const formatNumber = (value: string): string => {
        if (!value) return '';
        return Number(value.replace(/,/g, '')).toLocaleString();
    };
    const removeCommas = (value: string): string => {
        return value.replace(/,/g, '');
    };

    // 모든 데이터 로딩을 이 useEffect에서 통합 관리합니다.
    useEffect(() => {
        getCategories();
        // 프론트 페이지네이션: 1~5페이지는 1번 API, 6~10페이지는 2번 API ...
        const apiPage = Math.floor((currentPage - 1) / (PRODUCTS_PER_API_PAGE / PRODUCTS_PER_PAGE)) + 1;
        const searchQuery: {
            page: number;
            size: number;
            keyword?: string;
            categoryId?: number;
            minPrice?: number;
            maxPrice?: number;
            onlySale?: boolean;
        } = {
            page: apiPage,
            size: PRODUCTS_PER_API_PAGE,
        };
        if (titleQuery) searchQuery.keyword = titleQuery;
        if (categoryQuery) searchQuery.categoryId = parseInt(categoryQuery);
        if (minPriceQuery) searchQuery.minPrice = parseInt(minPriceQuery);
        if (maxPriceQuery) searchQuery.maxPrice = parseInt(maxPriceQuery);
        if (onlySaleQuery) searchQuery.onlySale = onlySaleQuery === 'true';
        getProducts(searchQuery);
    }, [searchParams, getProducts, getCategories]);

    // --- URL 파라미터 변경 시 UI 상태 업데이트 ---
    useEffect(() => {
        const categoryId = categoryQuery ? parseInt(categoryQuery) : null;
        let majorCat = null;
        let isMinorSelected = false;

        if (categoryId) {
            for (const cat of categories) {
                if (cat.categoryId === categoryId) {
                    majorCat = cat;
                    break;
                }
                const foundMinor = cat.subCategories.find(sub => sub.categoryId === categoryId);
                if (foundMinor) {
                    majorCat = cat;
                    isMinorSelected = true;
                    break;
                }
            }
        }
        
        setSelectedMajorCategoryId(majorCat?.categoryId || null);
        
        if (majorCat && !isMinorSelected) {
            setShowMajorCategories(false);
            setShowMinorCategories(true);
        } else {
            setShowMinorCategories(false);
        }
        
        setMinPrice(minPriceQuery ? formatNumber(minPriceQuery) : '');
        setMaxPrice(maxPriceQuery ? formatNumber(maxPriceQuery) : '');
        
        // 판매중인 상품만 보기 상태 설정
        setOnlySale(onlySaleQuery === 'true');

    }, [categoryQuery, minPriceQuery, maxPriceQuery, onlySaleQuery, categories]);


    // URL 생성 헬퍼 함수
    const createUrlWithParams = (newParams: { [key: string]: string | number | null }) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        if ('category' in newParams || 'minPrice' in newParams || 'maxPrice' in newParams) {
            params.delete('page');
        }
        return `/search?${params.toString()}`;
    };

    // 가격 적용 핸들러
    const handlePriceApply = () => {
        router.push(createUrlWithParams({
            minPrice: removeCommas(minPrice) || null,
            maxPrice: removeCommas(maxPrice) || null,
        }));
    };
    
    // 가격 초기화 핸들러
    const handlePriceReset = () => {
        router.push(createUrlWithParams({
            minPrice: null,
            maxPrice: null,
        }));
    };
    
    // 판매중인 상품만 보기 핸들러
    const handleOnlySaleChange = (checked: boolean) => {
        setOnlySale(checked);
        router.push(createUrlWithParams({
            onlySale: checked ? 'true' : null,
        }));
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber: number) => {
        router.push(createUrlWithParams({ page: pageNumber }));
    };

    const handleCategoryToggle = () => {
        if (showMajorCategories) {
            setShowMajorCategories(false);
        } else if (showMinorCategories) {
            setShowMinorCategories(false);
        } else {
            setShowMajorCategories(true);
        }
    };
    
    const breadcrumb = useCallback(() => {
        if (!categoryQuery) return [{ name: '전체', href: createUrlWithParams({ category: null }) }];
        const categoryId = parseInt(categoryQuery);
        for (const cat of categories) {
            if (cat.categoryId === categoryId) {
                return [
                    { name: '전체', href: createUrlWithParams({ category: null }) },
                    { name: cat.categoryName, href: createUrlWithParams({ category: cat.categoryId }) }
                ];
            }
            const foundMinor = cat.subCategories.find(sub => sub.categoryId === categoryId);
            if (foundMinor) {
                return [
                    { name: '전체', href: createUrlWithParams({ category: null }) },
                    { name: cat.categoryName, href: createUrlWithParams({ category: cat.categoryId }) },
                    { name: foundMinor.categoryName, href: createUrlWithParams({ category: foundMinor.categoryId }) }
                ];
            }
        }
        return [{ name: '전체', href: createUrlWithParams({ category: null }) }];
    }, [categoryQuery, categories, searchParams]);

    // 프론트 페이지네이션용 products slice
    const pagedProducts = products.slice(((currentPage - 1) % (PRODUCTS_PER_API_PAGE / PRODUCTS_PER_PAGE)) * PRODUCTS_PER_PAGE, ((currentPage - 1) % (PRODUCTS_PER_API_PAGE / PRODUCTS_PER_PAGE) + 1) * PRODUCTS_PER_PAGE);
    // 프론트 totalPages 계산
    const pageTotal = Math.ceil(totalElements / PRODUCTS_PER_PAGE);

    return (
        <div className="py-12 container-default m-auto">
            <div className='flex items-center gap-2 mb-4'>
                <h1 className='text-3xl font-bold text-black'>
                    {titleQuery ? `'${titleQuery}'` : ''} 검색결과
                </h1>
                <span className='text-md text-[#5a5a5a]'>총 {totalElements}개</span>
            </div>
            <div className="search-category w-full bg-white">
                <table className="w-full">
                    <tbody>
                        {/* 카테고리 헤더 행 */}
                        <tr className="border-t-2 border-t-[#000000] border-b border-b-[#dadee5]">
                            <td className="flex justify-between items-center w-36 bg-gray-50 px-4 py-5 text-left">
                                <div className="text-lg text-black">카테고리</div>
                                <div onClick={handleCategoryToggle} className="cursor-pointer text-lg">
                                    {(showMajorCategories || showMinorCategories) ? '-' : '+'}
                                </div>
                            </td>
                            <td className="px-6 py-5 text-left">
                                <div className="flex items-center text-lg gap-2">
                                    {breadcrumb().map((path, index) => {
                                        const isLast = index === breadcrumb().length - 1;
                                        return (
                                            <React.Fragment key={path.name}>
                                                <Link href={path.href} className={isLast ? 'font-bold' : 'hover:text-[#155dfc]'}>
                                                    {path.name}
                                                </Link>
                                                {!isLast && <span className="text-[#9ca3af]">&gt;</span>}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </td>
                        </tr>
                        {/* 대분류 선택 행 */}
                        {showMajorCategories && (
                            <tr className="category border-b border-[#dadee5]">
                                <td className="w-36 bg-gray-50 p-4 text-lg">대분류 선택</td>
                                <td className="p-4">
                                    <ul className="grid grid-cols-7 gap-2">
                                        {categories.map((category) => (
                                            <li key={category.categoryId}>
                                                <Link href={createUrlWithParams({ category: category.categoryId })} className="text-md text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer block">
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
                                <td className="w-36 bg-gray-50 p-4 text-lg">소분류 선택</td>
                                <td className="p-4">
                                    <ul className="grid grid-cols-7 gap-2">
                                        {categories.find(cat => cat.categoryId === selectedMajorCategoryId)?.subCategories.map((subCategory) => (
                                            <li key={subCategory.categoryId}>
                                                <Link href={createUrlWithParams({ category: subCategory.categoryId })} className="text-md text-[#5a5a5a] px-3 py-2 hover:text-[#155dfc] cursor-pointer block">
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
                                <h3 className="text-lg font-normal text-black">가격</h3>
                            </td>
                            <td className="p-4 flex justify-start gap-6 items-center">
                                <div className="flex items-center gap-2">
                                    <input type="text" placeholder="최소 가격" value={minPrice} onChange={(e) => setMinPrice(formatNumber(e.target.value))} className="w-36 px-3 py-2 border border-gray-200 rounded-sm text-md text-black focus:outline-none focus:border-[#000000]"/>
                                    <span>~</span>
                                    <input type="text" placeholder="최대 가격" value={maxPrice} onChange={(e) => setMaxPrice(formatNumber(e.target.value))} className="w-36 px-3 py-2 border border-gray-200 rounded-sm text-md text-black focus:outline-none focus:border-[#000000]"/>
                                    <button onClick={handlePriceApply}
                                     className="w-15 h-10 bg-black text-white text-md font-normal rounded-sm cursor-pointer px-4"
                                     >적용</button>
                                </div>
                                {(minPriceQuery || maxPriceQuery) && (
                                    <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                                        <span>{formatNumber(minPriceQuery || '0')} ~ {formatNumber(maxPriceQuery || '')}</span>
                                        <button onClick={handlePriceReset} className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer">×</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                        
                        {/* 판매중인 상품만 보기 체크박스 행 */}
                        <tr className="border-b border-[#dadee5]">
                            <td className="w-36 bg-gray-50 p-4">
                                <h3 className="text-lg font-normal text-black">옵션</h3>
                            </td>
                            <td className="p-4">
                                <label htmlFor="onlySale" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="onlySale"
                                            checked={onlySale}
                                            onChange={(e) => handleOnlySaleChange(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${
                                            onlySale ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}></div>
                                        <div
                                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                                                onlySale ? 'translate-x-4' : ''
                                            }`}
                                        ></div>
                                    </div>
                                    <div className="ml-3 text-md text-black">판매중인 상품만 보기</div>
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 제품 리스트 및 페이지네이션 */}
            <div className='mt-12'>
                {loading ? ( <div className="text-center py-8">로딩 중...</div> ) 
                : error ? ( <div className="text-center text-red-500 py-8">에러: {error}</div> ) 
                : pagedProducts.length > 0 ? (
                <>
                <ul className="grid grid-cols-4 gap-8 gap-y-12 items-stretch">
                    {pagedProducts.map((item: ProductWithSeller) => (
                        <li key={item.product.id}>
                            <ProductCard item={transformToProductCardData(item)} />
                        </li>
                    ))}
                </ul>
                <Pagination
                    currentPage={currentPage}
                    totalPages={pageTotal}
                    onPageChange={handlePageChange}
                />
                </>
                ) : (
                    <div className="text-center text-gray-500 py-20">검색 결과가 없습니다.</div>
                )}
            </div>
        </div>
    )
}

// ✨ 메인 페이지 컴포넌트는 Suspense로 감싸는 역할만 합니다.
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">검색 결과를 불러오는 중...</div>}>
            <SearchResultComponent />
        </Suspense>
    );
}
