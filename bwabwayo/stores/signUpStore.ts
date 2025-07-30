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
        // 1. URL에서 accessToken, id, email, profileImage 추출
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken') ?? '';
        const id = urlParams.get('id') ?? '';
        const emailFromUrl = urlParams.get('email') ?? '';
        const profileImageFromUrl = urlParams.get('profileImage') ?? '';
         if (emailFromUrl && !get().email) {
            set({ email: emailFromUrl });
        }

        console.log('보내는 accessToken:', accessToken);

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
            // profileImage, // 상태값 profileImage는 사용하지 않고 URL에서 추출한 값 사용
        } = get();

        const payload = {
            id,
            email: emailFromUrl,
            profileImage: profileImageFromUrl,
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
        };

        console.log('회원가입 요청 payload:', JSON.stringify(payload, null, 2));

        // 2. fetch 요청 시 accessToken을 헤더에 추가
        const response = await fetch(`https://i13e202.p.ssafy.io/be/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('회원가입에 실패했습니다.');
        }

        set({ loading: false, isSuccess: true });
        console.log('회원가입 성공!');
        
        // 회원가입 성공 시 메인 페이지로 이동
        window.location.href = 'https://i13e202.p.ssafy.io/fe/';

    } catch (error) {
        set({ 
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
            loading: false 
        });
    }
},
}));
