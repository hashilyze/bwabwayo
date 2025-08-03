'use client';

import React, { useState } from 'react';

interface ReportFormProps {
  onBack: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('부적절한 상품');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 폼 데이터를 API로 전송하는 로직을 구현해야 합니다.
    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
      // `order`는 이미지 업로드 순서를 의미합니다. 단일 이미지이므로 1로 설정합니다.
      formData.append('order', '1');
    }

    console.log('Submitting report:', {
      category,
      title,
      description,
      imageName: image?.name,
    });

    // 데모용으로 alert를 띄우고 목록으로 돌아갑니다.
    alert('신고가 접수되었습니다.');
    onBack();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          신고 유형
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option>부적절한 상품</option>
          <option>사용자 신고</option>
          <option>거래/사기 신고</option>
          <option>기타 신고</option>
        </select>
      </div>

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
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="제목을 입력하세요."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          신고 내용
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="신고하실 내용을 자세하게 적어주세요."
        />
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          증빙 이미지 첨부 (선택)
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            name="image_url"
            id="image_url"
            onChange={handleImageChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {image && <p className="mt-2 text-sm text-gray-500">선택된 파일: {image.name}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          목록으로
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          신고 등록
        </button>
      </div>
    </form>
  );
};

export default ReportForm;

