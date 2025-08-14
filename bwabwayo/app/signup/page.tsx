// 파일 경로: app/signup/page.tsx
'use client';

import React, { useRef, ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/stores/signUpStore';
import Script from 'next/script';
import SignupSuccessModal from '@/components/signup/SignupSuccessModal'; // 성공 모달 컴포넌트 추가

import { UserCircleIcon, XCircleIcon } from '@/components/signup/Icons'; // 아이콘 컴포넌트 경로가 맞는지 확인해주세요.

// --- 타입 정의 ---
import { DaumPostcodeData } from '@/types/daum';

const BANK_LIST = [
    '기업은행', '국민은행', '우리은행', 'NH농협은행', '부산은행',
    '신한은행', '하나은행', '광주은행', '우체국', 'IM뱅크(대구은행)', '경남은행'
  ];
// --- 회원가입 페이지 컴포넌트 ---
export default function SignUpPage() {
    // --- Zustand 스토어에서 상태와 액션을 모두 가져옵니다. ---
    const {
        showOptionalFields, profileImage, nickname, phoneNumber, email,
        accountNumber, bankName, accountHolder, address, addressDetail, zipcode,
        recipientName, recipientPhoneNumber, agreements, loading, error, isSuccess,
        loginPoint, signUpPoint, // loginPoint와 signUpPoint 추가
        setShowOptionalFields, setProfileImage, setNickname, setPhoneNumber, setEmail,
        setAccountNumber, setBankName, setAccountHolder, setAddress,
        setAddressDetail, setZipcode, setRecipientName, setRecipientPhoneNumber,
        setAgreement, submitSignup, reset, setSocialInfo
    } = useSignupStore();

    // --- 이미지 업로드 관련 로컬 상태 ---
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // 성공 모달 상태 추가

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // 소셜 로그인 정보는 콜백 페이지에서 Zustand 스토어에 미리 저장됩니다.
    // 이 페이지는 스토어에서 값을 읽어와 UI를 채우기만 하므로,
    // URL 파라미터를 파싱하는 별도의 useEffect 로직이 필요 없습니다.
    // 컴포넌트가 렌더링될 때 useSignupStore() 훅이 최신 상태를 가져와
    // email, profileImage 등의 값을 input에 자동으로 채워줍니다.
    
    // 스토어에 프로필 이미지가 있으면 미리보기에 설정
    useEffect(() => {
        if (profileImage) {
            setPreview(profileImage);
        }
    }, [profileImage]);

    // 컴포넌트 언마운트 시 생성된 Object URL 해제 (메모리 누수 방지)
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // --- 이미지 업로드 관련 핸들러 ---
    const handleUploadClick = () => {
        if (isUploading) {
            alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
            return;
        }
        fileInputRef.current?.click();
    };

    const uploadProfileImage = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/profile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');

            const data = await response.json();
            const imageUrl = data.results[0]?.url;

            if (!imageUrl) throw new Error('업로드된 이미지 URL을 받지 못했습니다.');

            setProfileImage(imageUrl);
            setPreview(imageUrl);

        } catch (error) {
            console.error('프로필 이미지 업로드 오류:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
            setPreview(null);
            setProfileImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);

        const tempPreviewUrl = URL.createObjectURL(file);
        setPreview(tempPreviewUrl);

        await uploadProfileImage(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteImage = () => {
        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        setPreview(null);
        setProfileImage(null);
    };

    const handleAccountHolderChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 한글만 입력 가능하도록 정규식 사용
        const koreanOnly = value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
        setAccountHolder(koreanOnly);
    };

    const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 숫자만 입력 가능하도록 정규식 사용
        const numbersOnly = value.replace(/[^0-9]/g, '');
        setAccountNumber(numbersOnly);
    };

    const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 특수문자 제외 (영문, 숫자, 한글만 허용)
        const validNickname = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
        setNickname(validNickname);
    };

    const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 숫자만 입력 가능하도록 정규식 사용하고, 11자로 제한합니다.
        const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
        setPhoneNumber(numbersOnly);
    };

    const handleRecipientPhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 숫자만 입력 가능하도록 정규식 사용하고, 11자로 제한합니다.
        const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
        setRecipientPhoneNumber(numbersOnly);
    };

    const handleAddressSearch = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function(data: DaumPostcodeData) {
                    let fullAddress = data.address;
                    let extraAddress = '';
                    if (data.addressType === 'R') {
                        if (data.bname !== '') extraAddress += data.bname;
                        if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                    }
                    setAddress(fullAddress);
                    setZipcode(data.zonecode);
                }
            }).open();
        }
    };
    
    const handleAgreementChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setAgreement(name as keyof typeof agreements, checked);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // 약관 동의 확인
        if (!agreements.terms || !agreements.privacy) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        // 필수 입력 필드 유효성 검사
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        if (!accountHolder.trim() || !bankName.trim() || !accountNumber.trim()) {
            alert('계좌 정보(예금주, 은행, 계좌번호)는 필수입니다.');
            return;
        }

        // 배송지 정보 유효성 검사: 하나라도 입력되면 모두 필수
        const addressInfoProvided = recipientName.trim() || recipientPhoneNumber.trim() || zipcode.trim() || address.trim() || addressDetail.trim();
        const allAddressInfoProvided = recipientName.trim() && recipientPhoneNumber.trim() && zipcode.trim() && address.trim() && addressDetail.trim();

        if (addressInfoProvided && !allAddressInfoProvided) {
            alert('배송지 관련 정보를 모두 입력해주세요.');
            return;
        }

        await submitSignup();
    };

    useEffect(() => {
        if (isSuccess) {
            setIsSuccessModalOpen(true);
        }
    }, [isSuccess]);

    const handleSuccessConfirm = () => {
        setIsSuccessModalOpen(false);
        reset();
        router.replace('/');
    };

    const allRequiredAgreed = agreements.terms && agreements.privacy;

  return (
    <>
        <Script
            src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
            strategy="afterInteractive"
        />
        <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-left">회원가입</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md space-y-8">
                {/* 프로필 사진 업로드 */}
                 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                     <label className="font-bold text-lg">프로필 사진</label>
                     <div className="md:col-span-2 flex items-center gap-4 justify-start">
                         <input
                             type="file"
                             accept="image/*"
                             ref={fileInputRef}
                             onChange={handleFileChange}
                             className="hidden"
                         />
                         <div className="relative w-24 h-24">
                             <div
                                 onClick={handleUploadClick}
                                 className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed hover:border-yellow-400 transition-all"
                             >
                                 {preview ? (
                                     <img src={preview} alt="프로필 미리보기" className="w-full h-full object-cover" />
                                 ) : (
                                     <UserCircleIcon />
                                 )}
                                 {isUploading && (
                                     <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                         <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                                     </div>
                                 )}
                             </div>
                             {preview && !isUploading && (
                                 <button type="button" onClick={handleDeleteImage} className="absolute -top-1 -right-1 bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors" aria-label="이미지 삭제">
                                     <XCircleIcon />
                                 </button>
                             )}
                         </div>
                         <div>
                             <button type="button" className="px-6 py-2 bg-yellow-300 border border-black rounded-full font-bold text-base hover:bg-yellow-200" onClick={handleUploadClick} disabled={isUploading}>
                                 {isUploading ? '업로드 중...' : '이미지 등록'}
                             </button>
                             <p className="text-sm text-gray-500 mt-2">최대 10MB의 JPG, PNG, GIF파일</p>
                         </div>
                     </div>
                 </div>

                {/* 닉네임, 휴대폰 번호, 이메일 */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                    <label className="font-bold text-lg">닉네임 <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2 max-w-xs">
                        <input type="text" value={nickname} onChange={handleNicknameChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                    <label className="font-bold text-lg">휴대폰 번호</label>
                    <div className="md:col-span-2 max-w-xs">
                        <input type="tel" value={phoneNumber} onChange={handlePhoneNumberChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" maxLength={11} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                    <label className="font-bold text-lg">이메일</label>
                    <div className="md:col-span-2 max-w-xs">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                    </div>
                </div>

                <hr className="my-6 border-t border-gray-200" />

                {/* 계좌 정보 */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">계좌 정보<span className="text-red-500"> *</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                        <label className="font-bold text-lg">예금주 </label>
                        <div className="md:col-span-2 max-w-xs">
                            <input type="text" value={accountHolder}
                             onChange={handleAccountHolderChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                        <label className="font-bold text-lg">은행 </label>
                        <div className="md:col-span-2 max-w-xs">
                            <select 
                            value={bankName} 
                            onChange={(e) => setBankName(e.target.value)} 
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
                            required>
                                <option value="">은행선택</option>
                                {BANK_LIST.map((bank) => (<option key={bank} value={bank}>{bank}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                        <label className="font-bold text-lg">계좌번호 </label>
                        <div className="md:col-span-2 max-w-xs">
                            <input type="text" value={accountNumber} onChange={handleAccountNumberChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="'-' 없이 숫자만 입력"
                            required />
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-t border-gray-200" />

                {/* 배송지 정보 */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">배송지 정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                        <label className="font-bold text-lg">받는 사람</label>
                        <div className="md:col-span-2 max-w-xs">
                            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 justify-start">
                        <label className="font-bold text-lg">배송지 전화번호</label>
                        <div className="md:col-span-2 max-w-xs">
                            <input type="tel" value={recipientPhoneNumber} onChange={handleRecipientPhoneNumberChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" maxLength={11} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-start">
                        <label className="font-bold text-lg pt-2">주소</label>
                        <div className="md:col-span-2 space-y-2 max-w-xs">
                            <div className="flex gap-4 justify-start">
                                <input type="text" value={zipcode} className="w-32 border border-gray-300 rounded-xl px-4 py-2 bg-gray-50" placeholder="우편번호" readOnly />
                                <button type="button" onClick={handleAddressSearch} className="px-4 bg-yellow-300 border border-black rounded-full font-bold text-sm hover:bg-yellow-200 flex-shrink-0">우편번호 찾기</button>

                            </div>
                            <input type="text" value={address} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50" placeholder="주소" readOnly />
                            <input type="text" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="상세주소" />
                        </div>
                    </div>
                </div>

                {/* 약관 동의 */}
                <div className="space-y-4 border-t pt-8">
                    <div className="flex items-center"><input type="checkbox" id="terms" name="terms" checked={agreements.terms} onChange={handleAgreementChange} className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-300" /><label htmlFor="terms" className="ml-2 block text-sm text-gray-900">(필수) 이용약관 동의</label></div>
                    <div className="flex items-center"><input type="checkbox" id="privacy" name="privacy" checked={agreements.privacy} onChange={handleAgreementChange} className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-300" /><label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">(필수) 개인정보 수집 및 이용 동의</label></div>
                    <div className="flex items-center"><input type="checkbox" id="marketing" name="marketing" checked={agreements.marketing} onChange={handleAgreementChange} className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-300" /><label htmlFor="marketing" className="ml-2 block text-sm text-gray-900">(선택) 마케팅 정보 수신 동의</label></div>
                </div>
                
                {/* 저장하기 버튼 */}
                <div className="flex justify-center pt-4">
                    <button type="submit" disabled={!allRequiredAgreed || loading} className="w-48 py-3 bg-yellow-400 border border-black rounded-full font-bold text-lg hover:bg-yellow-300 transition disabled:bg-gray-300">
                        {loading ? '저장 중...' : '저장하기'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </form>
            <SignupSuccessModal 
                isOpen={isSuccessModalOpen} 
                onConfirm={handleSuccessConfirm}
                loginPoint={loginPoint}
                signUpPoint={signUpPoint}
            />
        </div>
    </div></>
  );
}
