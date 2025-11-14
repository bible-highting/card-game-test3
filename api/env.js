// Vercel Serverless Function으로 환경 변수를 클라이언트에 안전하게 전달
export default function handler(request, response) {
    // CORS 헤더 설정
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐시
    
    // 환경 변수를 클라이언트에 전달 (공개 가능한 정보만)
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    };
    
    // JavaScript 코드로 응답 (window.ENV에 설정)
    const jsCode = `
        window.ENV = ${JSON.stringify(env)};
        console.log('🔧 Vercel 환경 변수 로드됨');
    `;
    
    response.setHeader('Content-Type', 'application/javascript');
    response.status(200).send(jsCode);
}