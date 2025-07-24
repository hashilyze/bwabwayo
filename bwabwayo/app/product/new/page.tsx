// 파일 경로: app/product/new/page.tsx
// 이 파일은 피그마 디자인을 기반으로 사용자가 새로운 판매글을 작성하는 페이지입니다.
// Next.js App Router를 사용하여 /product/new 경로에서 이 페이지를 볼 수 있습니다.

// SVG 아이콘을 위한 간단한 타입 정의
// Heroicons (https://heroicons.com/) 같은 라이브러리에서 아이콘을 가져와 사용할 수 있습니다.
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// CreateProductPage 컴포넌트: 판매글 작성 페이지의 전체 UI를 구성합니다.
export default function CreateProductPage() {
  // return (...) 안의 코드가 실제 화면에 그려질 내용을 정의하는 JSX(TSX) 부분입니다.
  return (
    // 전체 페이지를 감싸는 컨테이너입니다.
    // bg-white: 배경색을 흰색으로 설정합니다.
    // min-h-screen: 화면 전체 높이를 최소 높이로 가집니다.
    <div className="bg-white min-h-screen">
      {/* 메인 콘텐츠 영역입니다. */}
      {/* max-w-2xl: 최대 너비를 제한하여 내용이 너무 넓어지는 것을 방지합니다. */}
      {/* mx-auto: 좌우 마진을 자동으로 설정하여 중앙에 정렬합니다. */}
      {/* p-4 sm:p-6 lg:p-8: 화면 크기에 따라 패딩(내부 여백)을 조절합니다. */}
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* space-y-10: 자식 요소들 사이에 40px의 수직 간격을 줍니다. */}
        <div className="space-y-10">
          {/* 1. 이미지 업로드 섹션 */}
          <section>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-500 mt-1">0/10</span>
              </div>
              <p className="text-sm text-gray-500">
                상품 이미지를 등록해주세요.<br/>
                첫 번째 사진이 대표 이미지로 사용됩니다.
              </p>
            </div>
          </section>

          {/* 2. 상품명 입력 섹션 */}
          <section>
            <label htmlFor="productName" className="block text-base font-semibold text-gray-800 mb-2">
              상품명
            </label>
            <input
              type="text"
              id="productName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
              placeholder="상품명을 입력해주세요."
            />
          </section>

          {/* 3. 카테고리 선택 및 AI 템플릿 생성 섹션 */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow grid grid-cols-2 border border-gray-200 rounded-lg">
              {/* 대분류 */}
              <div className="bg-gray-50 border-r border-gray-200">
                <ul className="py-2">
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200">여성의류</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200">남성의류</li>
                  <li className="px-4 py-2 text-sm font-bold bg-white text-blue-600 cursor-pointer">신발</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200">가방/지갑</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200">시계</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-200">쥬얼리</li>
                </ul>
              </div>
              {/* 소분류 */}
              <div>
                <ul className="py-2">
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-50">스니커즈</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-50">남성화</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-50">여성화</li>
                  <li className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-blue-50">스포츠화</li>
                </ul>
              </div>
            </div>
            <div className="flex-shrink-0 md:w-48">
              <button type="button" className="w-full h-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-center">
                AI 템플릿 생성
              </button>
            </div>
          </section>

          {/* 4. 판매 가격 및 네고 여부 섹션 */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price" className="block text-base font-semibold text-gray-800">
                판매가격
              </label>
              <div className="flex items-center">
                <input id="negotiable" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">
                  네고가능여부
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                id="price"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8"
                placeholder="판매가격을 입력해주세요."
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span>
            </div>
          </section>

          {/* 5. 게시물 내용 작성 섹션 */}
          <section>
             <textarea
                id="description"
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                placeholder="- 상품명(브랜드)&#10;- 구매 시기 (년, 월, 일)&#10;- 착용 기간&#10;- 오염 여부&#10;- 하자 여부&#10;* 실제 촬영한 사진과 함께 상세 정보를 입력해주세요.&#10;* 카카오톡 아이디 첨부 시 게시물 삭제 및 이용제재 처리될 수 있어요.&#10;* 안전하고 건전한 거래환경을 위해 과학기술정보통신부, 한국인터넷진흥원, 중고나라가 함께합니다."
              />
          </section>

          {/* 6. 거래 방법 섹션 */}
          <section>
            <h3 className="text-base font-semibold text-gray-800 mb-3">거래방법</h3>
            <div className="flex items-center space-x-6">
              {['택배거래', '직거래', '화상거래'].map((method) => (
                <div key={method} className="flex items-center">
                  <input id={method} name="tradeMethod" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor={method} className="ml-2 block text-sm text-gray-700">
                    {method}
                  </label>
                </div>
              ))}
            </div>
          </section>
          
          {/* 7. 배송비 설정 섹션 */}
          <section>
            <label htmlFor="shippingCost" className="block text-base font-semibold text-gray-800 mb-2">
              배송비 설정
            </label>
            <div className="relative">
              <input
                type="number"
                id="shippingCost"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8"
                placeholder="배송비를 입력해주세요."
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span>
            </div>
          </section>
          
          {/* 8. 약관 동의 및 등록 버튼 섹션 */}
          <section className="border-t border-gray-200 pt-8 space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="terms" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-1" />
                  판매 정보가 실제 상품과 다를 경우, 책임은 판매자에게 있음을 동의합니다.
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg"
            >
              판매글 등록
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
