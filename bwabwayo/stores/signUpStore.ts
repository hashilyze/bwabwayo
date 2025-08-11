import { create } from 'zustand';
import api from '@/lib/api'; // API 요청을 위해 api 인스턴스를 사용합니다.

/**
 * 회원가입 폼의 상태와 액션을 정의하는 인터페이스
 */
interface SignupState {
    // 상태 (State)
    showOptionalFields: boolean;
    profileImage: string | null;
    nickname: string;
    phoneNumber: string;
    email: string;
    accountNumber: string;
    bankName: string;
    accountHolder: string;
    zipcode: string;
    address: string;
    addressDetail: string;
    recipientName: string;
    recipientPhoneNumber: string;
    agreements: { terms: boolean; privacy: boolean; marketing: boolean; };
    loading: boolean;
    error: string | null;
    isSuccess: boolean;
    // --- 추가된 부분: 소셜 로그인 임시 정보 ---
    socialAccessToken: string | null; // 회원가입 전 임시 토큰
    socialId: string | null; // 소셜 로그인 유저 ID
    loginPoint: number | null;
    signUpPoint: number | null;

    // 액션 (Actions)
    setShowOptionalFields: (show: boolean) => void;
    setProfileImage: (image: string | null) => void;
    setNickname: (nickname: string) => void;
    setPhoneNumber: (phone: string) => void;
    setEmail: (email: string) => void;
    setAccountNumber: (accountNumber: string) => void;
    setBankName: (bankName: string) => void;
    setAccountHolder: (name: string) => void;
    setZipcode: (zipcode: string) => void;
    setAddress: (address: string) => void;
    setAddressDetail: (detail: string) => void;
    setRecipientName: (name: string) => void;
    setRecipientPhoneNumber: (phone: string) => void;
    setAgreement: (name: keyof SignupState['agreements'], checked: boolean) => void;
    reset: () => void;
    submitSignup: () => Promise<boolean>;
    // --- 추가된 부분: 소셜 정보 저장을 위한 액션 ---
    setSocialInfo: (info: { token: string; id: string }) => void;
}

/**
 * 스토어의 초기 상태
 */
const initialState = {
    showOptionalFields: false,
    profileImage: null,
    nickname: '',
    phoneNumber: '',
    email: '',
    accountNumber: '',
    bankName: '',
    accountHolder: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    recipientName: '',
    recipientPhoneNumber: '',
    agreements: { terms: false, privacy: false, marketing: false },
    loading: false,
    error: null,
    isSuccess: false,
    socialAccessToken: null,
    socialId: null,
    loginPoint: null,
    signUpPoint: null,
};

/**
 * 회원가입 스토어 생성
 */
export const useSignupStore = create<SignupState>((set, get) => ({
    ...initialState,

    // 액션 구현
    setShowOptionalFields: (show) => set({ showOptionalFields: show }),
    setProfileImage: (image) => {
    console.log('스토어 setProfileImage:', image);
    set({ profileImage: image });
},
    setNickname: (nickname) => set({ nickname }),
    setPhoneNumber: (phone) => set({ phoneNumber: phone }),
   setEmail: (email) => {
    console.log('스토어 setEmail:', email);
    set({ email });
},
    setAccountNumber: (accountNumber) => set({ accountNumber }),
    setBankName: (bankName) => set({ bankName }),
    setAccountHolder: (name) => set({ accountHolder: name }),
    setZipcode: (zipcode) => set({ zipcode }),
    setAddress: (address) => set({ address }),
    setAddressDetail: (detail) => set({ addressDetail: detail }),
    setRecipientName: (name) => set({ recipientName: name }),
    setRecipientPhoneNumber: (phone) => set({ recipientPhoneNumber: phone }),
    setAgreement: (name, checked) =>
        set((state) => ({ agreements: { ...state.agreements, [name]: checked } })),
    reset: () => set(initialState),
    // --- 추가된 부분: 소셜 정보 저장 액션 구현 ---
   setSocialInfo: ({ token, id }) => {
    console.log('스토어 setSocialInfo:', { token, id });
    set({ socialAccessToken: token, socialId: id });
},

    submitSignup: async (): Promise<boolean> => {
        set({ loading: true, error: null, isSuccess: false });
        try {
            // --- 수정된 부분: URL 대신 스토어에서 소셜 정보 가져오기 ---
            const {
                socialAccessToken, 
                socialId,
                nickname,
                email,
                phoneNumber,
                accountNumber,
                accountHolder,
                bankName,
                recipientName,
                recipientPhoneNumber,
                zipcode,
                address,
                addressDetail,
                profileImage,
            } = get();

            if (!socialAccessToken || !socialId) {
                throw new Error('소셜 로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
            }

            if (!nickname.trim()) {
                throw new Error('닉네임을 입력해주세요.');
            }

            const payload = {
                id: socialId,
                email: email || null,
                profileImage: profileImage || null,
                nickname,
                phoneNumber: phoneNumber || null,
                accountNumber: accountNumber,
                accountHolder: accountHolder ,
                bankName: bankName,
                recipientName: recipientName || null,
                recipientPhoneNumber: recipientPhoneNumber || null,
                zipcode: zipcode || null,
                address: address || null,
                addressDetail: addressDetail || null,
            };

            console.log('회원가입 요청 payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(`https://i13e202.p.ssafy.io/be/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(socialAccessToken && { Authorization: `Bearer ${socialAccessToken}` }),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('회원가입 실패 응답 (서버 원문):', errorText);
            throw new Error(errorText || '회원가입에 실패했습니다.');
        }

        let responseData;
        try {
            responseData = await response.json();
            console.log('회원가입 성공 응답 (서버 원문):', responseData);
        } catch (jsonError) {
            console.error('JSON 파싱 에러:', jsonError);
            throw new Error('서버로부터 유효한 응답을 받지 못했습니다. (JSON 파싱 실패)');
        }

        const data = responseData.result || responseData;
        const { accessToken, loginPoint, signUpPoint } = data;

        if (!accessToken) {
            throw new Error('회원가입 응답이 올바르지 않습니다. (accessToken 누락)');
        }

        localStorage.setItem('accessToken', accessToken);
        set({ loading: false, isSuccess: true, loginPoint, signUpPoint });
        console.log('회원가입 및 로그인 성공!');
        return true;

    } catch (error) {
        set({ 
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
            loading: false 
        });
       return false;
    }
  },
}));
