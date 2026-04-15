export interface Menu {
  name: string;
  emoji: string;
  desc: string;
}

export type CategoryName =
  | '전체'
  | '한식'
  | '중식'
  | '일식'
  | '양식'
  | '분식'
  | '치킨'
  | '국물'
  | '건강식'
  | '고기';

export const MENUS: Record<Exclude<CategoryName, '전체'>, Menu[]> = {
  '한식': [
    { name: '김치찌개', emoji: '🍲', desc: '얼큰하고 든든하게' },
    { name: '된장찌개', emoji: '🥘', desc: '구수한 집밥의 정석' },
    { name: '비빔밥', emoji: '🍱', desc: '야채와 고추장의 조화' },
    { name: '제육볶음', emoji: '🐷', desc: '매콤달콤 밥도둑' },
    { name: '불고기', emoji: '🥩', desc: '달콤한 한국의 맛' },
    { name: '삼겹살', emoji: '🥓', desc: '지글지글 구워서' },
  ],
  '중식': [
    { name: '짜장면', emoji: '🍜', desc: '달콤짭짤 국민면' },
    { name: '짬뽕', emoji: '🍲', desc: '얼큰한 해물국물' },
    { name: '탕수육', emoji: '🍖', desc: '바삭하고 새콤달콤' },
    { name: '마라탕', emoji: '🌶️', desc: '알싸하고 중독적인' },
    { name: '볶음밥', emoji: '🍚', desc: '간단하고 든든하게' },
    { name: '깐풍기', emoji: '🍗', desc: '바삭하고 매콤하게' },
  ],
  '일식': [
    { name: '초밥', emoji: '🍣', desc: '신선한 해산물의 매력' },
    { name: '라멘', emoji: '🍜', desc: '진하고 깊은 국물' },
    { name: '돈가스', emoji: '🍛', desc: '바삭하고 든든하게' },
    { name: '우동', emoji: '🍢', desc: '쫄깃하고 부드럽게' },
    { name: '규동', emoji: '🍚', desc: '간단하고 든든한 소고기덮밥' },
    { name: '오니기리', emoji: '🍙', desc: '가볍게 한 끼' },
  ],
  '양식': [
    { name: '파스타', emoji: '🍝', desc: '크리미하고 쫄깃하게' },
    { name: '버거', emoji: '🍔', desc: '패티가 두툼한' },
    { name: '샐러드', emoji: '🥗', desc: '가볍고 건강하게' },
    { name: '피자', emoji: '🍕', desc: '치즈가 흘러내리는' },
    { name: '샌드위치', emoji: '🥪', desc: '빠르고 간편하게' },
    { name: '스테이크', emoji: '🥩', desc: '오늘은 특별하게' },
  ],
  '분식': [
    { name: '떡볶이', emoji: '🌶️', desc: '매콤달콤 국민 간식' },
    { name: '로제떡볶이', emoji: '🍅', desc: '크리미하고 매콤하게' },
    { name: '김밥', emoji: '🍱', desc: '간편하고 든든하게' },
    { name: '라볶이', emoji: '🍜', desc: '라면+떡볶이 최강 조합' },
    { name: '치즈핫도그', emoji: '🌭', desc: '길거리 간식의 왕' },
    { name: '토스트', emoji: '🍞', desc: '간단하게 한 끼 해결' },
  ],
  '치킨': [
    { name: '후라이드', emoji: '🍗', desc: '바삭바삭 클래식' },
    { name: '양념치킨', emoji: '🍗', desc: '달콤매콤 국민치킨' },
    { name: '간장치킨', emoji: '🍗', desc: '고소하고 달콤하게' },
    { name: '와플치킨', emoji: '🧇', desc: '요즘 핫한 조합' },
    { name: '치킨버거', emoji: '🍔', desc: '두툼한 치킨 패티' },
    { name: '닭강정', emoji: '🍗', desc: '한입 쏙 바삭하게' },
  ],
  '국물': [
    { name: '순두부찌개', emoji: '🍲', desc: '보들보들 따끈하게' },
    { name: '칼국수', emoji: '🍜', desc: '뜨끈한 국수 한그릇' },
    { name: '설렁탕', emoji: '🥣', desc: '진한 국물의 정수' },
    { name: '감자탕', emoji: '🍖', desc: '얼큰하고 푸짐하게' },
    { name: '삼계탕', emoji: '🍗', desc: '보양식의 대명사' },
    { name: '우동', emoji: '🍢', desc: '쫄깃하고 부드럽게' },
  ],
  '건강식': [
    { name: '샐러드', emoji: '🥗', desc: '가볍고 건강하게' },
    { name: '포케', emoji: '🥙', desc: '상큼한 한그릇' },
    { name: '냉면', emoji: '🍜', desc: '시원하고 쫄깃하게' },
    { name: '월남쌈', emoji: '🥬', desc: '가볍고 상큼하게' },
    { name: '연어덮밥', emoji: '🍣', desc: '신선하고 든든하게' },
    { name: '두부요리', emoji: '🥟', desc: '담백하고 건강하게' },
  ],
  '고기': [
    { name: '삼겹살', emoji: '🥓', desc: '지글지글 구워서' },
    { name: '소고기구이', emoji: '🥩', desc: '입에서 녹는 한우' },
    { name: '갈비', emoji: '🍖', desc: '달콤 짭짤 양념' },
    { name: '족발', emoji: '🍖', desc: '쫄깃하고 부드럽게' },
    { name: '보쌈', emoji: '🥬', desc: '김치와 찰떡궁합' },
    { name: '스테이크', emoji: '🥩', desc: '오늘은 특별하게' },
  ],
};

export const CATEGORIES: CategoryName[] = [
  '전체', '한식', '중식', '일식', '양식', '분식', '치킨', '국물', '건강식', '고기',
];

export function getMenusByCategory(cat: CategoryName): Menu[] {
  if (cat === '전체') {
    return Object.values(MENUS).flat();
  }
  return MENUS[cat] ?? [];
}
