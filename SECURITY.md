# 🔐 환경 설정 가이드

## 개요
보안을 위해 Supabase API 키와 같은 민감한 정보는 별도 파일로 분리되었습니다.

## 파일 구조
```
📁 프로젝트 루트/
├── 🔓 config.js           # 설정 템플릿 (공개)
├── 🔒 .env.local          # 실제 키 값 (비공개)
├── 🔓 env-loader.js       # 환경 변수 로더 (공개)
├── 🔓 index.html          # 메인 HTML (공개)
├── 🔓 script.js           # 게임 로직 (공개)
└── 🔒 .gitignore          # Git 제외 파일 목록
```

## 개발 환경 설정

### 1. 로컬 개발용 환경 변수 설정
`.env.local` 파일에 실제 Supabase 정보를 입력하세요:

```env
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. 개발 서버 실행
로컬에서 개발할 때는 HTTP 서버를 사용해야 합니다:

```bash
# Python 사용
python -m http.server 8000

# Node.js 사용 (serve 패키지)
npx serve .

# VS Code Live Server 확장 사용 (권장)
```

## 프로덕션 배포 설정

### Vercel 배포
1. **환경 변수 설정**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - 다음 변수들을 추가:
     ```
     SUPABASE_URL = https://your-project-id.supabase.co
     SUPABASE_ANON_KEY = your-anon-key-here
     ```

2. **배포 스크립트 설정**
   `vercel.json`에서 환경 변수 주입 설정이 자동으로 처리됩니다.

### Netlify 배포
1. **환경 변수 설정**
   - Netlify 대시보드 → Site settings → Environment variables
   - 동일한 변수들 추가

2. **빌드 설정**
   - Build command: (없음)
   - Publish directory: `.`

### GitHub Pages 배포
⚠️ **주의**: GitHub Pages는 환경 변수를 지원하지 않으므로 `config.js`에 직접 값을 입력해야 합니다.

```javascript
// config.js (GitHub Pages용)
const CONFIG = {
    production: {
        supabaseUrl: 'https://your-project-id.supabase.co',
        supabaseAnonKey: 'your-anon-key-here'
    }
};
```

## 보안 체크리스트

### ✅ 필수 확인사항
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] 실제 API 키가 소스코드에 하드코딩되지 않음
- [ ] GitHub 저장소에 `.env.local` 파일이 커밋되지 않음
- [ ] 프로덕션 환경에서 환경 변수가 올바르게 설정됨

### ❌ 절대 하지 말 것
- 실제 API 키를 `config.js`에 직접 입력
- `.env.local` 파일을 Git에 커밋
- 공개 저장소에 민감한 정보 노출

## 문제 해결

### 설정이 로드되지 않을 때
1. **개발 환경**: `.env.local` 파일 존재 여부 확인
2. **프로덕션**: 호스팅 플랫폼의 환경 변수 설정 확인
3. **브라우저 콘솔**: 에러 메시지 확인

### API 연결 실패 시
1. Supabase URL과 키가 올바른지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 상태 확인

## 추가 보안 강화

### Supabase RLS (Row Level Security)
현재 프로젝트는 RLS가 활성화되어 있어 추가적인 보안이 적용되어 있습니다.

### API 키 교체 시
1. Supabase 대시보드에서 새 키 생성
2. 모든 환경의 환경 변수 업데이트
3. 기존 키 비활성화

---

🚀 **배포 준비 완료!** 이제 안전하게 프로덕션에 배포할 수 있습니다.