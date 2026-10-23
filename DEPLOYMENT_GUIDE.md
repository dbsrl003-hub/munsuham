# 🚀 Supabase 연동 & GitHub 배포 완벽 가이드

사회복지 현장용 서식 보관함 & 문서 암호 해제 웹앱의 **Supabase 클라우드 연동**, **GitHub 업로드**, **Vercel 무료 배포** 단계별 가이드입니다.

---

## 1단계: Supabase(슈파베이스) 클라우드 연동 (5분 소요)

### 1-1. SQL 스키마 실행 (테이블 & 스토리지 생성)
1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인하여 프로젝트를 생성(또는 기존 프로젝트 선택)합니다.
2. 좌측 메뉴에서 **SQL Editor** 아이콘을 클릭합니다.
3. 프로젝트 폴더의 `supabase-schema.sql` 파일 내용을 전체 복사하여 붙여넣고 우측 하단 **[Run]** 버튼을 누릅니다.
   * ✅ `profiles` (직원 권한), `documents` (공용 서식) 테이블이 생성됩니다.
   * ✅ `forms-vault` (원본 첨부파일 저장용 스토리지 버킷)이 자동 생성됩니다.

### 1-2. 프로젝트 키 확인 및 웹앱에 입력
1. 좌측 메뉴 맨 아래 **Project Settings** (톱니바퀴) → **API** 클릭
2. 다음 두 가지 값을 확인합니다:
   * **Project URL**: `https://xxxxxxxx.supabase.co`
   * **Project API keys (anon public)**: `eyJhbGciOiJIUz...`
3. 현재 실행 중인 웹앱 상단 우측의 **[클라우드 연동]** 버튼을 클릭하여 위 두 값을 붙여넣고 **[연동 저장 및 동기화]**를 누르면 끝!
   * (또는 프로젝트 루트의 `.env` 파일에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 입력하셔도 됩니다.)

---

## 2단계: GitHub(깃허브)에 소스코드 올리기

### 방법 A: Git 명령어 사용 (권장)
1. GitHub(github.com)에서 새 리포지토리(New repository)를 생성합니다. (예: `welfare-doc-vault`)
2. 터미널에서 다음 명령어를 실행하여 푸시합니다:
```bash
git init
git add .
git commit -m "feat: 사회복지 서식 보관함 및 암호해제 대시보드 완성"
git branch -M main
git remote add origin https://github.com/사용자이름/welfare-doc-vault.git
git push -u origin main
```
*(Git이 PC에 없는 경우: `winget install --id Git.Git -e --source winget` 또는 [git-scm.com](https://git-scm.com)에서 다운로드)*

### 방법 B: GitHub Desktop 또는 웹 업로드
* **GitHub Desktop** 앱을 실행하여 현재 폴더(`양식 문서함 대시보드`)를 선택하고 **Publish repository**를 누르면 마우스 클릭만으로 바로 GitHub에 올라갑니다.

---

## 3단계: Vercel(버셀)을 통한 100% 무료 배포 (인터넷 주소 생성)

1. [Vercel(vercel.com)](https://vercel.com)에 접속하여 **GitHub 계정으로 로그인**합니다.
2. **[Add New...]** → **[Project]** 클릭
3. 방금 올린 GitHub 저장소(`welfare-doc-vault`) 옆의 **[Import]** 버튼 클릭
4. **Environment Variables** (환경 변수) 섹션을 펼치고 다음 2개를 추가합니다:
   * `VITE_SUPABASE_URL` = (본인의 Supabase URL)
   * `VITE_SUPABASE_ANON_KEY` = (본인의 Supabase Anon Key)
5. **[Deploy]** 버튼 클릭!
   * 약 1분 후 `https://welfare-doc-vault.vercel.app` 과 같은 **실제 인터넷 주소(URL)**가 생성됩니다.
   * 이제 기관 내 모든 복지사님들과 이 링크를 공유하여 함께 사용하실 수 있습니다! 🎉
