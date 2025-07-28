'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "../stores/categoryStore";

export default function Category(){
    const router = useRouter();
    const { categories, loading, error } = useCategoryStore();
    const [majorCategory, setMajorCategory] = useState<string>('');
    const [minorCategories, setMinorCategories] = useState<{id: number, name: string}[]>([]);
    const [selectedMinor, setSelectedMinor] = useState<{id: number, name: string} | null>(null);
    const [isHovered, setIsHovered] = useState<string>('');

    // 대분류 클릭 시
    const magorCate = (catName: string) => {
        setMajorCategory(catName);
        const found = categories.find(cat => cat.name === catName);
        setMinorCategories(found ? found.sub : []);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center w-[230px] h-80 border border-gray-200 bg-white">
                <div className="text-sm text-gray-500">카테고리 로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-[230px] h-80 border border-gray-200 bg-white">
                <div className="text-sm text-red-500">{error}</div>
            </div>
        );
    }

    return(
        <div className={`flex items-start border border-gray-200 ${isHovered ? 'w-[460px]' : 'w-[230px]'}`}>
            <div className="h-80 overflow-y-auto flex-1 py-3 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <ul>
                {categories.map(cat => (
                  <li 
                    key={cat.name} 
                    onClick={() => handleCategoryClick(cat.id)} 
                    onMouseEnter={() => {
                      setIsHovered(cat.name);
                      magorCate(cat.name);
                    }}
                    onMouseLeave={() => setIsHovered('')}
                    className={`px-6 py-3 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-600 ${
                      isHovered === cat.name ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
            <div 
              className={`minor-cate py-3 flex-1 h-80 overflow-y-auto border-l-1 border-gray-200 bg-white ${isHovered ? 'block' : 'hidden'}`}
              onMouseEnter={() => setIsHovered(isHovered)}
              onMouseLeave={() => setIsHovered('')}
            >
              <ul>
                {minorCategories.length ? (
                  minorCategories.map(subCat => (
                    <li
                      key={subCat.id}
                      onClick={() => handleCategoryClick(subCat.id)}
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-100`}
                    >
                      {subCat.name}
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