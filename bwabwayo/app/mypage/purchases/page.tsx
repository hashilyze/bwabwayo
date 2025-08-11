// 파일 경로: app/shop/[id]/purchases/page.tsx
'use client'; // '구매확정' 버튼 등 상호작용이 있으므로 클라이언트 컴포넌트로 선언합니다.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMyActivityStore, myPurchaseProduct } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트를 import 합니다.

// 더미 데이터
const dummyPurchaseData: myPurchaseProduct[] = [
  {
    id: 1,
    title: "아이폰 15 Pro Max 256GB 티타늄 아주좋은 티타늄 부서지지 않아요 대나무행주 대나무행주 흡수력이 좋아요 대나무행주 대나무행주 튼튼하니 좋아요",
    thumbnail: "/image/no-image.jpg",
    price: 2100000000,
    deliveryStatus: "배송중",
    courierName: "CJ대한통운",
    trackingNumber: "1234567890",
    purchaseStatus: 1, // 구매확정 가능한 상태
  },
  {
    id: 2,
    title: "삼성 갤럭시 S24 Ultra 512GB",
    thumbnail: "/image/no-image.jpg",
    price: 1800000,
    deliveryStatus: "배송완료",
    courierName: "한진택배",
    trackingNumber: "9876543210",
    purchaseStatus: 2, // 구매확정완료 상태
  },
  {
    id: 3,
    title: "애플 에어팟 프로 2세대",
    thumbnail: "/image/no-image.jpg",
    price: 350000,
    deliveryStatus: "직거래",
    courierName: "",
    trackingNumber: "",
    purchaseStatus: 1, // 구매확정 불가능한 상태
  }
];

export default function MyPagePurchase() {
  const {
    purchaseList,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchPurchases,
  } = useMyActivityStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 5개의 구매 내역을 표시합니다.

  useEffect(() => {
    // 전체 구매 목록을 가져옵니다.
    // 참고: 현재 fetchPurchases가 페이지별로 데이터를 가져온다면,
    // 모든 데이터를 한 번에 가져오는 새로운 함수가 스토어에 필요할 수 있습니다.
    // 여기서는 fetchPurchases(0)가 모든 데이터를 가져온다고 가정하고 진행합니다.
    fetchPurchases(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  // 페이지네이션을 위한 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 더미 데이터와 실제 데이터를 합쳐서 사용
  const allItems = [...dummyPurchaseData, ...(purchaseList || [])];
  const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">구매 상품</h1>
      
      {/* 테이블 헤더 */}
      <div className="bg-gray-100 rounded-lg px-6 py-3 mb-4">
        <div className="flex gap-6 text-gray-500 text-base font-semibold">
          <div className="w-[118px]"></div>
          <div className="flex-1 text-center">제품명</div>
          <div className="w-40 text-center">가격</div>
          <div className="w-28 text-center">배송상태</div>
          <div className="w-32 text-center">구매상태</div>
        </div>
      </div>
      
      {/* 상품 리스트 */}
      <div className="space-y-4">
        {currentItems.length === 0 && !purchaseListLoading && (
          <div className="text-center text-gray-500 py-20">
            구매 내역이 없습니다.
          </div>
        )}
        {purchaseListError && <div className="text-center text-red-500 py-20">에러: {purchaseListError}</div>}

        {currentItems.map((item: myPurchaseProduct) => (
          <div key={item.id} className="bg-white rounded-[30px] border border-[#d9d9d9] p-6">
            <div className="flex items-center gap-6">
              {/* 상품 이미지 */}
              <div className="w-[118px] h-[118px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.thumbnail} alt={item.title} className="object-cover w-full h-full" />
              </div>

              {/* 제품명 */}
              <div className="flex flex-col gap-2 flex-1">
                {/* 날짜 */}
                <div className="text-[#7c7c7c] text-sm font-normal">
                  등록일자 : 2025.08.06 14:00
                </div>
                
                {/* 상품명 */}
                <Link href={`/product/${item.id}`} className="group">
                  <div className="text-black text-xl font-semibold leading-[25px]">
                    {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                  </div>
                </Link>
              </div>

              {/* 가격 */}
              <div className="text-black text-lg font-medium leading-[22px] w-40 text-center">
                {item.price.toLocaleString('ko-KR')}원
              </div>

              {/* 배송 상태 */}
              <div className="text-black text-base font-normal leading-[20px] w-28 text-center">
                {item.deliveryStatus === '직거래' ? '직거래' : item.deliveryStatus}
              </div>

              {/* 구매상태 (구매확정 버튼) */}
              <div className="w-32 text-center">
                {item.purchaseStatus === 1 && (
                  <button
                    className="px-6 py-2 rounded-[20px] border border-black bg-[#ffae00] text-white text-base font-extrabold"
                  >
                    구매중
                  </button>
                )}

                {item.purchaseStatus === 2 && (
                  <button
                    className="px-6 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium"
                    disabled
                  >
                    구매완료
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
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
