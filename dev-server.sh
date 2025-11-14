#!/bin/bash

# 로컬 개발용 서버 시작 스크립트
# .env.local 파일의 환경 변수를 사용하여 개발용 설정 파일 생성

echo "🚀 개발 서버 시작 준비..."

# .env.local 파일 존재 확인
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 파일이 없습니다!"
    echo ""
    echo "📝 .env.local 파일을 생성하고 다음 내용을 추가해주세요:"
    echo ""
    echo "SUPABASE_URL=https://fvfqzhmqfiuctelppaeh.supabase.co"
    echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZnF6aG1xZml1Y3RlbHBwYWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzc3NzIsImV4cCI6MjA3ODYxMzc3Mn0.c2HeYl2lI0QauIdBM7QhLXc-tiJ8rm6adQAFLN4wVHM"
    echo ""
    exit 1
fi

# .env.local에서 환경 변수 로드
export $(grep -v '^#' .env.local | xargs)

# 개발용 설정 파일 생성
echo "🔧 개발용 Supabase 설정 파일 생성 중..."

cat > supabase-config.js << EOF
// 개발용 Supabase 설정 파일 (자동 생성됨)
window.SUPABASE_CONFIG = {
    url: '${SUPABASE_URL}',
    anonKey: '${SUPABASE_ANON_KEY}',
    buildTime: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
    environment: 'development'
};

console.log('🔧 개발용 Supabase 설정 로드됨:', {
    url: window.SUPABASE_CONFIG.url,
    environment: window.SUPABASE_CONFIG.environment,
    buildTime: window.SUPABASE_CONFIG.buildTime
});
EOF

echo "✅ 개발용 설정 파일이 생성되었습니다."
echo ""

# 사용 가능한 HTTP 서버 확인 및 실행
if command -v python3 &> /dev/null; then
    echo "🌐 Python HTTP 서버 시작 (포트 8000)"
    echo "📱 브라우저에서 http://localhost:8000 을 열어주세요"
    echo "🛑 서버 중지: Ctrl+C"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🌐 Python HTTP 서버 시작 (포트 8000)"
    echo "📱 브라우저에서 http://localhost:8000 을 열어주세요"
    echo "🛑 서버 중지: Ctrl+C"
    echo ""
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "🌐 Node.js serve 서버 시작"
    echo "📱 브라우저에서 표시되는 URL을 열어주세요"
    echo "🛑 서버 중지: Ctrl+C"
    echo ""
    npx serve -s . -p 8000
else
    echo "⚠️  HTTP 서버를 찾을 수 없습니다."
    echo ""
    echo "다음 중 하나를 설치해주세요:"
    echo "  1. Python: python3 -m http.server 8000"
    echo "  2. Node.js: npx serve -s . -p 8000"
    echo "  3. VS Code Live Server 확장"
    echo ""
    echo "또는 수동으로 서버를 실행하고 http://localhost:포트번호 로 접속하세요."
fi