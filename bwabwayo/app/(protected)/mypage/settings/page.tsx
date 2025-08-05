'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import Sidebar from '@/components/shop/Sidebar';
import { useMyPageSettingStore } from '@/stores/mypage/mypageSettingStore';
import Image from 'next/image';

export default function SettingsPage() {
    const { userData, fetchUserData, updateUserProfile } = useMyPageSettingStore();

    // Form state
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial user data
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Populate form with user data once it's loaded
    useEffect(() => {
        if (userData) {
            setNickname(userData.nickname || '');
            setBio(userData.bio || '');
            setBankName(userData.bankName || '');
            setAccountNumber(userData.accountNumber || '');
            setAccountHolder(userData.accountHolder || '');
            setProfileImagePreview(userData.profileImage);
        }
    }, [userData]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validation
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const accountInfoProvided = bankName.trim() || accountNumber.trim() || accountHolder.trim();
        const allAccountInfoProvided = bankName.trim() && accountNumber.trim() && accountHolder.trim();

        if (accountInfoProvided && !allAccountInfoProvided) {
            alert('계좌 정보를 모두 입력하거나 모두 비워주세요.');
            return;
        }

        const formData = new FormData();
        const profileUpdateRequest = {
            nickname,
            // bio,
            bankName: bankName.trim() ? bankName : null,
            accountNumber: accountNumber.trim() ? accountNumber : null,
            accountHolder: accountHolder.trim() ? accountHolder : null,
        };

        formData.append(
            'profileUpdateRequest',
            new Blob([JSON.stringify(profileUpdateRequest)], { type: 'application/json' })
        );

        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            // `useMyPageStore`에 `updateUserProfile` 액션이 구현되어 있어야 합니다.
            await updateUserProfile(formData);
            alert('프로필이 성공적으로 업데이트되었습니다.');
            fetchUserData(); // 최신 정보 다시 불러오기
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            alert('프로필 업데이트에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userData) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
    }

    return (
        <div className="flex gap-10">
            <Sidebar />
            <main className="flex-1">
                <h1 className="text-3xl font-bold mb-8">내 정보 수정</h1>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white p-8 rounded-xl shadow-sm">
                    {/* Profile Image Section */}
                    <div className="flex items-center gap-6">
                        <Image
                            src={profileImagePreview || '/image/sample.png'}
                            alt="프로필 이미지"
                            width={100}
                            height={100}
                            className="w-24 h-24 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
                            >
                                이미지 변경
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500">최대 10MB의 JPG, PNG, GIF 파일</p>
                        </div>
                    </div>

                    {/* Nickname */}
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                        <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                    </div>

                    {/* Bio */}
                    {/* <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">상점 소개</label>
                        <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="상점을 소개해주세요." />
                    </div> */}

                    {/* Account Info */}
                    <div className="space-y-4 p-6 border border-gray-200 rounded-xl bg-gray-50">
                        <h2 className="text-lg font-semibold">계좌 정보</h2>
                        <p className="text-sm text-gray-500">계좌 정보는 거래 시 상대방에게만 공개됩니다.</p>
                        <div>
                            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">은행명</label>
                            <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="예: 신한은행" />
                        </div>
                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">계좌번호</label>
                            <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="'-' 없이 숫자만 입력" />
                        </div>
                        <div>
                            <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-2">예금주</label>
                            <input type="text" id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="예: 홍길동" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '저장하는 중...' : '저장하기'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}