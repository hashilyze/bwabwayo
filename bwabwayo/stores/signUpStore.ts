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
    submitSignup: () => Promise<boolean>;
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

  submitSignup: async (): Promise<boolean> => {
    set({ loading: true, error: null, isSuccess: false });
    try {
        // 1. URL에서 accessToken, id, email, profileImage 추출
        const urlParams = new URLSearchParams(window.location.search);
        const socialAccessToken = urlParams.get('accessToken'); // URL에서 받은 소셜 로그인 토큰
        const id = urlParams.get('id');
        const emailFromUrl = urlParams.get('email') ?? '';
        const profileImageFromUrl = urlParams.get('profileImage') ?? '';

        // --- 개선된 부분: 필수 파라미터 검증 ---
        if (!socialAccessToken || !id) {
            throw new Error('소셜 로그인 정보(토큰 또는 ID)가 유효하지 않습니다. 다시 로그인해주세요.');
        }

        console.log('보내는 accessToken:', socialAccessToken);

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
            profileImage, // 상태값 profileImage는 사용하지 않고 URL에서 추출한 값 사용
        } = get();

        // --- 개선된 부분: 필수 입력값 검증 ---
        if (!nickname.trim()) {
            throw new Error('닉네임을 입력해주세요.');
        }

        // --- 개선된 부분: 빈 문자열("") 대신 null을 보내도록 수정 ---
        // 서버 API 명세에 따라 빈 값은 null로 처리하는 것이 더 안전할 수 있습니다.
        const payload = {
            id,
            email: emailFromUrl || null,
            profileImage: profileImageFromUrl || null,
            nickname,
            phoneNumber: phoneNumber || null,
            accountNumber: accountNumber || null,
            accountHolder: accountHolder || null,
            bankName: bankName || null,
            recipientName: recipientName || null,
            recipientPhoneNumber: recipientPhoneNumber || null,
            zipcode: zipcode || null,
            address: address || null,
            addressDetail: addressDetail || null,
        };

        console.log('회원가입 요청 payload:', JSON.stringify(payload, null, 2));

        // 2. fetch 요청 시 accessToken을 헤더에 추가
        const response = await fetch(`https://i13e202.p.ssafy.io/be/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(socialAccessToken && { Authorization: `Bearer ${socialAccessToken}` }),
            },
            body: JSON.stringify(payload),
        });

        // --- 개선된 부분: 서버 에러 응답을 안전하게 처리 ---
        // response.ok가 false일 때 (e.g., 4xx, 5xx 에러) 서버가 JSON이 아닌 텍스트/HTML을 보낼 수 있습니다.
        // 따라서 .json()을 호출하기 전에 먼저 상태를 확인합니다.
        if (!response.ok) {
            // 응답 본문을 JSON이 아닌 텍스트로 먼저 읽어 에러 원인을 확인합니다.
            const errorText = await response.text();
            console.error('회원가입 실패 응답 (서버 원문):', errorText);
            // 서버가 보낸 텍스트("SQL 오류")를 에러 메시지로 사용합니다.
            throw new Error(errorText || '회원가입에 실패했습니다.');
        }

        // 요청이 성공한 경우에만 응답을 JSON으로 파싱합니다.
        let responseData;
        try {
            responseData = await response.json();
            console.log('회원가입 성공 응답 (서버 원문):', responseData);
        } catch (jsonError) {
            // 서버가 200 OK는 보냈지만, 응답 본문이 비어있거나 유효한 JSON이 아닌 경우
            console.error('JSON 파싱 에러:', jsonError);
            throw new Error('서버로부터 유효한 응답을 받지 못했습니다. (JSON 파싱 실패)');
        }



        // --- 개선된 부분: 성공 응답 처리 ---
        // 3. 응답 데이터에서 토큰과 유저 정보를 추출합니다.
        // 백엔드 응답 구조에 따라 'result' 객체 안에 데이터가 있을 수도 있고, 루트에 바로 있을 수도 있습니다.
        // 'responseData.result'가 있으면 그것을 사용하고, 없으면 'responseData' 자체를 사용합니다.
        const data = responseData.result || responseData;
        const { accessToken } = data; // 서버에서 발급받은 새로운 서비스 accessToken

        if (!accessToken) {
            throw new Error('회원가입 응답이 올바르지 않습니다. (accessToken 누락)');
        }

        // 4. 토큰을 localStorage에 저장하고, 로그인 상태를 업데이트합니다.
        localStorage.setItem('accessToken', accessToken);

        set({ loading: false, isSuccess: true });
        console.log('회원가입 및 로그인 성공!');

        // 5. 회원가입 및 로그인이 완료되었으므로 메인 페이지로 이동시킵니다.
        // window.location.href를 사용하면 페이지를 완전히 새로고침하여
        // 모든 상태(예: Navbar의 로그인 버튼)를 최신 상태로 업데이트할 수 있습니다.
        window.location.href = '/';

        // 성공 시 true를 반환하여 컴포넌트에서 후속 처리를 하도록 합니다.
        return true;

    } catch (error) {
        set({ 
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
            loading: false 
        });
       return false; // 실패 시 false 반환
    }
  },
}));
