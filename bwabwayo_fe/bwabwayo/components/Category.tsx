'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/stores/categoryStore";

export default function Category(){
    const router = useRouter();
    const { categories, loading, error, getCategories } = useCategoryStore();
    const [majorCategory, setMajorCategory] = useState<string>('');
    const [minorCategories, setMinorCategories] = useState<{categoryId: number, categoryName: string}[]>([]);
    const [selectedMinor, setSelectedMinor] = useState<{categoryId: number, categoryName: string} | null>(null);
    const [isHovered, setIsHovered] = useState<string>('');
    
    useEffect(() => {
        getCategories();
    }, [getCategories]);
    
    // 대분류 클릭 시
    const magorCate = (catName: string) => {
        setMajorCategory(catName);
        if (categories && categories.length > 0) {
            const found = categories.find(cat => cat.categoryName === catName);
            const subCategories = found ? found.subCategories || [] : [];
            setMinorCategories(subCategories);
            
            // 하위 카테고리가 없으면 즉시 라우팅
            if (subCategories.length === 0) {
                if (found) {
                    handleCategoryClick(found.categoryId);
                }
            }
        } else {
            setMinorCategories([]);
        }
        setSelectedMinor(null);
    };

    // 카테고리 클릭 시 검색 페이지로 이동
    const handleCategoryClick = (id: number) => {
        const currentUrl = new URL(window.location.href);
        const searchParams = new URLSearchParams(currentUrl.search);
        
        // 기존 쿼리 파라미터 유지
        const title = searchParams.get('title');
        
        // 새로운 URL 생성
        const newUrl = new URL('/search', window.location.origin);
        if (title) newUrl.searchParams.set('title', title);
        newUrl.searchParams.set('category', id.toString());
        
        router.push(newUrl.pathname + newUrl.search);
    };

    return(
        <div className={`flex items-start border border-gray-200 ${isHovered ? 'w-[460px]' : 'w-[230px]'}`}>
            <div className="h-80 overflow-y-auto flex-1 py-3 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <ul>
                {categories && categories.length > 0 ? categories.map(cat => (
                  <li 
                    key={cat.categoryName} 
                    onClick={() => handleCategoryClick(cat.categoryId)} 
                    onMouseEnter={() => {
                      setIsHovered(cat.categoryName);
                      magorCate(cat.categoryName);
                    }}
                    onMouseLeave={() => setIsHovered('')}
                    className={`px-6 py-3 text-md cursor-pointer hover:bg-[#fff9ea] hover:text-[#ffae00] ${
                      isHovered === cat.categoryName ? 'bg-[#fff9ea] text-[#ffae00] font-semibold' : ''
                    }`}
                  >
                    {cat.categoryName}
                  </li>
                )) : (
                  <li className="px-6 py-3 text-md text-gray-400">
                    {loading ? '카테고리를 불러오는 중...' : '카테고리가 없습니다.'}
                  </li>
                )}
              </ul>
            </div>
            <div 
              className={`minor-cate py-3 flex-1 h-80 overflow-y-auto border-l-1 border-gray-200 bg-white ${isHovered ? 'block' : 'hidden'}`}
              onMouseEnter={() => setIsHovered(isHovered)}
              onMouseLeave={() => setIsHovered('')}
            >
              <ul>
                {minorCategories && minorCategories.length > 0 ? (
                  minorCategories.map(subCat => (
                    <li
                      key={subCat.categoryId}
                      onClick={() => handleCategoryClick(subCat.categoryId)}
                      className={`px-4 py-3 text-md cursor-pointer hover:bg-[#fff9ea] hover:text-[#ffae00] hover:font-semibold`}
                    >
                      {subCat.categoryName}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-gray-400">소분류가 없습니다.</li>
                )}
              </ul>
            </div>
        </div>
    )
}