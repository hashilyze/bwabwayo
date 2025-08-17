'use client'
import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { useCategoryStore } from '@/stores/categoryStore';
import { useAiDescriptionStore } from '@/stores/ai/aiDescriptionStore';
import { useProductStore, ProductFormData } from '@/stores/product/productStore';

// --- 아이콘 컴포넌트 (Icons) ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="<http://www.w3.org/2000/svg>" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="<http://www.w3.org/2000/svg>" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- 메인 페이지 컴포넌트 (Main Page Component) ---
export default function CreateProductPage() {
  const router = useRouter();
  const { categories, getCategories } = useCategoryStore();
  const { addProduct } = useProductStore();
  const {
    description,
    loading: aiLoading,
    error: aiError,
    fetchDescription,
    setDescription,
    reset: resetAiDescription
  } = useAiDescriptionStore();

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
  const [tradeMethods, setTradeMethods] = useState({ delivery: false, direct: false, video: false });
  const [shippingCost, setShippingCost] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [majorCategory, setMajorCategory] = useState<string | null>(null);
  const [minorCategory, setMinorCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 제출 방지 상태

  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 템플릿 생성 핸들러
  const handleGenerateAiTemplate = async () => {
    const getCategoryId = (): number | null => {
        const selectedMajor = categories.find(cat => cat.categoryName === majorCategory);
        if (!selectedMajor || !minorCategory) return null;

        const selectedMinor = selectedMajor.subCategories.find(sub => sub.categoryName === minorCategory);
        return selectedMinor ? selectedMinor.categoryId : null;
    };

    const categoryId = getCategoryId();
    if (!categoryId) { alert('AI 템플릿을 생성하려면 카테고리를 모두 선택해주세요.'); return; }
    await fetchDescription(categoryId);
  };

  // 숫자에 콤마 추가하는 함수
  const formatNumber = (value: string): string => {
    if (!value) return '';
    const number = value.replace(/,/g, '');
    if (isNaN(Number(number))) return value;
    return Number(number).toLocaleString();
  };

  // 콤마 제거하는 함수 (API 호출시 사용)
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

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
    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
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

    // 파일 정보를 먼저 저장
    setImgFiles(prev => [...prev, ...fileArray]);

    try {
      // S3에 업로드 (성공 시 미리보기 URL 업데이트됨)
      await uploadToS3(fileArray);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      // 오류 발생 시 추가된 파일 정보 제거
      setImgFiles(prev => prev.slice(0, prev.length - fileArray.length));
    }

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

      const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/product', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      console.log('S3 업로드 성공:', data);

      // S3에서 받아온 key값들을 바로 images에 저장
      const imageKeys = data.results.map((item: any) => item.key);
      const imageUrls = data.results.map((item: any) => item.url);

      setImgPreviews(prev => [...prev, ...imageUrls]);
      setUploadedImageUrls(prev => [...prev, ...imageKeys]);

    } catch (error) {
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
    // 이미지 관련 상태 초기화
    setImgFiles([]);
    setImgPreviews([]);
    setUploadedImageUrls([]);

    // 상품 정보 초기화
    setProductName('');
    setPrice('');
    setIsNegotiable(false);
    setTradeMethods({ delivery: false, direct: false, video: false });
    setShippingCost('');
    resetAiDescription(); // AI 스토어 상태 초기화

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
    if (isSubmitting) return; // 중복 제출 방지

    if (!termsAgreed) { alert('판매 정보 동의 약관에 체크해주세요.'); return; }
    if (uploadedImageUrls.length === 0) { alert('이미지를 1개 이상 등록해주세요.'); return; }
    if (!productName.trim()) { alert('상품명을 입력해주세요.'); return; }
    
    // '기타'가 아닐 때만 소분류 선택 여부 확인
    if (majorCategory !== '기타' && (!majorCategory || !minorCategory)) {
      alert('카테고리를 모두 선택해주세요.');
      return;
    }

    // *** 카테고리 이름을 ID로 변환 ***
    const getCategoryId = (): number | null => {
      const selectedMajor = categories.find(cat => cat.categoryName === majorCategory);
      if (!selectedMajor) return null;

      if (selectedMajor.categoryName === '기타') {
        return selectedMajor.categoryId;
      }

      return selectedMajor.subCategories.find(sub => sub.categoryName === minorCategory)?.categoryId || null;
    };
    
    const categoryId = getCategoryId();
    if (!categoryId) { // 이중 확인
      alert('선택된 카테고리를 찾을 수 없습니다.');
      return;
    }

    // *** 상품 등록 요청 데이터 준비 ***
    const requestData: ProductFormData = {
      title: productName,
      description: description,
      price: Number(removeCommas(price)),
      categoryId: categoryId,
      canNegotiate: isNegotiable,
      canDirect: tradeMethods.direct,
      canDelivery: tradeMethods.delivery,
      canVideoCall: tradeMethods.video,
      shippingFee: Number(removeCommas(shippingCost)) || 0, // null 방지를 위해 0으로 기본값 설정
      images: uploadedImageUrls, // S3에서 업로드된 이미지 key값들
    };

    // 백엔드 DTO 요구사항 검증
    if (!requestData.title || requestData.title.trim() === '') {
      alert('상품명을 입력해주세요.');
      return;
    }

    if (!requestData.description || requestData.description.trim() === '') {
      alert('상품 설명을 입력해주세요.');
      return;
    }

    if (requestData.price <= 0) {
      alert('가격을 올바르게 입력해주세요.');
      return;
    }

    if (requestData.price > 2100000000) {
      alert('가격은 21억 이하로 입력해주세요.');
      return;
    }

    if (requestData.shippingFee > 2100000000) {
      alert('배송비는 21억 이하로 입력해주세요.');
      return;
    }

    // AtLeastOneTrue 검증: canDirect 또는 canDelivery 중 하나는 true여야 함
    if (!requestData.canDirect && !requestData.canDelivery) {
      alert('직거래 또는 택배거래 중 하나는 선택해야 합니다.');
      return;
    }

    if (requestData.images.length === 0) {
      alert('이미지를 1개 이상 등록해주세요.');
      return;
    }

    if (requestData.images.length > 10) {
      alert('이미지는 최대 10개까지 등록할 수 있습니다.');
      return;
    }

    try {
      setIsSubmitting(true); // 제출 시작
      console.log('--- 🛒 상품 등록 API 호출 시작 ---');

      const newProductId = await addProduct(requestData);
      console.log('✅ 상품 등록 성공, ID:', newProductId);

      // alert(`상품이 성공적으로 등록되었습니다!\n\n📝 제목: ${requestData.title}\n💰 가격: ${requestData.price}원\n📸 이미지: ${requestData.images.length}개`);
      alert(`상품이 성공적으로 등록되었습니다!`);

      // 성공 후 폼 초기화 및 페이지 이동
      resetForm();
      router.replace(`/product/${newProductId}`);

    } catch (error) {
      console.error('❌ 상품 등록 실패:', error);

      // 에러 타입별 상세 메시지
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
      }

      alert(`상품 등록에 실패했습니다.\\n\\n다음을 확인해주세요:\\n• 모든 필수 항목이 입력되었는지\\n• 이미지가 정상적으로 업로드되었는지\\n• 네트워크 연결 상태\\n\\n콘솔에서 자세한 오류를 확인할 수 있습니다.`);
    } finally {
      setIsSubmitting(false); // 제출 완료 (성공/실패 무관)
    }
  };

  const selectedMajorObject = categories.find(c => c.categoryName === majorCategory);

  return (
    <div className="min-h-screen pb-10">
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
                <div className="flex flex-col items-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <span className="text-xs text-gray-500">업로드 중...</span>
                </div>
              ) : (
                <>
                  <svg xmlns="<http://www.w3.org/2000/svg>" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                <img src={preview} alt={`이미지 미리보기 ${index + 1}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="이미지 삭제"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-md text-gray-500">상품 이미지를 등록해주세요.<br/>첫 번째 사진이 대표 이미지로 사용됩니다.</p>
        </form>


        {/* 상품 정보 입력 Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <section> {/* 상품명 */}
            <label htmlFor="productName" className="block text-xl font-semibold text-gray-800 mb-2">상품명 <span className="text-red-500">*</span></label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 block w-full rounded-full border-1 border-[#eee] focus:border-blue-500 focus:ring-blue-500 text-md py-3 px-5 bg-white" placeholder="상품명을 입력해주세요." />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 items-center">
            <div className="bg-white border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {categories.map(cat => (
                  <li key={cat.categoryName} onClick={() => handleMajorCategorySelect(cat.categoryName)} className={`px-4 py-3 text-md cursor-pointer ${majorCategory === cat.categoryName ? 'font-bold bg-[#ffe2a4]' : 'hover:bg-gray-100'}`}>{cat.categoryName}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {selectedMajorObject && selectedMajorObject.subCategories.length > 0 ? (
                  selectedMajorObject.subCategories.map(subCat => (
                    <li key={subCat.categoryName} onClick={() => setMinorCategory(subCat.categoryName)} className={`px-4 py-3 text-md cursor-pointer ${minorCategory === subCat.categoryName ? 'font-bold bg-[#ffe2a4]' : 'hover:bg-gray-100'}`}>{subCat.categoryName}</li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-400">소분류가 없습니다.</li>
                )}
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 ml-6">
              <div className="flex items-center gap-4">
                <div className="w-30"><img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/ai-add-product.png`} alt="" className="w-full h-full" /></div>
                <div className="">
                  <h1 className="text-lg font-semibold text-gray-800 mb-1">상품 설명이 자동으로!</h1>
                  <p className="text-md text-gray-500">카테고리를 입력하면 자동으로 상품 설명을 채워줘요</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiTemplate}
                disabled={aiLoading || !minorCategory}
                className="w-40 border-2 border-black bg-[#FFAE00] font-bold px-4 py-3 rounded-full cursor-pointer transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'AI가 생성 중...' : 'AI 템플릿 생성'}
              </button>
              {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
            </div>
          </section>

          <section> {/* 판매 가격 */}
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price" className="block text-xl font-semibold text-gray-800">판매가격 <span className="text-red-500">*</span></label>
              <div className="flex items-center">
                <input id="negotiable" type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" />
                <label htmlFor="negotiable" className="ml-2 block text-md text-gray-700">네고가능</label>
              </div>
            </div>
            <div className="relative"><input type="text" id="price" value={price} onChange={(e) => {
              const value = e.target.value.replace(/,/g, '');
              if (value === '' || !isNaN(Number(value))) {
                const numericValue = Number(value);
                if (numericValue > 2100000000) {
                  alert('가격은 21억 이하로 입력해주세요.');
                  setPrice(formatNumber('2100000000'));
                } else {
                  setPrice(formatNumber(value));
                }
              }
            }} className="block w-full rounded-full border-1 border-[#eee] focus:border-blue-500 focus:ring-blue-500 text-md py-3 px-5 bg-white" placeholder="판매가격을 입력해주세요." /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-md text-gray-500">원</span></div>
          </section>

          <section> {/* 게시물 내용 */}
            <label htmlFor="description" className="block text-xl font-semibold text-gray-800 mb-2">상품 설명 <span className="text-red-500">*</span></label>
            <textarea
              id="description"
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-2xl border-1 border-[#eee] focus:border-blue-500 focus:ring-blue-500 text-md py-3 px-5 bg-white"
              placeholder={`- 상품명(브랜드)
- 구매 시기 (년, 월, 일)
- 착용 기간
- 오염 여부
- 하자 여부
* 실제 촬영한 사진과 함께 상세 정보를 입력해주세요.
* 카카오톡 아이디 첨부 시 게시물 삭제 및 이용제재 처리될 수 있어요.`
              }
            />
          </section>

          <section> {/* 거래 방법 */}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">거래방법 <span className="text-red-500">*</span></h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center"><input id="delivery" name="delivery" type="checkbox" checked={tradeMethods.delivery} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="delivery" className="ml-2 block text-sm text-gray-700">택배거래</label></div>
                <div className="flex items-center"><input id="direct" name="direct" type="checkbox" checked={tradeMethods.direct} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="direct" className="ml-2 block text-sm text-gray-700">직거래</label></div>
                <div className="flex items-center"><input id="video" name="video" type="checkbox" checked={tradeMethods.video} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="video" className="ml-2 block text-sm text-gray-700">화상거래</label></div>
            </div>
            {!tradeMethods.delivery && !tradeMethods.direct && (
              <p className="text-sm text-red-500 mt-2">직거래 또는 택배거래 중 하나는 선택해야 합니다.</p>
            )}
          </section>

          <section> {/* 배송비 설정 */}
            <label htmlFor="shippingCost" className="block text-xl font-semibold text-gray-800 mb-2">배송비 설정</label>
            <div className="relative"><input type="text" id="shippingCost" value={shippingCost} onChange={(e) => {
              const value = e.target.value.replace(/,/g, '');
              if (value === '' || !isNaN(Number(value))) {
                const numericValue = Number(value);
                if (numericValue > 2100000000) {
                  alert('배송비는 21억 이하로 입력해주세요.');
                  setShippingCost(formatNumber('2100000000'));
                } else {
                  setShippingCost(formatNumber(value));
                }
              }
            }} className="block w-full rounded-full border-1 border-[#eee] focus:border-blue-500 focus:ring-blue-500 text-md py-3 px-5 bg-white" placeholder="배송비를 입력해주세요." /><span className="absolute inset-y-0 right-3 pr-3 flex items-center text-md text-gray-500">원</span></div>
          </section>

          <section className="pt-8 space-y-6"> {/* 약관 동의 및 등록 버튼 */}
            <div className="flex items-start justify-center">
              <div className="flex items-center h-5"><input id="terms" type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /></div>
              <div className="ml-3 text-md"><label htmlFor="terms" className="font-medium text-gray-700 flex items-center"><CheckIcon className="w-5 h-5 text-green-500 mr-1" />판매 정보가 실제 상품과 다를 경우, 책임은 판매자에게 있음을 동의합니다.</label></div>
            </div>
            <button type="submit" className="flex justify-center w-60 mx-auto border-2 border-black bg-[#FFAE00] font-bold py-3 px-6 rounded-full cursor-pointer transition text-md disabled:bg-gray-400" disabled={!termsAgreed || isSubmitting}>{isSubmitting ? '등록 중...' : '판매글 등록'}</button>
          </section>
        </form>
      </main>
    </div>
  )
}
