# 🚀 카드 뒤집기 게임 배포 가이드

## 1. Vercel 배포 (추천)

### 사전 준비
1. GitHub 계정 생성
2. Vercel 계정 생성 (GitHub로 로그인)

### 배포 단계
```bash
# 1. Git 초기화 및 GitHub 업로드
cd /path/to/27cardgame
git init
git add .
git commit -m "🎮 카드 뒤집기 게임 완성 - Canvas API + Supabase"
git branch -M main

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-username/card-flip-game.git
git push -u origin main
```

### Vercel 설정
1. [vercel.com](https://vercel.com) 접속
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (비워둠)
   - **Output Directory**: ./
5. "Deploy" 클릭

### 결과
- 자동 생성 URL: `https://card-flip-game-username.vercel.app`
- 커스텀 도메인 설정 가능
- Git push 시 자동 재배포

---

## 2. Netlify 배포 (간단함)

### 드래그 앤 드롭 방식
1. [netlify.com](https://netlify.com) 접속
2. "Sites" → "Deploy manually"
3. 프로젝트 폴더 전체를 드래그 앤 드롭
4. 즉시 배포 완료!

### Git 연동 방식
1. GitHub 저장소 생성 (위와 동일)
2. Netlify에서 "New site from Git"
3. GitHub 연결 및 저장소 선택
4. 자동 배포

---

## 3. GitHub Pages 배포

### 설정 방법
1. GitHub에 저장소 업로드
2. Repository Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: main, Folder: / (root)
5. Save

### 접속 URL
- `https://your-username.github.io/card-flip-game`

---

## 🔧 배포 전 최적화

### 1. 프로덕션 준비
```javascript
// script.js 상단에 환경 변수 체크 추가
const IS_PRODUCTION = window.location.hostname !== 'localhost';

// 에러 로깅 (프로덕션 환경에서)
if (IS_PRODUCTION) {
    window.addEventListener('error', (e) => {
        console.error('Game Error:', e.error);
    });
}
```

### 2. SEO 최적화
```html
<!-- index.html <head>에 추가 -->
<meta name="description" content="재미있는 카드 뒤집기 메모리 게임. Canvas API와 실시간 리더보드를 즐겨보세요!">
<meta name="keywords" content="카드게임, 메모리게임, Canvas게임, 브라우저게임">
<meta property="og:title" content="🎴 카드 뒤집기 게임">
<meta property="og:description" content="Canvas API로 만든 멋진 카드 메모리 게임">
<meta property="og:image" content="./game-screenshot.png">
<meta property="og:url" content="https://your-domain.com">
```

### 3. 성능 최적화
- 이미지 압축 (스크린샷용)
- JavaScript 압축 (선택사항)
- 캐싱 설정 (Vercel/Netlify 자동)

---

## 📊 배포 플랫폼 비교

| 플랫폼 | 무료 용량 | 커스텀 도메인 | 자동 배포 | HTTPS | 난이도 |
|--------|-----------|---------------|-----------|-------|--------|
| **Vercel** | 무제한 | ✅ | ✅ | ✅ | ⭐⭐ |
| **Netlify** | 100GB/월 | ✅ | ✅ | ✅ | ⭐ |
| **GitHub Pages** | 1GB | ✅ | ✅ | ✅ | ⭐⭐ |
| **Firebase** | 10GB/월 | ✅ | ✅ | ✅ | ⭐⭐⭐ |

---

## 🎯 추천 선택

### 🥇 **Vercel** - 프로덕션 품질
- 전문적인 개발자 이미지
- 뛰어난 성능과 안정성
- Supabase와 완벽 호환

### 🥈 **Netlify** - 초보자 친화적
- 가장 쉬운 배포 과정
- 드래그 앤 드롭 지원
- 풍부한 플러그인

### 🥉 **GitHub Pages** - 오픈소스
- 코드 공유와 배포를 동시에
- 개발자 커뮤니티 노출
- 포트폴리오 용도에 적합

---

## 🔗 배포 후 할 일

1. **도메인 공유**: SNS, 포트폴리오에 링크 추가
2. **피드백 수집**: 사용자 의견 수렴
3. **모니터링**: 접속 통계 확인
4. **업데이트**: 새 기능 추가 시 자동 배포

선택한 플랫폼에 따라 배포를 진행해보세요! 🚀