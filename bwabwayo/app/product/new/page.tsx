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

      console.log('S3 업로드 시작:', files.map(f => ({f})));
      
      const response = await fetch('https://i13e202.p.ssafy.io/be/api/s3/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('S3 업로드 성공:', data);
        
        // 업로드된 이미지 URL들을 미리보기와 최종 업로드 URL 모두에 저장
        if (data.urls && Array.isArray(data.urls)) {
          setImgPreviews(prev => [...prev, ...data.urls]);
          setUploadedImageUrls(prev => [...prev, ...data.urls]);
        }
        
        alert('이미지 업로드가 완료되었습니다!');
      } else {
        // 업로드 실패 시 추가된 파일 정보 제거
        setImgFiles(prev => prev.slice(0, prev.length - files.length));
        console.error('S3 업로드 실패:', response.statusText);
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

    // *** API 명세서에 맞게 요청 데이터 이름 수정 ***
    // 컴포넌트 내부에서 사용하는 상태(state) 이름(예: productName)과
    // 서버로 보낼 때 사용하는 키(key) 이름(예: title)을 분리하여 관리합니다.
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
      images: uploadedImageUrls,
    };

    try {
      console.log('--- 상품 등록 중... ---');
      await addProduct(requestData as any); // 타입 임시 처리
      alert('상품이 성공적으로 등록되었습니다!');
      
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록에 실패했습니다. 다시 시도해주세요.');
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