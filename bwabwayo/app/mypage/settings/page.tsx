'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import Sidebar from '@/components/shop/Sidebar';
import { useMySettingStore } from '@/stores/mypage/mySettingStore';

// 회원가입 페이지와 동일한 UI/UX를 위한 아이콘 컴포넌트
const UserCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-400">
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BANK_LIST = [
    '기업은행', '국민은행', '우리은행', 'NH농협은행', '부산은행',
    '신한은행', '하나은행', '광주은행', '우체국', 'IM뱅크(대구은행)', '경남은행'
  ];

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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

      // 미리보기를 최종 S3 URL로 업데이트
      setProfileImagePreview(imageUrl);

    } catch (error) {
      console.error('프로필 이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      // 오류 발생 시, 원래 서버에 저장되어 있던 이미지로 되돌립니다.
      setProfileImagePreview(userData?.profileImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 기존 임시 URL이 있다면 메모리에서 해제
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }

    // 임시 URL로 즉시 미리보기 표시
    setProfileImagePreview(URL.createObjectURL(file));

    // S3에 업로드 시작
    await uploadProfileImage(file);

    // 다음 선택을 위해 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = () => {
    // 임시 URL이 있다면 메모리에서 해제
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    // 선택을 취소하고 원래 이미지로 되돌립니다.
    setProfileImagePreview(userData?.profileImage || null);
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    const accountInfoProvided = bankName.trim() || accountNumber.trim() || accountHolder.trim();
    const allAccountInfoProvided = bankName.trim() && accountNumber.trim() && accountHolder.trim();

    if (accountInfoProvided && !allAccountInfoProvided) {
      alert('계좌 정보를 모두 입력하거나 모두 비워주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 이미지는 '변경하기' 클릭 시점에 미리 업로드되었으므로,
      // 현재 profileImagePreview 상태에 있는 최종 URL을 사용합니다.
      const profileUpdateRequest = {
        nickname,
        bio: bio.trim() || '',
        bankName: bankName.trim() || null,
        accountNumber: accountNumber.trim() || null,
        accountHolder: accountHolder.trim() || null,
        profileImage: profileImagePreview,
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

  return (
    <div className="flex gap-10">
      <Sidebar />
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-8">내 정보 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-8 w-[800px] bg-white p-8 rounded-xl shadow-sm">
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="relative w-32 h-32">
              <div
                onClick={handleUploadClick}
                className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed hover:border-blue-500 transition-all"
              >
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
                <button type="button" onClick={handleDeleteImage} className="absolute -top-1 -right-1 bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors" aria-label="이미지 삭제">
                  <XCircleIcon />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">프로필 이미지 등록 (선택)</p>
          </div>

          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">상점 소개</label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="상점을 소개해주세요."
            />
          </div>

          {/* Account Info */}
          <div className="space-y-4 border-t pt-6">
            <label className="block text-sm font-medium text-gray-700">계좌 정보 (선택)</label>
            <p className="text-xs text-gray-500 -mt-2">계좌 정보를 입력하시려면 은행, 예금주명, 계좌번호를 모두 입력해주세요.</p>
            <div className="grid grid-cols-1 grid-cols-2 gap-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">은행</label>
                <select
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">은행 선택</option>
                  {BANK_LIST.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
                <input
                  type="text"
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="'-' 없이 숫자만 입력"
                />
              </div>
              <div>
                <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
                <input
                  type="text"
                  id="accountHolder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 홍길동"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || storeLoading}
            >
              {isSubmitting || storeLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}