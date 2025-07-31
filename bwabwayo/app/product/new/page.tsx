'use client'
import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';

import { useCategoryStore } from '@/stores/categoryStore';
import { useProductStore } from '@/stores/productStore';

// --- 아이콘 컴포넌트 (Icons) ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- 메인 페이지 컴포넌트 (Main Page Component) ---
export default function CreateProductPage() {
  const { categories, getCategories } = useCategoryStore();
  const { addProduct } = useProductStore();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // --- 상태 관리 (State Management) ---
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [tradeMethods, setTradeMethods] = useState({ delivery: false, direct: false, video: false });
  const [shippingCost, setShippingCost] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [majorCategory, setMajorCategory] = useState<string | null>(null);
  const [minorCategory, setMinorCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTradeMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTradeMethods(prev => ({ ...prev, [name]: checked }));
  };

  // 이미지 업로드 박스 클릭
  const handleUploadClick = () => {
    if (imgFiles.length >= 10) {
      setShowAlert(true);
      return;
    }
    fileInputRef.current?.click();
  };

  // 파일 선택 시 처리
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // 10개 제한 확인
    if (imgFiles.length + fileArray.length > 10) {
      setShowAlert(true);
      return;
    }

    // 파일 정보만 저장 (미리보기는 S3 업로드 후 생성)
    setImgFiles(prev => [...prev, ...fileArray]);

    // S3에 업로드 (성공 시 미리보기 URL 업데이트됨)
    await uploadToS3(fileArray);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // S3 업로드 함수
  const uploadToS3 = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      // 백엔드에서 필요한 dir 파라미터 추가
      formData.append('dir', 'products'); // 상품 이미지 디렉토리

      console.log('S3 업로드 시작:', {
        파일수: files.length,
        디렉토리: 'products',
        파일정보: files.map(f => ({
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
          type: f.type
        }))
      });
      
      const response = await fetch('https://i13e202.p.ssafy.io/be/api/s3/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('S3 업로드 성공:', data);
        
        // 백엔드 응답 형식에 따른 URL 추출
        let uploadedUrls: string[] = [];
        
        if (data.result && Array.isArray(data.result)) {
          // UploadResponseDTO 형식: { result: [UploadResultDTO] }
          uploadedUrls = data.result.map((item: any) => item.url || item.fileUrl || item.s3Url).filter(Boolean);
          console.log('UploadResponseDTO에서 URL 추출:', uploadedUrls);
        } else if (data.urls && Array.isArray(data.urls)) {
          // 기존 형식: { urls: ["url1", "url2"] }
          uploadedUrls = data.urls;
          console.log('기존 형식에서 URL 추출:', uploadedUrls);
        } else if (data.url) {
          // 단일 URL: { url: "url" }
          uploadedUrls = [data.url];
          console.log('단일 URL 추출:', uploadedUrls);
        } else {
          console.warn('알 수 없는 응답 형식:', data);
          // 응답 전체를 로그로 확인
          console.log('전체 응답 구조:', JSON.stringify(data, null, 2));
        }
        
        if (uploadedUrls.length > 0) {
          // 업로드된 이미지 URL들을 미리보기와 최종 업로드 URL 모두에 저장
          setImgPreviews(prev => [...prev, ...uploadedUrls]);
          setUploadedImageUrls(prev => [...prev, ...uploadedUrls]);
          alert(`이미지 업로드가 완료되었습니다! (${uploadedUrls.length}개)`);
        } else {
          console.error('업로드 성공했지만 URL을 찾을 수 없습니다.');
          alert('업로드는 성공했지만 이미지 URL을 받지 못했습니다. 콘솔을 확인해주세요.');
        }
      } else {
        // 업로드 실패 시 추가된 파일 정보 제거
        setImgFiles(prev => prev.slice(0, prev.length - files.length));
        console.error('S3 업로드 실패:', response.status, response.statusText);
        
        // 에러 응답 상세 확인
        try {
          const errorData = await response.text();
          console.error('에러 응답 내용:', errorData);
        } catch (e) {
          console.error('에러 응답 읽기 실패');
        }
        
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      // 네트워크 오류 시 추가된 파일 정보 제거
      setImgFiles(prev => prev.slice(0, prev.length - files.length));
      console.error('S3 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 삭제
  const handleDeleteImage = (index: number) => {
    // 상태에서 제거 (S3 URL이므로 메모리 해제 불필요)
    setImgFiles(prev => prev.filter((_, i) => i !== index));
    setImgPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMajorCategorySelect = (categoryName: string) => {
    setMajorCategory(categoryName);
    setMinorCategory(null);
  };

  // 폼 초기화 함수
  const resetForm = () => {
    console.log('🔄 폼 초기화 중...');
    
    // 이미지 관련 상태 초기화
    setImgFiles([]);
    setImgPreviews([]);
    setUploadedImageUrls([]);
    
    // 상품 정보 초기화
    setProductName('');
    setPrice('');
    setIsNegotiable(false);
    setDescription('');
    setTradeMethods({ delivery: false, direct: false, video: false });
    setShippingCost('');
    
    // 카테고리 초기화
    setMajorCategory(null);
    setMinorCategory(null);
    
    // 약관 동의 초기화
    setTermsAgreed(false);
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!termsAgreed) { alert('판매 정보 동의 약관에 체크해주세요.'); return; }
    if (uploadedImageUrls.length === 0) { alert('이미지를 1개 이상 등록해주세요.'); return; }
    if (!productName.trim()) { alert('상품명을 입력해주세요.'); return; }
    if (!majorCategory) { alert('카테고리를 선택해주세요.'); return; }

    // *** 카테고리 이름을 ID로 변환 ***
    const getCategoryId = (): number | null => {
      if (minorCategory) {
        // 서브카테고리가 선택된 경우
        for (const category of categories) {
          const subCategory = category.subCategories.find(sub => sub.categoryName === minorCategory);
          if (subCategory) {
            return subCategory.categoryId;
          }
        }
      } else if (majorCategory) {
        // 메인카테고리만 선택된 경우
        const category = categories.find(cat => cat.categoryName === majorCategory);
        return category ? category.categoryId : null;
      }
      return null;
    };

    const categoryId = getCategoryId();
    if (!categoryId) {
      alert('카테고리 ID를 찾을 수 없습니다.');
      return;
    }

    // *** 상품 등록 요청 데이터 준비 ***
    const requestData = {
      title: productName,
      description: description,
      price: Number(price),
      categoryId: categoryId,
      canNegotiate: isNegotiable,
      canDirect: tradeMethods.direct,
      canDelivery: tradeMethods.delivery,
      canVideoCall: tradeMethods.video,
      shippingFee: Number(shippingCost),
      images: uploadedImageUrls, // S3에서 업로드된 이미지 URL들
    };

    // 상세한 데이터 확인 로그
    console.log('🚀 상품 등록 요청 데이터:', {
      '📝 기본 정보': {
        제목: requestData.title,
        설명: requestData.description,
        가격: `${requestData.price}원`,
        카테고리ID: requestData.categoryId,
        카테고리명: `${majorCategory}${minorCategory ? ` > ${minorCategory}` : ''}`,
      },
      '🔧 거래 옵션': {
        가격협상: requestData.canNegotiate ? '가능' : '불가능',
        직거래: requestData.canDirect ? '가능' : '불가능',
        택배거래: requestData.canDelivery ? '가능' : '불가능',
        화상통화: requestData.canVideoCall ? '가능' : '불가능',
        배송비: `${requestData.shippingFee}원`,
      },
      '📸 이미지 정보': {
        업로드된_이미지_수: requestData.images.length,
        S3_URL들: requestData.images,
        미리보기_URL들: imgPreviews,
      }
    });

    try {
      console.log('--- 🛒 상품 등록 API 호출 시작 ---');
      
      // 최종 검증
      if (requestData.images.length === 0) {
        alert('S3에 업로드된 이미지가 없습니다. 이미지를 다시 업로드해주세요.');
        return;
      }
      
      if (requestData.price <= 0) {
        alert('가격을 올바르게 입력해주세요.');
        return;
      }

      const result = await addProduct(requestData as any);
      console.log('✅ 상품 등록 성공:', result);
      
      alert(`상품이 성공적으로 등록되었습니다!\n\n📝 제목: ${requestData.title}\n💰 가격: ${requestData.price}원\n📸 이미지: ${requestData.images.length}개`);
      
      // 성공 후 폼 초기화
      resetForm();
      
    } catch (error) {
      console.error('❌ 상품 등록 실패:', error);
      
      // 에러 타입별 상세 메시지
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
      }
      
      alert(`상품 등록에 실패했습니다.\n\n다음을 확인해주세요:\n• 모든 필수 항목이 입력되었는지\n• 이미지가 정상적으로 업로드되었는지\n• 네트워크 연결 상태\n\n콘솔에서 자세한 오류를 확인할 수 있습니다.`);
    }
  };

  const selectedMajorObject = categories.find(c => c.categoryName === majorCategory);

  return (
    <div className="bg-white min-h-screen">
      {showAlert && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">알림</h3>
            <p>이미지는 최대 10개까지 등록할 수 있습니다.</p>
            <button onClick={async () => {
              setShowAlert(false);
            }} className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">확인</button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* 이미지 업로드 전용 Form */}
        <form className="mb-10" encType="multipart/form-data">
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            <div 
              onClick={handleUploadClick} 
              className={`flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm text-gray-500 mt-1">{imgPreviews.length}/10</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden" 
            />
            {imgPreviews.map((preview, index) => (
              <div key={preview} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                <img src={preview} alt={`이미지 미리보기 ${index + 1}`} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75" 
                  aria-label="이미지 삭제"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">상품 이미지를 등록해주세요.<br/>첫 번째 사진이 대표 이미지로 사용됩니다.</p>
        </form>


        {/* 상품 정보 입력 Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <section> {/* 상품명 */}
            <label htmlFor="productName" className="block text-base font-semibold text-gray-800 mb-2">상품명</label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3" placeholder="상품명을 입력해주세요." />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {categories.map(cat => (
                  <li key={cat.categoryName} onClick={() => handleMajorCategorySelect(cat.categoryName)} className={`px-4 py-2 text-sm cursor-pointer ${majorCategory === cat.categoryName ? 'font-bold bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}>{cat.categoryName}</li>
                ))}
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {selectedMajorObject && selectedMajorObject.subCategories.length > 0 ? (
                  selectedMajorObject.subCategories.map(subCat => (
                    <li key={subCat.categoryName} onClick={() => setMinorCategory(subCat.categoryName)} className={`px-4 py-2 text-sm cursor-pointer ${minorCategory === subCat.categoryName ? 'font-bold bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}>{subCat.categoryName}</li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-400">소분류가 없습니다.</li>
                )}
              </ul>
            </div>
            <div>
              <button type="button" className="w-full bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">AI 템플릿 생성</button>
            </div>
          </section>

          <section> {/* 판매 가격 */}
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price" className="block text-base font-semibold text-gray-800">판매가격</label>
              <div className="flex items-center">
                <input id="negotiable" type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">네고가능</label>
              </div>
            </div>
            <div className="relative"><input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8" placeholder="판매가격을 입력해주세요." /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span></div>
          </section>

          <section> {/* 게시물 내용 */}
             <textarea id="description" rows={10} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3" placeholder="- 상품명(브랜드)&#10;- 구매 시기 (년, 월, 일)&#10;- 착용 기간&#10;- 오염 여부&#10;- 하자 여부&#10;* 실제 촬영한 사진과 함께 상세 정보를 입력해주세요.&#10;* 카카오톡 아이디 첨부 시 게시물 삭제 및 이용제재 처리될 수 있어요."/>
          </section>

          <section> {/* 거래 방법 */}
            <h3 className="text-base font-semibold text-gray-800 mb-3">거래방법</h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center"><input id="delivery" name="delivery" type="checkbox" checked={tradeMethods.delivery} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="delivery" className="ml-2 block text-sm text-gray-700">택배거래</label></div>
                <div className="flex items-center"><input id="direct" name="direct" type="checkbox" checked={tradeMethods.direct} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="direct" className="ml-2 block text-sm text-gray-700">직거래</label></div>
                <div className="flex items-center"><input id="video" name="video" type="checkbox" checked={tradeMethods.video} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="video" className="ml-2 block text-sm text-gray-700">화상거래</label></div>
            </div>
          </section>
          
          <section> {/* 배송비 설정 */}
            <label htmlFor="shippingCost" className="block text-base font-semibold text-gray-800 mb-2">배송비 설정</label>
            <div className="relative"><input type="number" id="shippingCost" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8" placeholder="배송비를 입력해주세요." /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span></div>
          </section>
          
          <section className="border-t border-gray-200 pt-8 space-y-6"> {/* 약관 동의 및 등록 버튼 */}
            <div className="flex items-start">
              <div className="flex items-center h-5"><input id="terms" type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></div>
              <div className="ml-3 text-sm"><label htmlFor="terms" className="font-medium text-gray-700 flex items-center"><CheckIcon className="w-5 h-5 text-green-500 mr-1" />판매 정보가 실제 상품과 다를 경우, 책임은 판매자에게 있음을 동의합니다.</label></div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg disabled:bg-gray-400" disabled={!termsAgreed}>판매글 등록</button>
          </section>
        </form>
      </main>
    </div>
  )
}