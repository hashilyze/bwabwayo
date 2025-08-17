'use client'

import { useState, useRef, ChangeEvent, useEffect, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useCategoryStore } from '@/stores/categoryStore';
import { useAiDescriptionStore } from '@/stores/ai/aiDescriptionStore';
import { useProductStore, ProductFormData } from '@/stores/product/productStore';

// --- 아이콘 컴포넌트 (Icons) ---
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg>" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- 메인 페이지 컴포넌트 (Main Page Component) ---
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  // --- 스토어 상태 및 액션 ---
  const { categories, getCategories } = useCategoryStore();
  const { product: productDetail, getProductDetail, updateProduct, loading: productLoading } = useProductStore();
  const {
    description,
    loading: aiLoading,
    error: aiError,
    fetchDescription,
    setDescription,
  } = useAiDescriptionStore();

  // --- 상태 관리 (State Management) ---
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [tradeMethods, setTradeMethods] = useState({ delivery: false, direct: false, video: false });
  const [shippingCost, setShippingCost] = useState('');
  const [majorCategory, setMajorCategory] = useState<string | null>(null);
  const [minorCategory, setMinorCategory] = useState<string | null>(null);
  
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // 이미지 키(key)를 저장
  const [isUploading, setIsUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 데이터 포맷팅 함수 ---
  const formatNumber = (value: string): string => {
    if (!value) return '';
    const number = value.replace(/,/g, '');
    if (isNaN(Number(number))) return value;
    return Number(number).toLocaleString();
  };

  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // --- 데이터 로딩 및 상태 초기화 ---
  useEffect(() => {
    if (productId) {
      getProductDetail(productId);
      getCategories();
    }
  }, [productId]);

  useEffect(() => {
    // productDetail 데이터가 존재하고, 현재 페이지의 productId와 일치할 때만 폼 상태를 채웁니다.
    if (productDetail && productDetail.id === productId) {
          console.log('✅ 폼 데이터 채우기 로직이 정상적으로 한 번 실행되었습니다.');
  
        console.log('📝 폼 데이터 채우기 시작 (원본 데이터):', productDetail);

      setProductName(productDetail.title);
      setPrice(formatNumber(String(productDetail.price)));
      setDescription(productDetail.description);
      setIsNegotiable(productDetail.canNegotiate);
      setTradeMethods({
        delivery: productDetail.canDelivery,
        direct: productDetail.canDirect,
        video: productDetail.canVideoCall,
      });
      setShippingCost(formatNumber(String(productDetail.shippingFee || '')));
      setImgPreviews(productDetail.imageUrls);
      setUploadedImageUrls(productDetail.imageKeys);


      // 카테고리 설정
      const majorCat = productDetail.categories[0];
      const minorCat = productDetail.categories.length > 1 ? productDetail.categories[1] : null;

      // 'categoryName'이 아닌 'name' 속성을 사용합니다.
      if (majorCat) {
        setMajorCategory(majorCat.name);
      }
      if (minorCat) {
        setMinorCategory(minorCat.name);
      }
      console.log('🎨 폼 상태 업데이트 후 (설정될 값):', {
        productName: productDetail.title,
        price: formatNumber(String(productDetail.price)),
        description: productDetail.description,
        isNegotiable: productDetail.canNegotiate,
        tradeMethods: {
          delivery: productDetail.canDelivery,
          direct: productDetail.canDirect,
          video: productDetail.canVideoCall,
        },
        shippingCost: formatNumber(String(productDetail.shippingFee || '')),
        imgPreviews: productDetail.imageUrls,
        uploadedImageUrls: productDetail.imageKeys,
majorCategory: majorCat?.name || null,
        minorCategory: minorCat?.name || null,
      });
    }
  }, [productDetail, productId]);


  // --- 핸들러 함수 ---
  const handleTradeMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTradeMethods(prev => ({ ...prev, [name]: checked }));
  };

  const handleUploadClick = () => {
    if (imgPreviews.length >= 10) {
      setShowAlert(true);
      return;
    }
    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    if (imgPreviews.length + fileArray.length > 10) {
      setShowAlert(true);
      return;
    }

    await uploadToS3(fileArray);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadToS3 = async (files: File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/product', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'S3 업로드에 실패했습니다.');
      }

      const imageUrls = data.results.map((item: any) => item.url);
      const imageKeys = data.results.map((item: any) => item.key);

      setImgPreviews(prev => [...prev, ...imageUrls]);
      setUploadedImageUrls(prev => [...prev, ...imageKeys]);

    } catch (error) {
      console.error('S3 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImgPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMajorCategorySelect = (categoryName: string) => {
    setMajorCategory(categoryName);
    setMinorCategory(null);
  };

  const getCategoryId = useCallback((): number | null => {
    if (minorCategory) {
      for (const category of categories) {
        const subCategory = category.subCategories.find(sub => sub.categoryName === minorCategory);
        if (subCategory) return subCategory.categoryId;
      }
    } else if (majorCategory) {
      const category = categories.find(cat => cat.categoryName === majorCategory);
      return category ? category.categoryId : null;
    }
    return null;
  }, [categories, majorCategory, minorCategory]);

  const handleGenerateAiTemplate = async () => {
    const categoryId = getCategoryId();
    if (!categoryId) {
      alert('AI 템플릿을 생성하려면 카테고리를 먼저 선택해주세요.');
      return;
    }
    await fetchDescription(categoryId);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (uploadedImageUrls.length === 0) { alert('이미지를 1개 이상 등록해주세요.'); return; }
    if (!productName.trim()) { alert('상품명을 입력해주세요.'); return; }
    if (!majorCategory) { alert('카테고리를 선택해주세요.'); return; }

    const categoryId = getCategoryId();
    if (!categoryId) {
      alert('유효한 카테고리를 선택해주세요.');
      return;
    }

    const requestData: ProductFormData = {
      title: productName,
      description: description,
      price: Number(removeCommas(price)),
      shippingFee: Number(removeCommas(shippingCost)) || 0,
      canNegotiate: isNegotiable,
      canDirect: tradeMethods.direct,
      canDelivery: tradeMethods.delivery,
      canVideoCall: tradeMethods.video,
      categoryId: categoryId,
      images: uploadedImageUrls,
    };

    // 백엔드 DTO 요구사항 검증
    if (!requestData.title.trim()) { alert('상품명을 입력해주세요.'); return; }
    if (!requestData.description.trim()) { alert('상품 설명을 입력해주세요.'); return; }
    if (requestData.price <= 0) { alert('가격을 올바르게 입력해주세요.'); return; }
    if (requestData.price > 2100000000) {
      alert('가격은 21억 이하로 입력해주세요.');
      return;
    }
    if (requestData.shippingFee > 2100000000) {
      alert('배송비는 21억 이하로 입력해주세요.');
      return;
    }
    if (!requestData.canDirect && !requestData.canDelivery) { alert('직거래 또는 택배거래 중 하나는 선택해야 합니다.'); return; }
    if (requestData.images.length === 0) { alert('이미지를 1개 이상 등록해주세요.'); return; }
    if (requestData.images.length > 10) { alert('이미지는 최대 10개까지 등록할 수 있습니다.'); return; }

    try {
      console.log('--- 🛒 상품 수정 API 호출 시작 ---', requestData);
      await updateProduct(productId, requestData);
      alert('상품이 성공적으로 수정되었습니다!');
      router.push(`/product/${productId}`);
    } catch (error) {
      console.error('❌ 상품 수정 실패:', error);
      alert(`상품 수정에 실패했습니다. 콘솔에서 자세한 오류를 확인해주세요.`);
    }
  };

  const selectedMajorObject = categories.find(c => c.categoryName === majorCategory);

  if (productLoading && !productDetail) { // 초기 로딩 시에만 전체 화면 로딩 표시
    return <div className="min-h-screen flex items-center justify-center">상품 정보를 불러오는 중...</div>;
  }

  if (!productDetail) {
    return <div className="min-h-screen flex items-center justify-center">상품 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen">
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">알림</h3>
            <p>이미지는 최대 10개까지 등록할 수 있습니다.</p>
            <button onClick={() => setShowAlert(false)} className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">확인</button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">상품 수정</h1>

        {/* 이미지 업로드 */}
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
              <div key={`${preview}-${index}`} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                <img src={preview} alt={`이미지 미리보기 ${index + 1}`} className="w-full h-full object-cover" />
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
          <p className="text-sm text-gray-500">상품 이미지를 등록해주세요.<br/>첫 번째 사진이 대표 이미지로 사용됩니다.</p>
        </form>

        {/* 상품 정보 입력 Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <section> {/* 상품명 */}
            <label htmlFor="productName" className="block text-base font-semibold text-gray-800 mb-2">상품명 <span className="text-red-500">*</span></label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-white" placeholder="상품명을 입력해주세요." />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="bg-white border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {categories.map(cat => (
                  <li key={cat.categoryId} onClick={() => handleMajorCategorySelect(cat.categoryName)} className={`px-4 py-3 text-sm cursor-pointer ${majorCategory === cat.categoryName ? 'font-bold bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}>{cat.categoryName}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg h-60 overflow-y-auto">
              <ul>
                {selectedMajorObject && selectedMajorObject.subCategories.length > 0 ? (
                  selectedMajorObject.subCategories.map(subCat => (
                    <li key={subCat.categoryId} onClick={() => setMinorCategory(subCat.categoryName)} className={`px-4 py-3 text-sm cursor-pointer ${minorCategory === subCat.categoryName ? 'font-bold bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}>{subCat.categoryName}</li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-400">소분류가 없습니다.</li>
                )}
              </ul>
            </div>
            <div>
              <button
                type="button"
                onClick={handleGenerateAiTemplate}
                disabled={aiLoading || (!majorCategory && !minorCategory)}
                className="w-full bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'AI가 생성 중...' : 'AI 템플릿 생성'}
              </button>
              {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
            </div>
          </section>

          <section> {/* 판매 가격 */}
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price" className="block text-base font-semibold text-gray-800">판매가격 <span className="text-red-500">*</span></label>
              <div className="flex items-center">
                <input id="negotiable" type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">네고가능</label>
              </div>
            </div>
            <div className="relative">
              <input type="text" id="price" value={price} onChange={(e) => {
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
              }} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8 bg-white" placeholder="판매가격을 입력해주세요." />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span>
            </div>
          </section>

          <section> {/* 게시물 내용 */}
            <label htmlFor="description" className="block text-base font-semibold text-gray-800 mb-2">상품 설명 <span className="text-red-500">*</span></label>
            <textarea
                id="description"
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 bg-white"
                placeholder="- 상품명(브랜드)&#10;- 구매 시기 (년, 월, 일)&#10;- 착용 기간&#10;- 오염 여부&#10;- 하자 여부&#10;* 실제 촬영한 사진과 함께 상세 정보를 입력해주세요.&#10;* 카카오톡 아이디 첨부 시 게시물 삭제 및 이용제재 처리될 수 있어요."/>
          </section>

          <section> {/* 거래 방법 */}
            <h3 className="text-base font-semibold text-gray-800 mb-3">거래방법 <span className="text-red-500">*</span></h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center"><input id="delivery" name="delivery" type="checkbox" checked={tradeMethods.delivery} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="delivery" className="ml-2 block text-sm text-gray-700">택배거래</label></div>
                <div className="flex items-center"><input id="direct" name="direct" type="checkbox" checked={tradeMethods.direct} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="direct" className="ml-2 block text-sm text-gray-700">직거래</label></div>
                <div className="flex items-center"><input id="video" name="video" type="checkbox" checked={tradeMethods.video} onChange={handleTradeMethodChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white" /><label htmlFor="video" className="ml-2 block text-sm text-gray-700">화상거래</label></div>
            </div>
            {/* ✨ 추가된 부분 시작 */}
            {!tradeMethods.delivery && !tradeMethods.direct && (
              <p className="text-sm text-red-500 mt-2">직거래 또는 택배거래 중 하나는 선택해야 합니다.</p>
            )}
            {/* ✨ 추가된 부분 끝 */}
          </section>

          {/* ✨ 추가된 부분 시작 */}
          <section> {/* 배송비 설정 */}
            <label htmlFor="shippingCost" className="block text-base font-semibold text-gray-800 mb-2">배송비 설정</label>
            <div className="relative">
                <input type="text" id="shippingCost" value={shippingCost} onChange={(e) => {
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
                }} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-8 bg-white" placeholder="배송비를 입력해주세요." />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">원</span>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8"> {/* 최종 수정 버튼 */}
            <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg disabled:bg-gray-400 disabled:cursor-not-allowed" 
                disabled={productLoading || isUploading}
            >
              {productLoading || isUploading ? '수정 중...' : '상품 수정하기'}
            </button>
          </section>
          {/* ✨ 추가된 부분 끝 */}
        </form>
      </main>
    </div>
  )
}