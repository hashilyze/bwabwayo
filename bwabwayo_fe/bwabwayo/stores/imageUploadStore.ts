import { create } from 'zustand';
import { ChangeEvent } from 'react';

interface ImageUploadStore {
  imgFiles: File[];
  imgPreviews: string[];
  uploadedImageUrls: string[];
  isUploading: boolean;
  showAlert: boolean;
  
  // 액션들
  setImgFiles: (files: File[]) => void;
  setImgPreviews: (previews: string[]) => void;
  setUploadedImageUrls: (urls: string[]) => void;
  setIsUploading: (uploading: boolean) => void;
  setShowAlert: (show: boolean) => void;
  
  // 이미지 업로드 관련 함수들
  handleUploadClick: (maxFiles?: number) => boolean;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>, maxFiles?: number) => Promise<void>;
  uploadToS3: (files: File[]) => Promise<void>;
  handleDeleteImage: (index: number) => void;
  resetImages: () => void;
}

export const useImageUploadStore = create<ImageUploadStore>((set, get) => ({
  imgFiles: [],
  imgPreviews: [],
  uploadedImageUrls: [],
  isUploading: false,
  showAlert: false,

  setImgFiles: (files) => set({ imgFiles: files }),
  setImgPreviews: (previews) => set({ imgPreviews: previews }),
  setUploadedImageUrls: (urls) => set({ uploadedImageUrls: urls }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  setShowAlert: (show) => set({ showAlert: show }),

  handleUploadClick: (maxFiles = 10) => {
    const { imgFiles, isUploading, setShowAlert } = get();
    
    if (imgFiles.length >= maxFiles) {
      setShowAlert(true);
      return false;
    }
    
    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
      return false;
    }
    
    return true; // 클릭 가능함을 나타냄
  },

  handleFileChange: async (event, maxFiles = 10) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const { imgFiles, setImgFiles, uploadToS3 } = get();

    // 파일 개수 제한 확인
    if (imgFiles.length + fileArray.length > maxFiles) {
      get().setShowAlert(true);
      return;
    }

    // 파일 정보를 먼저 저장
    setImgFiles([...imgFiles, ...fileArray]);

    try {
      // S3에 업로드 (성공 시 미리보기 URL 업데이트됨)
      await uploadToS3(fileArray);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      // 오류 발생 시 추가된 파일 정보 제거
      setImgFiles(imgFiles.slice(0, imgFiles.length - fileArray.length));
    }

    // input 초기화
    if (event.target) {
      event.target.value = '';
    }
  },

  uploadToS3: async (files: File[]) => {
    const { setImgPreviews, setUploadedImageUrls, setIsUploading, setImgFiles, imgFiles } = get();
    
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/product', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('S3 업로드 성공:', data);

      // S3에서 받아온 key값들을 바로 images에 저장
      const imageKeys = data.results.map((item: any) => item.key);
      const imageUrls = data.results.map((item: any) => item.url);

      setImgPreviews([...get().imgPreviews, ...imageUrls]);
      setUploadedImageUrls([...get().uploadedImageUrls, ...imageKeys]);

    } catch (error) {
      setImgFiles(imgFiles.slice(0, imgFiles.length - files.length));
      console.error('S3 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  },

  handleDeleteImage: (index: number) => {
    const { setImgFiles, setImgPreviews, setUploadedImageUrls, imgFiles, imgPreviews, uploadedImageUrls } = get();
    
    // 상태에서 제거 (S3 URL이므로 메모리 해제 불필요)
    setImgFiles(imgFiles.filter((_, i) => i !== index));
    setImgPreviews(imgPreviews.filter((_, i) => i !== index));
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  },

  resetImages: () => {
    set({
      imgFiles: [],
      imgPreviews: [],
      uploadedImageUrls: [],
      isUploading: false,
      showAlert: false
    });
  }
}));