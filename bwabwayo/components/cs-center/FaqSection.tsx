import { useState, useEffect } from "react";

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

interface FaqSectionProps {
    onFaqDetailOpen: () => void;
    onFaqDetailClose: () => void;
    isDetailOpen: boolean;
}

const faqData: FaqItem[] = [    
    { 
        id: 1, 
        question: '거래를 하면 안 되는 것들은 어떤 것이 있나요?',
        answer: '다음과 같은 물품들은 거래가 금지되어 있습니다:\n\n• 불법 복제품, 가품, 위조품\n• 성인용품, 음란물\n• 의약품, 건강기능식품\n• 살아있는 동물\n• 위험물질, 폭발물\n• 개인정보, 계정 정보\n• 불법 소프트웨어, 해킹 도구\n\n이러한 물품을 거래할 경우 계정 제재를 받을 수 있습니다.\n\n거래 금지 물품을 판매하거나 구매하려고 시도하는 경우:\n1. 즉시 계정 정지\n2. 관련 법규에 따른 법적 조치\n3. 거래 내역 삭제\n4. 환불 처리 불가\n\n안전한 거래를 위해 반드시 플랫폼 정책을 준수해주세요.'
    },
    { 
        id: 2, 
        question: '물건을 판매했는데 판매대금은 언제 입금되나요?',
        answer: '판매대금은 다음과 같이 처리됩니다:\n\n• 구매확정 후 1-2일 내 입금\n• 배송완료 후 7일이 지나면 자동 구매확정\n• 구매자가 구매확정을 하면 즉시 입금\n• 환불이나 교환 시에는 해당 금액만큼 차감\n\n정확한 입금 시점은 은행 사정에 따라 1-2일 정도 차이가 있을 수 있습니다.\n\n입금 지연이 발생하는 경우:\n1. 구매확정 상태 확인\n2. 배송 추적 정보 확인\n3. 고객센터 문의\n4. 은행 점검 시간 확인\n\n입금 관련 문의는 고객센터로 연락해주세요.'
    },
    { 
        id: 3, 
        question: '사기꾼의 주요 사기패턴과 유형이 궁금해요.',
        answer: '주요 사기 패턴은 다음과 같습니다:\n\n• 가격을 너무 낮게 제시하는 경우\n• 개인 계좌로 입금을 요구하는 경우\n• 배송 전 선입금을 요구하는 경우\n• 연락처를 공개하지 않는 경우\n• 상품 사진이 너무 깔끔한 경우\n• 계좌번호를 자주 바꾸는 경우\n\n거래 시에는 반드시 플랫폼 내 결제 시스템을 이용하고, 의심스러운 경우 신고해주세요.\n\n사기 방지 수칙:\n1. 너무 저렴한 가격에 의심하기\n2. 개인 계좌 입금 요구 시 거부\n3. 상품 확인 전 결제 금지\n4. 의심스러운 연락처 차단\n5. 증거자료 보관\n\n사기 의심 시 즉시 신고해주세요.'
    },
    { 
        id: 4, 
        question: '사기를 당하면 어떻게 처리해야 되나요?',
        answer: '사기를 당했을 때는 다음 순서로 대응해주세요:\n\n1. 즉시 고객센터로 신고\n2. 관련 증거자료 수집 (대화내용, 입금증 등)\n3. 경찰서에 신고 (사기죄로 신고)\n4. 은행에 지급정지 요청\n5. 소비자원에 신고\n\n사기 신고 시 빠른 대응이 중요하므로, 의심스러운 거래가 있다면 미리 신고해주세요.\n\n증거자료 수집 방법:\n• 대화 내용 스크린샷\n• 입금증, 계좌번호\n• 상품 사진, 설명\n• 판매자 정보\n• 거래 시간, 금액\n\n신고 후 처리 과정:\n1. 신고 접수 및 검토 (24시간 이내)\n2. 관련 계정 정지\n3. 법적 조치 협조\n4. 피해 복구 지원\n\n사기 피해 최소화를 위해 신속한 신고가 중요합니다.'
    },
    { 
        id: 5, 
        question: '구매할 때 결제 수수료는 어떻게 되나요?',
        answer: '결제 수수료는 다음과 같습니다:\n\n• 신용카드: 2.5%\n• 체크카드: 1.5%\n• 계좌이체: 0.5%\n• 포인트 결제: 수수료 없음\n\n수수료는 판매자 부담이며, 구매자는 상품 가격만 지불하면 됩니다. 단, 할부 결제 시에는 할부 수수료가 추가로 발생할 수 있습니다.\n\n할부 결제 수수료:\n• 3개월 할부: 1.5%\n• 6개월 할부: 2.5%\n• 12개월 할부: 3.5%\n\n수수료 면제 조건:\n• 첫 구매 시 1회 면제\n• VIP 등급 회원\n• 이벤트 기간 중\n• 특정 카드 사용 시\n\n정확한 수수료는 결제 시점에 안내됩니다.'
    },
    { 
        id: 6, 
        question: '포인트를 얻는 방법이 궁금해요.',
        answer: '포인트는 다음과 같은 방법으로 획득할 수 있습니다:\n\n• 가입 시 웰컴 포인트 1,000P\n• 첫 구매 시 500P\n• 리뷰 작성 시 100P\n• 친구 초대 시 1,000P\n• 일일 출석 체크 시 10P\n• 이벤트 참여 시 다양한 포인트\n\n포인트는 1P = 1원으로 사용 가능하며, 최소 1,000P부터 사용할 수 있습니다.\n\n추가 포인트 획득 방법:\n• 상품 후기 작성: 100P\n• 거래 완료: 50P\n• 신규 가입자 추천: 2,000P\n• 생일 축하: 500P\n• 연속 출석: 7일 100P, 30일 1,000P\n\n포인트 사용 규칙:\n• 유효기간: 획득 후 1년\n• 최소 사용 단위: 1,000P\n• 환불 시 포인트 복구 불가\n• 계정 탈퇴 시 소멸\n\n포인트 적립 현황은 마이페이지에서 확인할 수 있습니다.'
    },
    { 
        id: 7, 
        question: '신뢰도에 대해 궁금해요',
        answer: '신뢰도는 다음과 같은 요소들에 따라 달라집니다:\n\n• 거래 수: 거래를 많이 할수록 신뢰도가 높아집니다\n• 리뷰 수: 상품 후기를 많이 작성할수록 신뢰도가 상승합니다\n• 평점: 받은 리뷰의 평점이 높을수록 신뢰도가 높아집니다\n• 패널티 수: 신고를 받거나 정책 위반 시 신뢰도가 하락합니다\n\n신뢰도가 높을수록 더 많은 기능을 이용할 수 있으며, 낮을 경우 일부 기능이 제한될 수 있습니다.\n\n신뢰도 상승 방법:\n• 정상적인 거래 완료\n• 상품 후기 작성\n• 커뮤니티 활동\n• 이벤트 참여\n• 신고 받지 않기\n\n신뢰도는 즉시 갱신되며, 전체 활동 기간을 기준으로 계산됩니다.'
    },
    { 
        id: 8, 
        question: '회원탈퇴 후 재가입을 할 수 있나요?',
        answer: '회원탈퇴 후 재가입은 다음과 같습니다:\n\n• 탈퇴 후 즉시 재가입 가능\n• 기존 계정 정보는 모두 삭제\n• 새로운 이메일로 가입 가능\n• 기존 전화번호 재사용 가능\n• 탈퇴 전 포인트는 소멸\n\n탈퇴 전 중요한 정보는 미리 백업해두시기 바랍니다.\n\n탈퇴 시 주의사항:\n• 진행 중인 거래가 있으면 탈퇴 불가\n• 미사용 포인트는 환불 불가\n• 거래 내역은 5년간 보관\n• 개인정보는 즉시 삭제\n• 계정 복구 불가\n\n재가입 시 혜택:\n• 웰컴 포인트 1,000P 지급\n• 신규 가입자 혜택 적용\n• 기존 거래 내역과 무관\n• 새로운 신뢰도 시작\n\n탈퇴 전 반드시 진행 중인 거래를 완료해주세요.'
    },
    { 
        id: 9, 
        question: '회원정보 변경은 어디에서 하나요?',
        answer: '회원정보 변경은 다음 경로로 가능합니다:\n\n• 마이페이지 > 설정 > 회원정보 수정\n• 변경 가능한 정보:\n  - 닉네임\n  - 프로필 사진\n  - 연락처\n  - 주소\n  - 비밀번호\n\n• 이메일 주소는 변경이 불가능합니다.\n• 개인정보 보호를 위해 본인 인증이 필요할 수 있습니다.\n\n회원정보 변경 절차:\n1. 마이페이지 접속\n2. 설정 메뉴 선택\n3. 회원정보 수정 클릭\n4. 변경할 정보 입력\n5. 본인 인증 진행\n6. 변경 사항 저장\n\n본인 인증 방법:\n• 휴대폰 인증\n• 이메일 인증\n• 생년월일 확인\n• 주민등록번호 뒷자리\n\n보안을 위해 정기적인 비밀번호 변경을 권장합니다.'
    },
    { 
        id: 10, 
        question: '실수로 배송완료 전에 구매확정을 먼저 눌렀어요.',
        answer: '실수로 구매확정을 눌렀을 경우:\n\n• 구매확정 후 24시간 이내에만 취소 가능\n• 고객센터로 즉시 연락\n• 취소 사유를 명확히 설명\n• 배송 추적 정보 확인\n\n24시간이 지난 경우에는 환불이나 교환으로 처리해야 할 수 있습니다. 구매확정 전에는 반드시 상품을 확인하고 진행해주세요.\n\n구매확정 취소 절차:\n1. 고객센터로 즉시 연락\n2. 주문번호 및 취소 사유 안내\n3. 상품 상태 확인\n4. 취소 처리 진행\n5. 환불 또는 교환 안내\n\n구매확정 취소 불가 조건:\n• 24시간 경과\n• 상품 사용 흔적\n• 포장 파손\n• 상품 가치 하락\n• 정상 배송 완료\n\n앞으로는 반드시 상품을 확인한 후 구매확정을 진행해주세요.'
    },
];

