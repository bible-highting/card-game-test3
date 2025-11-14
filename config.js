// 설정 파일
// 이 파일은 공개 저장소에 커밋됩니다.

// 환경별 설정
const CONFIG = {
    // 개발 환경 설정
    development: {
        supabaseUrl: 'YOUR_SUPABASE_URL_HERE',
        supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
    },
    
    // 프로덕션 환경 설정 (환경 변수에서 가져옴)
    production: {
        supabaseUrl: window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
        supabaseAnonKey: window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
    }
};

// 현재 환경 감지
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' && 
                     window.location.hostname !== '';

// 프로덕션 환경에서 환경 변수 로드
async function loadProductionConfig() {
    if (IS_PRODUCTION && !window.ENV) {
        try {
            // Vercel API 엔드포인트에서 환경 변수 로드
            const response = await fetch('/api/env');
            if (response.ok) {
                // 응답이 JavaScript 코드이므로 eval로 실행
                const envCode = await response.text();
                eval(envCode);
            }
        } catch (error) {
            console.warn('⚠️ 프로덕션 환경 변수 로드 실패:', error);
        }
    }
}

// 현재 환경에 맞는 설정 반환
function getConfig() {
    return IS_PRODUCTION ? CONFIG.production : CONFIG.development;
}

// 설정 초기화 및 전역 설정
async function initConfig() {
    await loadProductionConfig();
    window.GAME_CONFIG = getConfig();
    
    // 설정 로드 완료 이벤트 발생
    if (typeof window.onConfigLoaded === 'function') {
        window.onConfigLoaded();
    }
}

// 즉시 초기화 시작
if (IS_PRODUCTION) {
    initConfig();
} else {
    // 개발 환경에서는 동기적으로 설정
    window.GAME_CONFIG = getConfig();
}