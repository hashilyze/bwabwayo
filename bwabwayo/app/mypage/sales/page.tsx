// 파일 경로: app/shop/[id]/sales/page.tsx
'use client'; // 페이지 내 상호작용을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { Suspense, useState, useEffect } from "react";
import { useMyActivityStore, type SalesSearchConditions } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트를 import 합니다.
import { useRouter, useSearchParams } from "next/navigation"; // URL 관리를 위해 import 합니다.
import Link from 'next/link';


function SalesContent() {
  const { salesList, salesTotalPages, fetchSales, loading: salesLoading, error: salesError } = useMyActivityStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✨ 페이지 상태를 URL 쿼리 파라미터에서 가져옵니다. 없으면 1로 기본값 설정.
  const currentPage = Number(searchParams.get('page')) || 1;

  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SalesSearchConditions['sortBy']>('latest');

  // 페이지, 키워드, 정렬 기준이 변경될 때마다 데이터를 새로 불러옵니다.
  useEffect(() => {
    fetchSales({
      page: currentPage,
      size: 5, // 한 페이지에 표시할 아이템 수
      keyword: keyword || undefined, // 빈 문자열일 경우 undefined로 전달하여 쿼리에서 제외
      sortBy: sortBy,
    });
  }, [currentPage, keyword, sortBy, fetchSales]); // currentPage가 URL에서 오므로 의존성 배열에 포함

  const handlePageChange = (pageNumber: number) => {
    // ✨ 페이지 변경 시 URL을 업데이트하여 상태를 유지합니다.
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNumber));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">판매 상품</h1>

      {/* 테이블 헤더 */}
      <div className="bg-gray-100 rounded-lg px-6 py-3 mb-4">
        <div className="flex gap-6 text-gray-500 text-base font-semibold">
          <div className="w-[118px]"></div>
          <div className="flex-1 text-center">제품명</div>
          <div className="w-40 text-center">가격</div>
          <div className="w-28 text-center">배송상태</div>
          <div className="w-32 text-center">판매상태</div>
        </div>
      </div>

      {/* 상품 리스트 */}
      <div className="space-y-4">
        {salesList.length === 0 && !salesLoading && (
          <div className="text-center text-gray-500 py-20">
            판매 내역이 없습니다.
          </div>
        )}
        {salesError && <div className="text-center text-red-500 py-20">에러: {salesError}</div>}

        {salesList.map((item) => (
          <div key={item.product.id} className="bg-white rounded-[30px] border border-[#d9d9d9] p-6">
            <div className="flex items-center gap-6">
              {/* 상품 이미지 */}
              <div className="relative w-[118px] h-[118px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.product.thumbnail} alt={item.product.title} className="object-cover w-full h-full" />
                {item.product.saleStatus === '판매완료' && (
                  <div className="absolute inset-0">
                    {/* 반투명 오버레이 */}
                    <div className="absolute inset-0 bg-black/35" />
                    
                    {/* 텍스트 오버레이 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-black/35">
                        <span className="text-white text-lg font-bold">판매완료</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 제품명 */}
              <div className="flex flex-col gap-2 flex-1">
                {/* 날짜 */}
                <div className="text-[#7c7c7c] text-sm font-normal">
                  등록일자 : {new Date(item.product.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* 상품명 */}
                <Link href={`/product/${item.product.id}`} className="group">
                  <div className="text-black text-xl font-semibold leading-[25px]">
                    {item.product.title.length > 50 ? `${item.product.title.substring(0, 50)}...` : item.product.title}
                  </div>
                </Link>
              </div>

              {/* 가격 */}
              <div className="text-black text-lg font-medium leading-[22px] w-40 text-center">
                {item.product.price.toLocaleString('ko-KR')}원
              </div>

              {/* 배송 상태 */}
              <div className="text-black text-base font-normal leading-[20px] w-28 text-center">
                {item.product.saleStatus === '판매중' && '배송 대기'}
                {item.product.saleStatus === '거래중' && '송장번호를 입력해주세요.'}
                {item.product.saleStatus === '판매완료' && '배송완료'}
              </div>

              {/* 판매상태 */}
              <div className="w-32 text-center">
                {item.product.saleStatus === '판매중' && (
                  <button className="px-6 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium" disabled>
                    판매중
                  </button>
                )}
                {item.product.saleStatus === '거래중' && (
                  <button className="px-6 py-2 rounded-[20px] border border-black bg-[#ffae00] text-white text-base font-extrabold">
                    거래중
                  </button>
                )}
                {item.product.saleStatus === '판매완료' && (
                  <button className="px-6 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium" disabled>
                    판매완료
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={salesTotalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function MyPageSales() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">판매 목록을 불러오는 중...</div>}>
      <SalesContent />
    </Suspense>
  );
}
