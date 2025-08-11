'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useMySettingStore, ProfileData } from '@/stores/mypage/mySettingStore';

// 아이콘 컴포넌트
const UserCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6 text-gray-600 bg-white rounded-full">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);


export default function SettingsPage() {
  const { userData, fetchUserData, updateUserProfile, loading: storeLoading } = useMySettingStore();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageKey, setImageKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BANK_LIST = [
    '기업은행', '국민은행', '우리은행', 'NH농협은행', '부산은행',
    '신한은행', '하나은행', '광주은행', '우체국', 'IM뱅크(대구은행)', '경남은행'
  ];

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // userData가 변경될 때, 수정 폼의 초기값을 설정합니다.
  // 계좌 정보는 수정 시 새로 입력받으므로 빈 값으로 둡니다.
  useEffect(() => {
    if (userData) {
      setNickname(userData.nickname || '');
      setBio(userData.bio || '');
      setProfileImagePreview(userData.profileImage);
      // 수정 필드는 비워둡니다.
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
    }
  }, [userData]);

  // --- 이미지 업로드 관련 핸들러 ---
  const handleUploadClick = () => {
    if (isUploading) return;
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
      const newImageKey = data.results[0]?.key;
      if (!imageUrl) throw new Error('업로드된 이미지 URL을 받지 못했습니다.');

      setProfileImagePreview(imageUrl);
      setImageKey(newImageKey);

    } catch (error) {
      console.error('프로필 이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      setProfileImagePreview(userData?.profileImage || null);
      setImageKey(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(URL.createObjectURL(file));
    await uploadProfileImage(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = () => {
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(userData?.profileImage || null);
    setImageKey(null);
  };

  // --- handleSubmit 함수 ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }
    
    // 계좌 정보는 3개 필드가 모두 채워져 있거나, 모두 비어있어야 합니다.
    const accountInfoProvided = bankName.trim() || accountNumber.trim() || accountHolder.trim();
    const allAccountInfoProvided = bankName.trim() && accountNumber.trim() && accountHolder.trim();

    if (accountInfoProvided && !allAccountInfoProvided) {
      alert('계좌 정보를 수정하시려면 은행, 계좌번호, 예금주를 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const imageChanged = profileImagePreview !== userData?.profileImage;
      
      const profileUpdateRequest: ProfileData = {
        nickname: nickname.trim(),
        bio: bio.trim(),
        // 사용자가 입력한 새 정보 또는 기존 정보를 전달
        bankName: allAccountInfoProvided ? bankName.trim() : userData?.bankName || '',
        accountNumber: allAccountInfoProvided ? accountNumber.trim() : userData?.accountNumber || '',
        accountHolder: allAccountInfoProvided ? accountHolder.trim() : userData?.accountHolder || '',
        profileImage: imageChanged ? imageKey : null,
      };

      await updateUserProfile(profileUpdateRequest);
      alert('프로필이 성공적으로 업데이트되었습니다.');
      fetchUserData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.';
      console.error('프로필 업데이트 실패:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  // --- JSX (UI) ---
  return (
    <div className="min-w-0">
        <h1 className="text-3xl font-bold mb-8">내 정보 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-8 w-[800px] bg-white p-8 rounded-xl shadow-sm">
          
          {/* Profile Image Section */}
          <div className="flex items-center gap-6">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            <div className="relative w-24 h-24 flex-shrink-0">
              <div onClick={handleUploadClick} className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed hover:border-yellow-400 transition-all">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="프로필 미리보기" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
               {profileImagePreview && !isUploading && (
                <button type="button" onClick={handleDeleteImage} className="absolute -top-1 -right-1" aria-label="이미지 삭제">
                  <XCircleIcon />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" className="px-5 py-2 bg-yellow-400 text-black font-bold rounded-full text-sm hover:bg-yellow-500 transition-colors" onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? '업로드 중...' : '이미지 변경'}
              </button>
              <p className="text-xs text-gray-500">최대 10MB의 JPG, PNG, GIF파일</p>
            </div>
          </div>

          {/* Nickname & Bio */}
          <div className="space-y-4">
             <div>
                <label htmlFor="nickname" className="block text-lg font-bold mb-2 text-gray-800">닉네임</label>
                <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" required />
             </div>
             <div>
                <label htmlFor="bio" className="block text-lg font-bold mb-2 text-gray-800">상점 소개</label>
                <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" placeholder="상점을 소개해주세요." />
             </div>
          </div>

          <hr className="border-gray-200" />

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">계좌 정보</h3>
            {/* 현재 등록된 계좌 정보 (표시용) */}
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg flex items-center text-sm">
                <span className="text-gray-500 w-24 flex-shrink-0">{userData.bankName || '등록된 은행 없음'}</span>
                <span className="text-gray-800">{userData.accountNumber ? `${userData.accountNumber.slice(0, 4)}********` : '등록된 계좌 없음'}</span>
            </div>
            <p className="text-xs text-gray-500">계좌 정보를 수정하시려면 아래 모든 항목을 입력해주세요.</p>
            {/* 계좌 정보 수정 입력 필드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="md:col-span-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
                <option value="">은행 선택</option>
                {BANK_LIST.map(bank => (<option key={bank} value={bank}>{bank}</option>))}
              </select>
              <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" placeholder="계좌번호 ('-' 없이 숫자만 입력)" />
              <input type="text" id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="md:col-span-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" placeholder="예금주 (예: 홍길동)" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button type="submit" className="w-48 py-3 bg-yellow-400 text-black rounded-full font-bold text-base hover:bg-yellow-500 transition disabled:bg-gray-400" disabled={isSubmitting || storeLoading}>
              {isSubmitting || storeLoading ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
    </div>
  );
}
