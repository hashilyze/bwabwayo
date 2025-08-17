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
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
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
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
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
    <div className="flex flex-col gap-10">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-black">내 정보 수정</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-15">
        {/* 프로필 이미지 섹션 */}
        <div className="flex items-center gap-8">
          {/* 프로필 이미지 */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="w-[115px] h-[115px] rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
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
              <button 
                type="button" 
                onClick={handleDeleteImage} 
                className="absolute -top-1 -right-1 bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors" 
                aria-label="이미지 삭제"
              >
                <XCircleIcon />
              </button>
            )}
          </div>
          
          {/* 이미지 변경 버튼과 설명 */}
          <div className="flex flex-col gap-2">
            <button 
              type="button" 
              className="px-6 py-3 bg-yellow-300 border border-black rounded-[30px] font-bold text-lg hover:bg-yellow-200 transition-colors" 
              onClick={handleUploadClick} 
              disabled={isUploading}
            >
              {isUploading ? '업로드 중...' : '이미지 변경'}
            </button>
            <p className="text-sm text-gray-500">최대 10MB의 JPG, PNG, GIF파일</p>
          </div>
        </div>

        {/* 구분선 */}
        {/* <div className="w-full h-[1px] bg-gray-200"></div> */}

        {/* 닉네임 행 */}
        <div className="flex items-center">
          <label className="text-xl font-bold text-black w-[80px] mr-10">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            className="flex-1 max-w-[258px] px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* 상점 소개 */}
        <div className="flex items-start">
          <label className="text-xl font-bold text-black w-[80px] pt-2 mr-10">상점 소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex-1 max-w-lg h-24 px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"

            placeholder="가게에 대한 설명을 적어주세요."
          />
        </div>

        {/* 이메일 */}
        <div className="flex items-center">
          <label className="text-xl font-bold text-black w-[80px] mr-10">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 max-w-[258px] px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"
            placeholder="이메일"

          />
        </div>

        {/* 전화번호 */}
        <div className="flex items-center">
          <label className="text-xl font-bold text-black w-[80px] mr-10">전화번호</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="flex-1 max-w-[258px] px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"
            maxLength={11}
            placeholder="전화번호"
          />
        </div>

        {/* 계좌번호 행 */}
        <div className="flex items-start">
          <label className="text-xl font-bold text-black w-[80px] pt-2 mr-10">계좌번호</label>
        
          <div className="flex-1 pt-2">
            {/* 등록된 계좌 정보 표시 */}
            <p className="text-md font-bold text-black mb-2">등록된 계좌 번호</p>
            {userData.bankName && userData.accountNumber && (
              <div className="bg-gray-50 rounded p-4 mb-6">
                <div className="bg-gray-50 rounded">
                  <div className="flex gap-4 text-md">
                    <span>{userData.bankName}</span>
                    <span>{userData.accountNumber?.replace(/\d(?=\d{4})/g, '*')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 새로운 계좌 정보 입력 */}
            <div className="flex gap-4 max-w-[700px]">
              <div className="flex-1">
                <label className="block font-bold text-black mb-2">예금주</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={handleAccountHolderChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"
                  placeholder="예금주"
                />
              </div>
              <div className="flex-1">
                <label className="block font-bold text-black mb-2">은행</label>
                <div className="relative">
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500 bg-white appearance-none pr-8"
                  >
                    <option value="">은행선택</option>
                    {BANK_LIST.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 border-r-2 border-b-2 border-gray-400 rotate-45"></div>
                </div>
              </div>
              <div className="flex-2">
                <label className="block font-bold text-black mb-2">계좌번호</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[20px] focus:outline-none focus:border-blue-500"
                  placeholder="계좌번호"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 저장하기 버튼 */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            className="px-10 py-2 bg-[#FFAE00] border border-black rounded-[30px] font-semibold text-lg hover:bg-orange-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting || storeLoading}
          >
            {isSubmitting || storeLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

    </div>
  );
}
