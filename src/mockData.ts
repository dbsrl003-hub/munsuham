import { User, DocumentForm } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    name: '관리자',
    email: 'admin@sw-welfare.or.kr',
    department: '총괄운영',
    position: '기관관리자',
    role: 'ADMIN',
    joinedAt: '2026-01-01',
    approvedAt: '2026-01-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

// 예시 기본 서식은 모두 제거하여 빈 보관함으로 시작
export const INITIAL_DOCUMENTS: DocumentForm[] = [];

export const CATEGORIES = [
  '전체',
  '이용자',
  '활동지원사',
  '회계서류',
  '행정서류',
  '후원/홍보',
  '기타'
] as const;