export const FaqSection = ({ onFaqDetailOpen, onFaqDetailClose, isDetailOpen }: FaqSectionProps) => {
    const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

    // 부모 컴포넌트의 상태와 동기화
    useEffect(() => {
        if (selectedFaq && !isDetailOpen) {
            onFaqDetailOpen();
        }
    }, [selectedFaq, isDetailOpen, onFaqDetailOpen]);

    const handleFaqClick = (faq: FaqItem) => {
        setSelectedFaq(faq);
    };

    const handleBack = () => {
        setSelectedFaq(null);
        onFaqDetailClose();
    };

    // FAQ 상세 페이지가 선택된 경우
    if (selectedFaq) {
        return (
            <div className="min-h-screen bg-white">
                {/* 헤더 */}
                <div className="relative pt-[0px] pb-[6px]">
                    {/* 위쪽 선 - 화살표 위까지 전체 너비 */}
                    <div className="border-b-2 border-gray-200 mb-2 w-full"></div>
                    <div className="flex items-center pl-4">
                        <button
                            onClick={handleBack}
                            className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-gray-700 transition-colors mr-3"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 10L5 10M5 10L10 5M5 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="flex-1">
                            <div className="text-[14px] text-[#9CA3AF] font-medium mb-1">
                                자주묻는 질문
                            </div>
                            <h2 className="text-[20px] font-bold text-black font-['SUITE'] leading-[1.4]">
                                {selectedFaq.question}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* 구분선 - 탭 네비게이션 아래 선과 같은 위치 */}
                <div className="border-b-2 border-gray-200 mb-2"></div>

                {/* 답변 */}
                <div className="px-[24px] pt-[24px] pb-[40px]">
                    <div className="text-[15px] font-normal text-[#374151] font-['SUITE'] leading-[1.6] whitespace-pre-line">
                        {selectedFaq.answer}
                    </div>
                </div>
            </div>
        );
    }

    // FAQ 목록 페이지
    return (
        <div className="space-y-0">
            {faqData.map((item, index) => (
                <div 
                    key={item.id} 
                    className={`border-b border-[#F3F4F6] ${index === faqData.length - 1 ? '' : 'border-b'} cursor-pointer hover:bg-[#F9FAFB] transition-colors`}
                    onClick={() => handleFaqClick(item)}
                >
                    <div className="flex justify-between items-center py-[20px] px-[24px]">
                        <span className="text-[15px] font-medium text-[#111827] flex-1 leading-[1.4]">
                            {item.question}
                        </span>
                        <div className="w-4 h-4 ml-[16px] flex-shrink-0">
                            <svg 
                                className="w-4 h-4 text-[#9CA3AF]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};