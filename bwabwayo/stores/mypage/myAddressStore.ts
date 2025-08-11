import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// ERD를 기반으로 한 배송지 데이터 타입 정의
export interface Address {
  id: number;
  recipientName: string;
  recipientPhoneNumber: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  isDefault?: boolean; // ERD에는 없지만, UI에서 기본 배송지 표기를 위해 클라이언트에서 관리
}

// 스토어의 상태(state)와 액션(actions) 타입 정의
interface AddressStoreState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (newAddress: Omit<Address, 'id' | 'isDefault'>) => Promise<void>;
  updateAddress: (updatedAddress: Address) => Promise<void>;
  deleteAddress: (addressId: number) => Promise<void>;
  setDefaultAddress: (addressId: number) => Promise<void>;
}
const baseUrl = 'https://i13e202.p.ssafy.io/be/api';


// Zustand 스토어 생성
export const useMyAddressStore = create<AddressStoreState>((set, get) => ({
  // 초기 상태
  addresses: [],
  loading: false,
  error: null,

  // --- 액션(Actions) ---

  // API로부터 배송지 목록을 가져오는 액션
  fetchAddresses: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/addresses`;
    console.log(`[주소] 배송지 목록 요청: GET ${requestUrl}`);
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data = await response.json();
      console.log('📦 [주소] API 원본 응답:', data); // API 원본 응답을 콘솔에 출력

      if (!response.ok) {
        throw new Error(data.message || '배송지 목록을 불러오는데 실패했습니다.');
      }

      // API 응답이 snake_case일 경우를 대비하여 camelCase로 변환합니다.
      const transformedData = data.map((addr: any) => ({
        id: addr.id,
        recipientName: addr.recipientName,
        recipientPhoneNumber: addr.recipientPhoneNumber,
        zipcode: addr.zipcode,
        address: addr.address,
        addressDetail: addr.addressDetail,
        isDefault: addr.isDefault,
      }));

      console.log('✅ [주소] 배송지 목록:', transformedData);
      set({ addresses: transformedData, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '배송지 정보를 불러오는 데 실패했습니다.';
      console.error('🔥 [주소] 배송지 목록 요청 실패:', error);
      set({ error: errorMessage, loading: false });
    }
  },

  // 새 배송지를 추가하는 액션
  addAddress: async newAddress => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/addresses`;
    console.log(`[주소] 새 배송지 추가 요청: POST ${requestUrl}`, newAddress);
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '배송지 추가에 실패했습니다.');
      }

      console.log('✅ [주소] 새 배송지 추가 성공');
      // 성공 시, 목록을 다시 불러와 최신 상태를 반영
      await get().fetchAddresses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '배송지 추가 중 오류가 발생했습니다.';
      console.error('🔥 [주소] 새 배송지 추가 실패:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 기존 배송지를 수정하는 액션
  updateAddress: async updatedAddress => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/addresses/${updatedAddress.id}`;
    console.log(`[주소] 배송지 수정 요청: PUT ${requestUrl}`, updatedAddress);
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAddress),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '배송지 수정에 실패했습니다.');
      }

      console.log('✅ [주소] 배송지 수정 성공');
      await get().fetchAddresses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '배송지 수정 중 오류가 발생했습니다.';
      console.error('🔥 [주소] 배송지 수정 실패:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 배송지를 삭제하는 액션
  deleteAddress: async addressId => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/addresses/${addressId}`;
    console.log(`[주소] 배송지 삭제 요청: DELETE ${requestUrl}`);
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '배송지 삭제에 실패했습니다.');
      }

      console.log('✅ [주소] 배송지 삭제 성공');
      await get().fetchAddresses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '배송지 삭제 중 오류가 발생했습니다.';
      console.error('🔥 [주소] 배송지 삭제 실패:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 기본 배송지로 설정하는 액션
  setDefaultAddress: async addressId => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/addresses/${addressId}/default`;
    console.log(`[주소] 기본 배송지 설정 요청: PATCH ${requestUrl}`);
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '기본 배송지 설정에 실패했습니다.');
      }

      console.log('✅ [주소] 기본 배송지 설정 성공');
      await get().fetchAddresses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '기본 배송지 설정 중 오류가 발생했습니다.';
      console.error('🔥 [주소] 기본 배송지 설정 실패:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
