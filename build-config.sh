#!/bin/bash

# Vercel 빌드 시 supabase-config.js 자동 생성 스크립트
# 환경 변수를 JavaScript 파일로 변환하여 클라이언트에서 사용 가능하게 함

echo "🔧 Supabase 설정 파일 생성 중..."

# 환경 변수 존재 여부 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 환경 변수가 설정되지 않았습니다!"
    echo "   SUPABASE_URL: ${SUPABASE_URL:-(설정되지 않음)}"
    echo "   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:+(설정됨)}"
    echo ""
    echo "💡 Vercel 환경 변수를 확인해주세요:"
    echo "   1. Vercel Dashboard → Settings → Environment Variables"
    echo "   2. SUPABASE_URL과 SUPABASE_ANON_KEY 설정"
    echo "   3. 프로젝트 재배포"
    exit 1
fi

# supabase-config.js 파일 생성
cat > supabase-config.js << EOF
// 빌드 시 자동 생성된 Supabase 설정 파일
// 이 파일은 환경 변수를 기반으로 생성되며 Git에 커밋되지 않습니다.

window.SUPABASE_CONFIG = {
    url: '${SUPABASE_URL}',
    anonKey: '${SUPABASE_ANON_KEY}',
    buildTime: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
    environment: '${VERCEL_ENV:-production}'
};

console.log('🔧 Supabase 설정 로드됨:', {
    url: window.SUPABASE_CONFIG.url,
    environment: window.SUPABASE_CONFIG.environment,
    buildTime: window.SUPABASE_CONFIG.buildTime
});
EOF

echo "✅ supabase-config.js 파일이 생성되었습니다."
echo "📋 설정 정보:"
echo "   URL: ${SUPABASE_URL}"
echo "   키: ${SUPABASE_ANON_KEY:0:20}...***"
echo "   환경: ${VERCEL_ENV:-production}"
echo "   빌드 시간: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"