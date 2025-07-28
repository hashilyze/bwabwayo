'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function Category(){
    const router = useRouter();
    const [majorCategory, setMajorCategory] = useState<string>('');
    const [minorCategories, setMinorCategories] = useState<{id: number, name: string}[]>([]);
    const [selectedMinor, setSelectedMinor] = useState<{id: number, name: string} | null>(null);
    const [isHovered, setIsHovered] = useState<string>('');

    // 대분류 클릭 시
    const magorCate = (catName: string) => {
        setMajorCategory(catName);
        const found = CATEGORIES.find(cat => cat.name === catName);
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

    return(
        <div className={`flex items-start border border-gray-200 ${isHovered ? 'w-[460px]' : 'w-[230px]'}`}>
            <div className="h-80 overflow-y-auto flex-1 py-3 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <ul>
                {CATEGORIES.map(cat => (
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