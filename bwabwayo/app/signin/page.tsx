// 파일 경로: app/signup/page.tsx (예시)
'use client';

import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
// Daum 우편번호 서비스를 위해 Next.js의 Script 컴포넌트를 사용합니다.
import Script from 'next/script';

// --- 타입 정의 ---
// 1. Daum 우편번호 API에서 반환하는 데이터 타입을 명확하게 정의하여 'any' 타입 사용을 방지합니다.
interface DaumPostcodeData {
    address: string;
    addressType: 'R' | 'J';
    bname: string;
    buildingName: string;
    zonecode: string;
}

// Daum 우편번호 서비스는 window.daum 객체를 사용하므로,
// 타입스크립트에서 이를 인식할 수 있도록 window 객체를 확장합니다.
declare global {
  interface Window {
    daum: any;
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


// --- 회원가입 페이지 컴포넌트 ---
export default function SignUpPage() {
    // --- 상태 관리 ---
    const [showOptionalFields, setShowOptionalFields] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        marketing: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                oncomplete: function(data: DaumPostcodeData) { // 'any' 대신 정의된 타입을 사용합니다.
                    let fullAddress = data.address;
                    let extraAddress = '';

                    if (data.addressType === 'R') {
                        if (data.bname !== '') {
                            extraAddress += data.bname;
                        }
                        if (data.buildingName !== '') {
                            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                        }
                        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                    }
                    setAddress(fullAddress);
                }
            }).open();
        }
    };
    
    const handleAgreementChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setAgreements(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!agreements.terms || !agreements.privacy) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        // 3. 최종적으로 서버에 보낼 데이터에서 약관 동의 현황을 제외합니다.
        const formData = {
            profileImage,
            nickname,
            phone,
            email,
            address,
            addressDetail,
        };
        console.log('--- 회원가입 데이터 ---', formData);
        alert('회원가입 데이터가 콘솔에 출력되었습니다.');
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

                        <div className="border-t pt-8 min-h-[340px]">
                            {showOptionalFields ? (
                                <div className="space-y-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰 번호 (선택)</label>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 (선택)</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">주소 (선택)</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={address} readOnly placeholder="주소를 검색해주세요" className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100" />
                                            <button type="button" onClick={handleAddressSearch} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">주소 검색</button>
                                        </div>
                                        <input type="text" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} placeholder="상세주소" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <button type="button" onClick={() => setShowOptionalFields(false)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                        <MinusCircleIcon />
                                        <span>추가 정보 닫기</span>
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {/* 2. 추가 정보 입력 버튼 위에 안내 문구를 추가합니다. */}
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

                        <button type="submit" disabled={!allRequiredAgreed} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                            가입하기
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
