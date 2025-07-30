import { create } from 'zustand';

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
    agreements: {
        terms: boolean;
        privacy: boolean;
        marketing: boolean;
    };
    loading: boolean;
    error: string | null;
    isSuccess: boolean;

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
    submitSignup: () => Promise<void>;
}

/**
 * 스토어의 초기 상태
 */
const initialState = {
    // --- 수정된 부분: 누락된 showOptionalFields 추가 ---
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
    agreements: {
        terms: false,
        privacy: false,
        marketing: false,
    },
    loading: false,
    error: null,
    isSuccess: false,
};

/**
 * 회원가입 스토어 생성
 */
export const useSignupStore = create<SignupState>((set, get) => ({
    ...initialState,

    // 액션 구현
    // --- 수정된 부분: 잘못된 타입 정의를 실제 함수 구현으로 변경 ---
    setShowOptionalFields: (show) => set({ showOptionalFields: show }),
    setProfileImage: (image) => set({ profileImage: image }),
    setNickname: (nickname) => set({ nickname }),
    setPhoneNumber: (phone) => set({ phoneNumber: phone }),
    setEmail: (email) => set({ email }),
    setAccountNumber: (accountNumber) => set({ accountNumber }),
    setBankName: (bankName) => set({ bankName }),
    setAccountHolder: (name) => set({ accountHolder: name }),
    setZipcode: (zipcode) => set({ zipcode }),
    setAddress: (address) => set({ address }),
    setAddressDetail: (detail) => set({ addressDetail: detail }),
    setRecipientName: (name) => set({ recipientName: name }),
    setRecipientPhoneNumber: (phone) => set({ recipientPhoneNumber: phone }),
    setAgreement: (name, checked) =>
        set((state) => ({
            agreements: { ...state.agreements, [name]: checked },
        })),
    reset: () => set(initialState),

   submitSignup: async () => {
    set({ loading: true, error: null, isSuccess: false });
    try {
        const {
            nickname,
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

        const payload = {
            nickname,
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
        };

        // 여기서 payload를 콘솔에 출력
        console.log('회원가입 요청 payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(`http://i13e202.p.ssafy.io:8081/oauth2/authorization/kakao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('회원가입에 실패했습니다.');
        }

        set({ loading: false, isSuccess: true });
        console.log('회원가입 성공!');
        
    } catch (error) {
        set({ 
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
            loading: false 
        });
    }
},
}));
