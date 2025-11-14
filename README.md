# 🎴 카드 뒤집기 게임

> Canvas API와 Supabase로 만든 실시간 리더보드 메모리 게임

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/card-flip-game)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/card-flip-game)

Canvas API와 JavaScript로 만든 인터랙티브한 카드 뒤집기 메모리 게임입니다.

## 🎮 게임 특징

### 핵심 기능
- **16장의 카드**: 8가지 심볼이 2개씩 배치된 4x4 그리드
- **부드러운 3D 뒤집기 애니메이션**: CSS transform 대신 Canvas의 scale을 활용한 실제 3D 효과
- **시각적 피드백**: 그림자, 글로우 효과, 파티클 애니메이션
- **게임 진행 추적**: 매치 개수, 시도 횟수, 경과 시간 표시

### Canvas API 활용 요소
- **Custom Drawing**: `CanvasRenderingContext2D`를 사용한 완전한 커스텀 렌더링
- **애니메이션**: `requestAnimationFrame`을 통한 부드러운 60FPS 애니메이션
- **이벤트 처리**: Canvas 좌표계를 활용한 정밀한 마우스 클릭 감지
- **시각 효과**: 그림자, 파티클 시스템, 글로우 효과

## 🛠️ 기술 스택

- **HTML5 Canvas**: 모든 그래픽 렌더링
- **Vanilla JavaScript**: 게임 로직 및 애니메이션
- **CSS3**: 배경 그라데이션 및 레이아웃
- **Supabase**: 점수 데이터베이스 및 실시간 순위표
- **Context7**: Canvas API 문서 참조

## 🎯 게임 규칙

1. **목표**: 모든 카드 쌍을 찾아 매치하기
2. **플레이 방법**: 
   - 플레이어 이름 입력 (선택사항)
   - 카드를 클릭하여 뒤집기
   - 두 카드가 같은 심볼이면 매치 성공
   - 다르면 다시 뒤집어짐
   - 실시간으로 점수가 계산됨
3. **승리 조건**: 모든 8쌍을 찾으면 승리 + 자동 점수 저장

## 🏆 리더보드 시스템

### 주요 기능
- **실시간 순위표**: 🏆 버튼으로 언제든 확인 가능
- **TOP 15 랭킹**: 최고 점수 순으로 정렬
- **메달 시스템**: 🥇🥈🥉 상위 3위 특별 표시
- **전체 통계**: 📊 버튼으로 게임 통계 확인
- **자동 새로고침**: 🔄 버튼으로 최신 순위 업데이트
- **반응형 디자인**: 모바일/데스크톱 모두 지원

### 통계 정보
- 총 게임 수
- 최고 점수
- 평균 점수  
- 평균 시도 횟수
- 평균 완료 시간

## 🚀 실행 방법

1. 프로젝트 폴더에서 `index.html` 파일을 브라우저로 열기
2. 또는 로컬 서버 실행:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server 설치 필요)
   npx http-server
   ```

## 🎨 주요 기능 설명

### 1. Card 클래스
```javascript
class Card {
    constructor(x, y, symbol, index) {
        // 카드 위치, 심볼, 상태 관리
    }
    
    flip() {
        // 3D 뒤집기 애니메이션 구현
    }
    
    draw() {
        // Canvas에 카드 렌더링
    }
}
```

### 2. 애니메이션 시스템
- **Flip Animation**: sine wave를 사용한 자연스러운 3D 회전 효과
- **Particle System**: 매치 성공 시 파티클 폭발 효과
- **Glow Effect**: 매치된 카드의 반짝이는 효과

### 3. Canvas 최적화
- **Batch Drawing**: 모든 카드를 한 번의 루프에서 렌더링
- **requestAnimationFrame**: 브라우저 최적화된 애니메이션 루프
- **Dirty Rectangle**: 전체 캔버스를 매번 클리어하여 깔끔한 렌더링

## 📱 반응형 디자인

- 고정 캔버스 크기 (800x600)로 일관된 게임 경험 제공
- 모든 디바이스에서 동일한 게임플레이 보장
- 마우스 호버 효과로 데스크톱 사용성 향상

## 🎵 사용된 이모지 심볼

🎈 🎯 🎭 🎪 🎨 🎵 🎸 🎤

각각 2개씩 총 16장의 카드로 구성

## 🔧 커스터마이징 가능한 요소

```javascript
// script.js에서 수정 가능한 설정들
const CARD_WIDTH = 90;        // 카드 너비
const CARD_HEIGHT = 120;      // 카드 높이
const CARD_MARGIN = 10;       // 카드 간격
const GRID_COLS = 4;          // 가로 카드 수
const GRID_ROWS = 4;          // 세로 카드 수

const cardSymbols = ['🎈', '🎯', '🎭', '🎪', '🎨', '🎵', '🎸', '🎤'];
```

## 📊 성능 특징

- **60FPS**: requestAnimationFrame으로 부드러운 애니메이션
- **메모리 효율**: 객체 풀링 없이도 가비지 컬렉션 최소화
- **Canvas 최적화**: 필요한 부분만 다시 그리기

## 🎮 게임 스크린샷

게임을 실행하면 다음과 같은 화면을 볼 수 있습니다:

- 파란색 그라데이션 배경
- 흰색 테두리의 카드들
- 실시간 게임 정보 (매치 수, 시도 횟수, 시간)
- 새 게임 버튼

## � 수파베이스 연동 기능

### 데이터베이스 구조
```sql
-- game_scores 테이블
CREATE TABLE game_scores (
    id UUID PRIMARY KEY,
    player_name TEXT NOT NULL,           -- 플레이어 이름
    attempts INTEGER NOT NULL,           -- 시도 횟수
    completion_time INTEGER NOT NULL,    -- 완료 시간(ms)
    total_pairs INTEGER DEFAULT 8,       -- 총 카드 쌍 수
    difficulty TEXT DEFAULT 'normal',    -- 난이도
    score INTEGER GENERATED ALWAYS AS (...) STORED,  -- 자동 계산 점수
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 점수 계산 공식
```javascript
점수 = MAX(100, 1000 - (시도횟수 × 20) - (완료시간/1000))
```

### API 엔드포인트
- **점수 저장**: `POST /rest/v1/game_scores`
- **순위표 조회**: `GET /rest/v1/game_scores?order=score.desc&limit=10`

### 보안 설정
- **RLS(Row Level Security)** 활성화
- 모든 사용자 읽기/쓰기 권한 허용 (익명 게임)

## �🌟 확장 아이디어

- 난이도 선택 (카드 수 조정) ✅ 데이터베이스 지원
- 다양한 테마 (색상, 심볼 변경)
- 사운드 효과 추가
- 사용자 계정 시스템 (Supabase Auth)
- 개인별 통계 및 성취도
- 실시간 멀티플레이어 모드
- 일일/주간/월간 챌린지

## 📄 라이선스

MIT License - 자유롭게 수정하고 배포 가능합니다.