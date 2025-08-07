// 파일 경로: app/signup/page.tsx
'use client';

import React, { useRef, ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter import
import { useSignupStore } from '@/stores/signUpStore'; // Zustand 스토어를 import 합니다.
import Script from 'next/script';
import {
    UserCircleIcon, PlusCircleIcon, MinusCircleIcon, XCircleIcon
} from '@/components/signup/Icons';

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

const BANK_LIST = [
    '기업은행', '국민은행', '우리은행', 'NH농협은행', '부산은행', 
    '신한은행', '하나은행', '광주은행', '우체국', 'IM뱅크(대구은행)', '경남은행'
];

// --- 회원가입 페이지 컴포넌트 ---
export default function SignUpPage() {
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
        setAgreement, submitSignup, reset, setSocialInfo
    } = useSignupStore();

    // --- 이미지 업로드 관련 로컬 상태 ---
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);


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

    // 이미지 업로드 박스 클릭
    const handleUploadClick = () => {
        if (isUploading) {
            alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
            return;
        }
        fileInputRef.current?.click();
    };

    // S3 업로드 함수
    const uploadProfileImage = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            // 실제 프로젝트의 프로필 업로드 API 엔드포인트로 수정해야 합니다.
            const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/profile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');

            const data = await response.json();
            const imageUrl = data.results[0]?.url; // API 응답 구조에 따라 URL 추출

            if (!imageUrl) throw new Error('업로드된 이미지 URL을 받지 못했습니다.');

            setProfileImage(imageUrl); // Zustand 스토어 업데이트
            setPreview(imageUrl);      // 미리보기를 최종 URL로 업데이트

        } catch (error) {
            console.error('프로필 이미지 업로드 오류:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
            setPreview(null); // 오류 발생 시 미리보기 제거
            setProfileImage(null); // 스토어 상태도 초기화
        } finally {
            setIsUploading(false);
        }
    };

    // 파일 선택 시 처리
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 기존 임시 URL이 있다면 해제
        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);

        const tempPreviewUrl = URL.createObjectURL(file);
        setPreview(tempPreviewUrl); // 임시 URL로 미리보기 먼저 표시

        await uploadProfileImage(file); // S3에 업로드

        if (fileInputRef.current) fileInputRef.current.value = ''; // input 초기화
    };

    // 이미지 삭제
    const handleDeleteImage = () => {
        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        setPreview(null);
        setProfileImage(null);
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
        await submitSignup();
    };

    useEffect(() => {
        if (isSuccess) {
            alert(
            '회원가입이 완료되었습니다!\n' +
            '환영합니다! 첫 가입 축하로 3,000포인트가 적립되었어요.\n' +
            '또한 로그인 보너스로 100포인트도 함께 지급되었습니다.'
            );

            reset();
            router.replace('/');
        }
    }, [isSuccess, reset, router]);

    const allRequiredAgreed = agreements.terms && agreements.privacy;

    return (
        <>
            <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

            <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
                <div className="w-full max-w-2xl">
                    <h1 className="text-3xl font-bold text-center mb-10">회원가입</h1>
                    
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
                            <div className="flex flex-col items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="relative w-32 h-32">
                                    <div
                                        onClick={handleUploadClick}
                                        className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed hover:border-blue-500 transition-all"
                                    >
                                        {preview ? (
                                            <img src={preview} alt="프로필 미리보기" className="object-cover" />
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
                                <p className="text-sm text-gray-500 mt-2">프로필 이미지 등록 (선택)</p>
                            </div>

                        <div className="w-full">
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
                                        <div className="grid grid-cols-1 grid-cols-1 gap-4">
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
                                                <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">예금주명</label>
                                                <input id="accountHolderName" type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
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
                                        <div className="grid grid-cols-1 grid-cols-1 gap-4">
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
                                                className="flex-[3] px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddressSearch}
                                                className="flex-[1] px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
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
)
}
