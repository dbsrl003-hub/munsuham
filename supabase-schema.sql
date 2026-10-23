-- ==============================================================================
-- 복지서식함 & 암호해제 대시보드 - Supabase 통합 데이터베이스 & 스토리지 스키마
-- 사용법: Supabase Dashboard -> SQL Editor에 복사하여 [Run] 버튼을 누르세요.
-- ==============================================================================

-- 1. 사용자/직원 프로필 테이블 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PENDING' CHECK (role IN ('ADMIN', 'STAFF', 'PENDING')),
  avatar TEXT,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_at DATE
);

-- 2. 서식 문서 테이블 (documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('사례관리', '프로그램/기획', '회계/정산', '행정/인사', '시설/안전', '후원/홍보')),
  file_type TEXT NOT NULL CHECK (file_type IN ('hwp', 'hwpx', 'xlsx', 'xls', 'pdf')),
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  storage_path TEXT, -- Supabase Storage 내 파일 경로
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_dept TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version TEXT DEFAULT 'v1.0',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. Row Level Security (RLS) 활성화 및 전체 읽기/쓰기 정책 (기관 내부 협업용)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 익명(anon) 및 인증 사용자 전체 조회 및 관리 허용 정책
CREATE POLICY "Allow all read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow all read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow all insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow all delete documents" ON public.documents FOR DELETE USING (true);

-- 4. Supabase Storage: 서식 파일 저장용 버킷 ('forms-vault') 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('forms-vault', 'forms-vault', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 스토리지 버킷 파일 업로드 및 다운로드 허용 정책
CREATE POLICY "Public Access forms-vault"
ON storage.objects FOR SELECT
USING ( bucket_id = 'forms-vault' );

CREATE POLICY "Public Upload forms-vault"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'forms-vault' );

CREATE POLICY "Public Update forms-vault"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'forms-vault' );

CREATE POLICY "Public Delete forms-vault"
ON storage.objects FOR DELETE
USING ( bucket_id = 'forms-vault' );

-- 5. 기본 직원 및 초기 서식 데이터 시드 (초기 1회 자동 삽입)
INSERT INTO public.profiles (id, name, email, department, position, role, avatar, joined_at, approved_at)
VALUES
  ('user-admin', '김복지', 'admin@sw-welfare.or.kr', '운영지원팀', '부장 (최고관리자)', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2023-01-10', '2023-01-10'),
  ('user-staff-1', '이현장', 'lee.hj@sw-welfare.or.kr', '사례관리팀', '선임 사회복지사', 'STAFF', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2023-05-15', '2023-05-16'),
  ('user-staff-2', '박실무', 'park.sm@sw-welfare.or.kr', '지역조직화팀', '사회복지사', 'STAFF', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2024-02-01', '2024-02-02'),
  ('user-pending-1', '최신입', 'choi.new@sw-welfare.or.kr', '기획홍보팀', '사회복지사 (신규입사)', 'PENDING', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-10-20', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.documents (id, title, description, category, file_type, file_name, file_size, author_id, author_name, author_dept, is_public, downloads_count, tags, version, created_at, updated_at)
VALUES
  ('doc-001', '사회복지관 초기상담 및 욕구사정 기록지', '신규 대상자 접수 시 가족력, 경제상황, 주거환경, 주요 욕구를 체계적으로 파악하는 표준 사정 서식입니다.', '사례관리', 'hwp', '사례관리_초기상담사정기록지_2026개정.hwp', '142 KB', 'user-admin', '김복지', '운영지원팀', true, 148, ARRAY['초기상담', '욕구사정', '사례관리'], 'v2.4', '2026-09-15', '2026-10-01'),
  ('doc-002', '프로그램 계획서 및 예산 편성 표준안', '공동모금회 및 지자체 공모사업 지원 시 활용할 수 있는 SMART 성과목표 및 세부 실행계획서 서식입니다.', '프로그램/기획', 'hwpx', '2026_단위프로그램_사업계획서_표준서식.hwpx', '89 KB', 'user-staff-1', '이현장', '사례관리팀', true, 231, ARRAY['사업계획', '공동모금회', '프로그램'], 'v3.1', '2026-08-20', '2026-09-18'),
  ('doc-003', '지출결의서 및 영수증 증빙 첨부 대장 (자동합산 수식포함)', '사회복지시설 재무회계규칙에 따른 세출예산 목별 지출결의서 및 카드매출전표 자동계산 엑셀 시트입니다.', '회계/정산', 'xlsx', '지출결의서_증빙영수증철_자동산출_2026.xlsx', '315 KB', 'user-admin', '김복지', '운영지원팀', true, 412, ARRAY['지출결의서', '회계', '재무회계규칙'], 'v4.0', '2026-01-05', '2026-07-12'),
  ('doc-005', '기부금영수증 발행신청서 및 개인정보 수집동의서', '소득세법 제160조에 따른 지정기부금 영수증 발급용 후원자 정보 수집 및 국세청 연말정산 간소화 연계 양식.', '후원/홍보', 'pdf', '기부금영수증_발행신청_개인정보동의서.pdf', '512 KB', 'user-admin', '김복지', '운영지원팀', true, 164, ARRAY['후원', '기부금영수증', '연말정산'], 'v2.0', '2026-04-18', '2026-09-02')
ON CONFLICT (id) DO NOTHING;
