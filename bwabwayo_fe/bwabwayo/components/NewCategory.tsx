'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore, Category, SubCategory } from '@/stores/categoryStore';

interface NewCategoryProps {
  showCategory: boolean;
}

export default function NewCategory({ showCategory }: NewCategoryProps) {
  const router = useRouter();
  const { categories, getCategories, loading } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    getCategories();
  }, []);

  // showCategory가 false가 되면 선택된 카테고리 초기화
  useEffect(() => {
    if (!showCategory) {
      setSelectedCategory(null);
    }
  }, [showCategory]);

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    router.push(`/search?category=${subCategory.categoryId}`);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 하위 카테고리가 없으면 즉시 라우팅
    if (!category.subCategories || category.subCategories.length === 0) {
      router.push(`/search?category=${category.categoryId}`);
      return; // 라우팅 후 함수 종료
    }
    
    setSelectedCategory(category);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubCategoryClickWithPrevention = (e: React.MouseEvent, subCategory: SubCategory) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubCategoryClick(subCategory);
  };

  if (loading) {
    return (
      <div className="w-full bg-white flex items-center justify-center py-16" onClick={handleContainerClick}>
        <div className="text-xl">카테고리를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white" onClick={handleContainerClick}>
      <div className="w-full bg-white pt-6 pb-10 border-t border-black" onClick={handleContainerClick}>
        <div className="flex" onClick={handleContainerClick}>
          {/* 첫 번째 컬럼 - 대분류 */}
          <div className="flex-1" onClick={handleContainerClick}>
            <div className="grid grid-cols-3 gap-x-6 gap-y-7" onClick={handleContainerClick}>
              {categories.map((category) => (
                <div 
                  key={category.categoryId}
                  className={`text-lg font-semibold cursor-pointer transition-colors ${
                    selectedCategory?.categoryId === category.categoryId 
                      ? 'text-[#ffae00]' 
                      : 'text-black hover:text-[#ffae00]'
                  }`}
                  onClick={(e) => handleCategoryClick(e, category)}
                >
                  {category.categoryName}
                </div>
              ))}
            </div>
          </div>

          {/* 두 번째 컬럼 - 선택된 대분류의 소분류들 */}
          <div className="flex-1 flex justify-start items-start" onClick={handleContainerClick}>
            {selectedCategory ? (
              <div className="grid grid-cols-3 gap-x-16 gap-y-6" onClick={handleContainerClick}>
                {selectedCategory.subCategories.map((subCategory) => (
                  <div 
                    key={subCategory.categoryId}
                    className="text-lg text-gray-600 cursor-pointer hover:text-[#ffae00] transition-colors"
                    onClick={(e) => handleSubCategoryClickWithPrevention(e, subCategory)}
                  >
                    {subCategory.categoryName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex w-full items-center justify-center h-64" onClick={handleContainerClick}>
                <div className="text-lg text-gray-500">
                  왼쪽에서 카테고리를 선택해주세요
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}