// 개발 환경 전용 환경 변수 로더
// 프로덕션에서는 config.js의 Vercel API를 통해 로드됨

(async function loadDevelopmentEnvironment() {
    // 개발 환경에서만 실행
    const IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.hostname === '' ||
                          window.location.port !== '';
    
    if (!IS_DEVELOPMENT) {
        console.log('🚀 프로덕션 환경 - Vercel API 환경 변수 사용');
        return;
    }
    
    try {
        // .env.local 파일에서 환경 변수 로드 시도
        const response = await fetch('./.env.local');
        if (!response.ok) {
            throw new Error('환경 변수 파일 없음');
        }
        
        const envText = await response.text();
        
        // 환경 변수 파싱
        const envVars = {};
        envText.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex > 0) {
                    const key = trimmedLine.substring(0, equalIndex).trim();
                    const value = trimmedLine.substring(equalIndex + 1).trim();
                    envVars[key] = value;
                }
            }
        });
        
        // window.ENV에 설정
        window.ENV = envVars;
        console.log('🔧 개발 환경 변수 로드됨:', Object.keys(envVars));
        
    } catch (error) {
        console.warn('⚠️ .env.local 파일을 찾을 수 없습니다.');
        console.info('💡 개발 시 .env.local 파일에 Supabase 정보를 설정해주세요.');
        window.ENV = {};
    }
})();