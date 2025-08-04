// components/cs-center/InquiryForm.tsx

'use client';

import React, { useState } from 'react';
// 문의사항 등록을 위해 Zustand 스토어에서 addInquiry 함수를 가져옵니다.
import { useInquiryStore } from '@/stores/cs-store/inquiryStore';

// 이 컴포넌트가 부모로부터 받을 props의 타입을 정의합니다.
interface InquiryFormProps {
  // '목록으로' 돌아가기 기능을 수행할 함수입니다.
  onBack: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ onBack }) => {
  // --- 상태 관리 (State Management) ---
  // 컴포넌트 내부에서 사용될 상태들을 useState로 관리합니다.
  const [title, setTitle] = useState(''); // 문의 제목
  const [description, setDescription] = useState(''); // 문의 내용
  const [category, setCategory] = useState('상품 문의'); // 문의 유형 (현재는 UI에서 주석 처리됨)
  const [image, setImage] = useState<File | null>(null); // 첨부된 이미지 파일

  // Zustand 스토어에서 addInquiry 액션(함수)만 가져옵니다.
  const { addInquiry } = useInquiryStore();

  // '문의 등록' 버튼 클릭 시 실행되는 폼 제출 핸들러입니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작을 막습니다.

    // TODO: 실제 이미지 업로드 로직 구현이 필요한 부분입니다.
    // 1. 사용자가 선택한 이미지 파일(image)을 S3와 같은 서버에 업로드합니다.
    // 2. 업로드가 성공하면, 서버로부터 이미지의 고유 URL을 반환받습니다.
    let imageUrl = '';
    if (image) {
      // const uploadedUrl = await uploadImageFunction(image); // 실제 업로드 함수 호출 (예시)
      imageUrl = 'https://example.com/placeholder.jpg'; // 현재는 임시 URL을 사용합니다.
    }

    // Zustand 스토어의 addInquiry 함수에 전달할 데이터 객체를 생성합니다.
    // 프론트엔드 내부에서는 일관성을 위해 camelCase를 사용합니다.
    const inquiryData = {
      title,
      description,
      // 이미지가 있는 경우에만 images 배열에 URL을 담아 전달합니다.
      images: imageUrl ? [{ imageUrl: imageUrl, order: 1 }] : [],
    };

    // 스토어의 addInquiry 액션을 호출하여 서버에 데이터를 전송합니다.
    // snake_case로의 변환은 이 addInquiry 함수 내부(스토어)에서 이루어지는 것이 가장 이상적입니다.
    await addInquiry(inquiryData);

    alert('문의가 접수되었습니다.');
    // 문의 등록이 완료되면, 부모로부터 받은 onBack 함수를 호출하여 목록 화면으로 돌아갑니다.
    onBack();
  };

  // 이미지 파일이 선택되었을 때 실행되는 핸들러입니다.
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 사용자가 선택한 파일이 있는지 확인합니다.
    if (e.target.files && e.target.files[0]) {
      // 선택된 첫 번째 파일을 image 상태에 저장합니다.
      setImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 문의 유형 선택 드롭다운 (현재는 주석 처리됨) */}
      {/* <div> ... </div> */}

      {/* 제목 입력 필드 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          제목
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required // 필수 입력 항목으로 지정합니다.
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="제목을 입력하세요."
        />
      </div>

      {/* 문의 내용 입력 필드 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          문의 내용
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required // 필수 입력 항목으로 지정합니다.
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="문의하실 내용을 자세하게 적어주세요."
        />
      </div>

      {/* 이미지 첨부 필드 */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          이미지 첨부 (선택)
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            name="image_url"
            id="image_url"
            onChange={handleImageChange}
            accept="image/*" // 이미지 파일만 선택 가능하도록 제한합니다.
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {/* 이미지가 선택되면 파일 이름을 보여줍니다. */}
        {image && <p className="mt-2 text-sm text-gray-500">선택된 파일: {image.name}</p>}
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end space-x-4">
        {/* '목록으로' 버튼: 클릭 시 onBack 함수를 호출합니다. */}
        <button
          type="button" // 폼 제출을 방지하기 위해 type="button"으로 설정합니다.
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          목록으로
        </button>
        {/* '문의 등록' 버튼: 클릭 시 폼을 제출(submit)합니다. */}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          문의 등록
        </button>
      </div>
    </form>
  );
};

export default InquiryForm;
