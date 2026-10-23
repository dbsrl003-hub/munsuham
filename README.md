# 📂 사회복지 현장용 서식 보관함 & 문서 암호 해제 웹 서비스
> **Welfare Document Vault & Password Decryptor**  
> Wise 디자인 시스템(Forest Ink & Lime Voltage) 기반의 공용 서식 관리 및 보안 암호 해제 대시보드

---

## 🌟 주요 핵심 기능

### 1. 기관 공용 서식함 & 개인 보관함
* **한글(HWP, HWPX), 엑셀(XLSX, XLS), PDF** 서식 통합 관리
* 카테고리별 분류 (사례관리, 프로그램/기획, 회계/정산, 행정/인사, 시설/안전, 후원/홍보)
* 실시간 키워드 검색, 포맷 필터, 즐겨찾기(⭐ 북마크), 인기/최신순 정렬
* 실무 표준 서식 10종 내장 및 신규 서식 드래그앤드롭 등록

### 2. 안전한 문서 암호 해제 (100% Client-Side In-Memory)
* 기존 비밀번호를 알고 있는 파일의 암호를 브라우저에서 영구 해제하여 새 문서로 변환
* 외부 서버로 파일이 업로드되지 않아 개인정보와 시설 기밀을 완벽히 보호
* 실습용 샘플 파일 원클릭 다운로드 및 해제 이력 관리

### 3. 사용자 권한 및 회원 승인 시스템
* 최고관리자(Admin) / 일반직원(Staff) / 승인대기(Pending) 3단계 권한
* 관리자 전용 회원 승인 제어판 및 가입 신청 시뮬레이션

### 4. Supabase 클라우드 & IndexedDB 하이브리드 스토리지
* **로컬 모드**: 브라우저 IndexedDB를 통한 무설치 원본 파일 보존
* **클라우드 모드**: Supabase Database 및 Storage(`forms-vault`)를 통한 기관 전 직원 실시간 동기화

---

## 🛠️ 기술 스택
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
* **Icons & Styling**: Lucide React, Wise Design System Tokens
* **Decryption & Files**: `pdf-lib`, `xlsx` (SheetJS), IndexedDB, Base64 Data Stream
* **Cloud Backend**: Supabase (Database, Auth, Storage)
* **Deployment**: GitHub & Vercel

---

## 🚀 빠른 시작 (Local)

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드
npm run build
```

자세한 Supabase 연동 및 Vercel 배포 방법은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참고하세요.
