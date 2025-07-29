import { create } from 'zustand'

interface SubCategory {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  sub: SubCategory[]
}

// 카테고리 더미데이터
const CATEGORIES: Category[] = [
  {
    id: 1,
    name: '여성의류',
    sub: [
      {id: 1001, name: '아우터'},
      {id: 1002, name: '상의'},
      {id: 1003, name: '바지'},
      {id: 1004, name: '치마'},
      {id: 1005, name: '원피스'},
      {id: 1006, name: '점프수트'},
      {id: 1007, name: '셋업/세트'},
      {id: 1008, name: '언더웨어/홈웨어'},
      {id: 1009, name: '테마/이벤트'},
    ]
  },
  { 
    id: 2,
    name: '남성의류',
    sub: [
      {id: 1010, name: '아우터'},
      {id: 1011, name: '상의'},
      {id: 1012, name: '바지'},
      {id: 1013, name: '점프수트'},
      {id: 1014, name: '셋업/세트'},
      {id: 1015, name: '언더웨어/홈웨어'},
      {id: 1016, name: '테마/이벤트'},
    ] 
  },
  { 
    id: 3,
    name: '신발', 
    sub: [
      {id: 1017, name: '스니커즈'},
      {id: 1018, name: '남성화'},
      {id: 1019, name: '여성화'},
      {id: 1020, name: '스포츠화'},
    ] 
  },
  { 
    id: 4,
    name: '가방/지갑', 
    sub: [
      {id: 1021, name: '여성가방'},
      {id: 1022, name: '남성가방'},
      {id: 1023, name: '여행용 가방'},
      {id: 1024, name: '여성지갑'},
      {id: 1025, name: '남성지갑'},
      {id: 1026, name: '기타 지갑'},
    ] 
  },
  { 
    id: 5,
    name: '시계', 
    sub: [
      {id: 1027, name: '남성시계'},
      {id: 1028, name: '여성시계'},
      {id: 1029, name: '시계용품'},
    ] 
  },
  { 
    id: 6,
    name: '쥬얼리', 
    sub: [
      {id: 1030, name: '귀걸이/피어싱'},
      {id: 1031, name: '목걸이/펜던트'},
      {id: 1032, name: '팔찌'},
      {id: 1032, name: '발찌'},
      {id: 1033, name: '반지'},
      {id: 1034, name: '쥬얼리 세트'},
      {id: 1035, name: '기타 쥬얼리'},
    ] 
  },
  { 
    id: 7,
    name: '패션 액세서리', 
    sub: [
      {id: 1036, name: '모자'},
      {id: 1037, name: '안경/선글라스'},
      {id: 1038, name: '목도리/장갑'},
      {id: 1039, name: '스카프/넥타이'},
      {id: 1040, name: '벨트'},
      {id: 1041, name: '양말/스타킹'},
      {id: 1042, name: '우산/양산'},
      {id: 1043, name: '키링/키케이스'},
      {id: 1044, name: '기타 액세서리'},
    ] 
  },
  { 
    id: 8,
    name: '디지털', 
    sub: [
      {id: 1045, name: '휴대폰'},
      {id: 1046, name: '태블릿'},
      {id: 1047, name: '웨어러블(워치/밴드'},
      {id: 1048, name: '오디오/영상/관련기기'},
      {id: 1049, name: 'PC/노트북'},
      {id: 1050, name: '게임/타이틀'},
      {id: 1051, name: '카메라/DSLR'},
      {id: 1052, name: 'PC부품/저장장치'},
    ] 
  },
  { 
    id: 9,
    name: '스포츠/레저', 
    sub: [
      {id: 1053, name: '골프'},
      {id: 1054, name: '캠핑'},
      {id: 1055, name: '낚시'},
      {id: 1056, name: '축구'},
      {id: 1057, name: '야구'},
      {id: 1058, name: '농구'},
      {id: 1059, name: '자전거'},
      {id: 1060, name: '등산/클라이밍'},
      {id: 1061, name: '헬스/요가/필라테스'},
      {id: 1062, name: '인라인/스케이트보드'},
      {id: 1063, name: '전동킥보드/전동휠'},
      {id: 1064, name: '테니스'},
      {id: 1065, name: '배드민턴'},
      {id: 1066, name: '볼링'},
      {id: 1067, name: '탁구'},
      {id: 1068, name: '당구'},
      {id: 1069, name: '겨울 스포츠'},
      {id: 1070, name: '수상 스포츠'},
      {id: 1071, name: '격투/무술'},
      {id: 1072, name: '기타 스포츠'},
    ] 
  },
  { 
    id: 10,
    name: '스타굿즈', 
    sub: [
      {id: 1073, name: '보이그룹'},
      {id: 1074, name: '걸그룹'},
      {id: 1075, name: '솔로(남)'},
      {id: 1076, name: '솔로(여)'},
      {id: 1077, name: '배우(남)'},
      {id: 1078, name: '배우(여)'},
      {id: 1079, name: '방송/예능/캐릭터'},
      {id: 1080, name: '기타'},
    ] 
  },
  { 
    id: 11,
    name: '키덜트', 
    sub: [
      {id: 1081, name: '피규어/인형'},
      {id: 1082, name: '레고/블럭'},
      {id: 1083, name: '프라모델'},
      {id: 1084, name: 'RC/드론'},
      {id: 1085, name: '보드게임'},
      {id: 1086, name: '서바이벌건'},
      {id: 1087, name: '기타(키덜트)'},
    ] 
  },
  { 
    id: 12,
    name: '예술/희귀/수집품', 
    sub: [
      {id: 1088, name: '희귀/수집품'},
      {id: 1089, name: '골동품'},
      {id: 1090, name: '예술작품'},
    ] 
  },
  { 
    id: 13,
    name: '음반/악기', 
    sub: [
      {id: 1091, name: 'CD/DVD/LP'},
      {id: 1092, name: '악기'},
    ] 
  },
  { 
    id: 14,
    name: '도서/티켓/문구', 
    sub: [
      {id: 1093, name: '도서'},
      {id: 1094, name: '문구'},
      {id: 1095, name: '기프티콘/쿠폰'},
      {id: 1096, name: '상품권'},
      {id: 1097, name: '티켓켓'},
    ] 
  },
  { 
    id: 15,
    name: '뷰티/미용', 
    sub: [
      {id: 1098, name: '스킨케어'},
      {id: 1099, name: '색조메이크업'},
      {id: 1100, name: '베이스메이크업'},
      {id: 1101, name: '바디/헤어케어'},
      {id: 1102, name: '향수/아로마'},
      {id: 1103, name: '네일아트/케어'},
      {id: 1104, name: '미용소품/기기'},
      {id: 1105, name: '다이어트/이너뷰티'},
      {id: 1106, name: '남성 화장품'},
    ] 
  },
  { 
    id: 16,
    name: '생활/주방용품', 
    sub: [
      {id: 1107, name: '주방용품'},
      {id: 1108, name: '욕실용품'},
      {id: 1109, name: '생활용품'},
    ] 
  },
  { 
    id: 17,
    name: '식품', 
    sub: [
      {id: 1110, name: '건강식품'},
      {id: 1111, name: '농수축산물'},
      {id: 1112, name: '간식'},
      {id: 1113, name: '커피/차'},
      {id: 1114, name: '생수/음료'},
      {id: 1115, name: '면/통조림'},
      {id: 1116, name: '장/소스/오일'},
      {id: 1117, name: '간편조리식품'},
      {id: 1118, name: '기타 식품'},
    ] 
  },
  { 
    id: 18,
    name: '유아/출산', 
    sub: [
      {id: 1119, name: '베이비의류(0~2세)'},
      {id: 1120, name: '여아의류(3~6세)'},
      {id: 1121, name: '남아의류(3~6세'},
      {id: 1122, name: '여주니어의류(7세~)'},
      {id: 1123, name: '남주니어의류(7세~)'},
      {id: 1124, name: '신발/가방/잡화'},
      {id: 1125, name: '유아동용품'},
      {id: 1126, name: '임부 의류/용품'},
      {id: 1127, name: '교구/완구/인형'},
      {id: 1128, name: '수유/이유용품'},
    ] 
  },
  { 
    id: 19,
    name: '반려동물용품', 
    sub: [
      {id: 1129, name: '강아지용품'},
      {id: 1130, name: '강아지 사료/간식'},
      {id: 1131, name: '기타(강아지)'},
      {id: 1132, name: '고양이용품'},
      {id: 1133, name: '고양이 사료/간식'},
      {id: 1134, name: '기타(고양이)'},
      {id: 1135, name: '기타(반려동물 용품)'},
      {id: 1136, name: '기타(반려동물 사료/간식)'},
    ] 
  },
  { 
    id: 20,
    name: '기타', 
    sub: [] 
  },
]

interface CategoryStore {
  categories: Category[]
  loading: boolean
  error: string | null
  getCategories: () => Promise<void>
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  getCategories: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://i13e202.p.ssafy.io:8081/api/products/categories')
      if (!response.ok) {
        throw new Error('카테고리 조회에 실패했습니다')
      }
      const data = await response.json()
      //console.log(data)
      
      // 더미데이터 반환
      set({ categories: CATEGORIES, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
    }
  }
})) 