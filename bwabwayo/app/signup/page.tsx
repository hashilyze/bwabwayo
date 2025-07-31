// 파일 경로: app/signup/page.tsx
'use client';

import React, { useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useRouter import
import { useSignupStore } from '@/stores/signUpStore'; // Zustand 스토어를 import 합니다.
import Script from 'next/script';

// --- 타입 정의 ---
interface DaumPostcodeData { 
    address: string;
    addressType: 'R' | 'J';
    bname: string;
    buildingName: string;
    zonecode: string;
}

declare global {
  interface Window {
    daum: {
        Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}

// --- 아이콘 컴포넌트 ---
const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const MinusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BANK_LIST = [
    '기업은행', '국민은행', '우리은행', 'NH농협은행', '부산은행', 
    '신한은행', '하나은행', '광주은행', '우체국', 'IM뱅크(대구은행)', '경남은행'
];

// --- 회원가입 페이지 컴포넌트 ---
export default function SignUpPage({ searchParams }: { searchParams?: { email?: string; profileImage?: string } }) {
    // --- Zustand 스토어에서 상태와 액션을 모두 가져옵니다. ---
    const {
        // 상태 (State)
        showOptionalFields, profileImage, nickname, phoneNumber, email,
        accountNumber, bankName, accountHolder, address, addressDetail, zipcode,
        recipientName, recipientPhoneNumber, agreements, loading, error, isSuccess,
        // 액션 (Actions)
        setShowOptionalFields, setProfileImage, setNickname, setPhoneNumber, setEmail,
        setAccountNumber, setBankName, setAccountHolder, setAddress,
        setAddressDetail, setZipcode, setRecipientName, setRecipientPhoneNumber,
        setAgreement, submitSignup, reset
    } = useSignupStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter(); // useRouter 훅 사용

    // 백에서 받은 email, profileImage가 있으면 초기값으로 세팅
     useEffect(() => {
        if (searchParams?.email) setEmail(searchParams.email);
        if (searchParams?.profileImage) setProfileImage(searchParams.profileImage);
    }, [searchParams, setEmail, setProfileImage]);

    // --- 이벤트 핸들러 ---
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddressSearch = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function(data: DaumPostcodeData) {
                    let fullAddress = data.address;
                    let extraAddress = '';

                    if (data.addressType === 'R') {
                        if (data.bname !== '') extraAddress += data.bname;
                        if (data.buildingName !== '') {
                            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                        }
                        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                    }
                    // 스토어의 액션을 호출하여 주소와 우편번호를 업데이트합니다.
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
        if (!agreements.terms || !agreements.privacy) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        // 선택 정보 그룹 유효성 검사 헬퍼 함수
        const validateOptionalGroup = (fields: string[], groupName: string): boolean => {
            const filledFields = fields.filter(field => field.trim() !== '');
            // 일부만 입력된 경우
            if (filledFields.length > 0 && filledFields.length < fields.length) {
                alert(`${groupName} 정보를 모두 입력해야 합니다.`);
                return false;
            }
            return true;
        };

        // 배송지 정보 유효성 검사
        const deliveryFields = [recipientName, recipientPhoneNumber, zipcode, address, addressDetail];
        if (!validateOptionalGroup(deliveryFields, '배송지')) {
            return;
        }

        // 계좌 정보 유효성 검사
        const accountFields = [accountNumber, accountHolder, bankName];
        if (!validateOptionalGroup(accountFields, '계좌')) {
            return;
        }

        // 스토어에 있는 submitSignup 액션을 호출합니다.
        const isSuccess = await submitSignup();

        // 성공적으로 완료되면 알림을 띄우고 메인 페이지로 이동합니다.
        if (isSuccess) {
            alert('회원가입에 성공했습니다!');
            reset(); // 스토어 상태 초기화
            router.replace('/'); // 메인 페이지로 이동
        }
    };

    const allRequiredAgreed = agreements.terms && agreements.privacy;

   return (
    <>
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

        <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-10">회원가입</h1>
                
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
                    <div className="flex flex-col items-center">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed hover:border-blue-500">
                            {profileImage ? (
                                <img src={profileImage} alt="프로필 미리보기" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon />
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">프로필 이미지 등록 (선택)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                    </div>

                    <div className="border-t pt-8 min-h-[580px]">
                        {showOptionalFields ? (
                            <div className="space-y-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰 번호 (선택)</label>
                                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 (선택)</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t pt-6">
                                    <label className="block text-sm font-medium text-gray-700">계좌 정보 (선택)</label>
                                    <p className="text-xs text-gray-500 -mt-2">계좌 정보를 입력하시려면 은행, 예금주명, 계좌번호를 모두 입력해주세요.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">은행</label>
                                            <select id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                                                <option value="">은행 선택</option>
                                                {BANK_LIST.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">예금주명</label>
                                            <input id="accountHolder" type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
                                        <input 
                                            id="accountNumber"
                                            type="text" 
                                            value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                                            placeholder="'-' 없이 숫자만 입력" 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">배송지 정보 (선택)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">배송지 이름</label>
                                            <input
                                                id="recipientName"
                                                type="text"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                placeholder="받는 분 이름"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="recipientPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">배송지 전화번호</label>
                                            <input
                                                id="recipientPhoneNumber"
                                                type="tel"
                                                value={recipientPhoneNumber}
                                                onChange={(e) => setRecipientPhoneNumber(e.target.value)}
                                                placeholder="받는 분 전화번호"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    {/* 주소 입력 폼 */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">주소 (선택)</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={zipcode}
                                                readOnly
                                                placeholder="우편번호"
                                                className="w-32 px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddressSearch}
                                                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={address}
                                            readOnly
                                            placeholder="주소"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 mb-2"
                                        />
                                        <input
                                            type="text"
                                            value={addressDetail}
                                            onChange={(e) => setAddressDetail(e.target.value)}
                                            placeholder="상세주소"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setShowOptionalFields(false)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                    <MinusCircleIcon />
                                    <span>추가 정보 닫기</span>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-center text-sm text-gray-500 mb-4">
                                    추가 정보 입력 시 알림톡 기능과 기본 배송지 등록이 가능합니다.
                                </p>
                                <button type="button" onClick={() => setShowOptionalFields(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                    <PlusCircleIcon />
                                    <span>추가 정보 입력 (선택)</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 border-t pt-6">
                        <div className="flex items-center"><input type="checkbox" id="terms" name="terms" checked={agreements.terms} onChange={handleAgreementChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="terms" className="ml-2 block text-sm text-gray-900">(필수) 이용약관 동의</label></div>
                        <div className="flex items-center"><input type="checkbox" id="privacy" name="privacy" checked={agreements.privacy} onChange={handleAgreementChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">(필수) 개인정보 수집 및 이용 동의</label></div>
                        <div className="flex items-center"><input type="checkbox" id="marketing" name="marketing" checked={agreements.marketing} onChange={handleAgreementChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="marketing" className="ml-2 block text-sm text-gray-900">(선택) 마케팅 정보 수신 동의</label></div>
                    </div>

                    <button type="submit" disabled={!allRequiredAgreed || loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                        {loading ? '가입 처리 중...' : '가입하기'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </form>
            </div>
        </div>
    </>
);
}