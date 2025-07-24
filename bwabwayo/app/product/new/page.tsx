// 'useState'와 같은 클라이언트 측 React 기능을 사용하기 위해 파일 상단에 'use client'를 선언합니다.
'use client';

import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';

// SVG 아이콘을 위한 간단한 타입 정의
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// 이미지 삭제 버튼을 위한 X 아이콘
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// CreateProductPage 컴포넌트: 판매글 작성 페이지의 전체 UI를 구성합니다.
export default function CreateProductPage() {
  // --- 상태 관리 (State Management) ---
  // 이미지 파일들의 미리보기 URL을 저장
  const [images, setImages] = useState<string[]>([]);
  // 실제 이미지 파일 객체를 저장 (서버 전송용)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // 상품명
  const [productName, setProductName] = useState('');
  // 가격
  const [price, setPrice] = useState('');
  // 네고 가능 여부
  const [isNegotiable, setIsNegotiable] = useState(false);
  // 상품 설명
  const [description, setDescription] = useState('');
  // 거래 방법
  const [tradeMethods, setTradeMethods] = useState({
    delivery: false,
    direct: false,
    video: false,
  });
  // 배송비
  const [shippingCost, setShippingCost] = useState('');
  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false);
  // 경고 팝업 표시 여부
  const [showAlert, setShowAlert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      images.forEach(file => URL.revokeObjectURL(file));
    };
  }, [images]);

  // --- 이벤트 핸들러 (Event Handlers) ---
  const handleUploadClick = () => {
    if (images.length >= 10) {
        setShowAlert(true);
        return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (images.length + files.length > 10) {
        setShowAlert(true);
      }
      
      const newImageUrls: string[] = [];
      const newImageFiles: File[] = [];
      const limit = 10 - images.length;

      for (let i = 0; i < Math.min(files.length, limit); i++) {
        const file = files[i];
        newImageUrls.push(URL.createObjectURL(file));
        newImageFiles.push(file);
      }
      
      setImages(prev => [...prev, ...newImageUrls]);
      setImageFiles(prev => [...prev, ...newImageFiles]);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    URL.revokeObjectURL(images[indexToDelete]);
    setImages(prev => prev.filter((_, index) => index !== indexToDelete));
    setImageFiles(prev => prev.filter((_, index) => index !== indexToDelete));
  };
  
  const handleTradeMethodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setTradeMethods(prev => ({ ...prev, [name]: checked }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지

    // 간단한 유효성 검사
    if (!termsAgreed) {
        alert('판매 정보 동의 약관에 체크해주세요.');
        return;
    }
    if (imageFiles.length === 0) {
        alert('이미지를 1개 이상 등록해주세요.');
        return;
    }
    if (!productName.trim()) {
        alert('상품명을 입력해주세요.');
        return;
    }

    // 콘솔에 출력할 데이터 객체 생성
    const formData = {
      images: imageFiles, // 실제 파일 객체
      productName,
      price: Number(price) || 0,
      isNegotiable,
      description,
      tradeMethods,
      shippingCost: Number(shippingCost) || 0,
      termsAgreed,
    };

    // 콘솔에 데이터 출력
    console.log('--- 폼 제출 데이터 ---');
    console.log(formData);
    alert('폼 데이터가 콘솔에 성공적으로 출력되었습니다. (F12 키를 눌러 확인)');
  };


  return (
    <div className="bg-white min-h-screen">
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">알림</h3>
            <p>이미지는 최대 10개까지 등록할 수 있습니다.</p>
            <button 
              onClick={() => setShowAlert(false)}
              className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 모든 입력 요소를 form으로 감싸고, 제출 시 handleSubmit 함수를 호출 */}
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 1. 이미지 업로드 섹션 */}
          <section>
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              <div 
                onClick={handleUploadClick}
                className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-500 mt-1">{images.length}/10</span>
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {images.map((image, index) => (
                <div key={image} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <img src={image} alt={`uploaded-preview-${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" // form 제출 방지
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75"
                    aria-label="이미지 삭제"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              상품 이미지를 등록해주세요.<br/>
              첫 번째 사진이 대표 이미지로 사용됩니다.
            </p>
          </section>

          {/* 2. 상품명 입력 섹션 */}
          <section>
            <label htmlFor="productName" className="block text-base font-semibold text-gray-800 mb-2">
              상품명
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
              placeholder="상품명을 입력해주세요."
            />
          </section>

          {/* 3. 카테고리 선택 및 AI 템플릿 생성 섹션 */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow grid grid-cols-2 border border-gray-200 rounded-lg">
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
                <input 
                  id="negotiable" 
                  type="checkbox" 
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">
                  네고가능여부
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                placeholder="- 상품명(브랜드)&#10;- 구매 시기 (년, 월, 일)&#10;- 착용 기간&#10;- 오염 여부&#10;- 하자 여부&#10;* 실제 촬영한 사진과 함께 상세 정보를 입력해주세요.&#10;* 카카오톡 아이디 첨부 시 게시물 삭제 및 이용제재 처리될 수 있어요.&#10;* 안전하고 건전한 거래환경을 위해 과학기술정보통신부, 한국인터넷진흥원, 중고나라가 함께합니다."
              />
          </section>

          {/* 6. 거래 방법 섹션 */}
          <section>
            <h3 className="text-base font-semibold text-gray-800 mb-3">거래방법</h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input id="delivery" name="delivery" type="checkbox" checked={tradeMethods.delivery} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="delivery" className="ml-2 block text-sm text-gray-700">택배거래</label>
                </div>
                <div className="flex items-center">
                  <input id="direct" name="direct" type="checkbox" checked={tradeMethods.direct} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="direct" className="ml-2 block text-sm text-gray-700">직거래</label>
                </div>
                <div className="flex items-center">
                  <input id="video" name="video" type="checkbox" checked={tradeMethods.video} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="video" className="ml-2 block text-sm text-gray-700">화상거래</label>
                </div>
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
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
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
                <input 
                  id="terms" 
                  type="checkbox" 
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg disabled:bg-gray-400"
              disabled={!termsAgreed}
            >
              판매글 등록
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
