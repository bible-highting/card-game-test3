// 게임 상태 변수들
let canvas, ctx;
let gameState = 'playing';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;
let attempts = 0;
let startTime;
let timer;
let currentScore = 0;

// 환경 설정
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' && 
                     window.location.hostname !== '';
const IS_DEVELOPMENT = !IS_PRODUCTION;

// 수파베이스 설정 (빌드 시 생성되거나 config.js에서 가져옴)
function getSupabaseConfig() {
    // 빌드 시 생성된 설정이 있는 경우
    if (window.SUPABASE_CONFIG) {
        return {
            url: window.SUPABASE_CONFIG.url,
            key: window.SUPABASE_CONFIG.anonKey
        };
    }
    
    // config.js 기반 설정이 있는 경우
    if (window.GAME_CONFIG) {
        return {
            url: window.GAME_CONFIG.supabaseUrl,
            key: window.GAME_CONFIG.supabaseAnonKey
        };
    }
    
    // fallback (설정이 로드되지 않은 경우)
    console.error('❌ Supabase 설정을 찾을 수 없습니다!');
    console.info('💡 환경 변수나 설정 파일을 확인해주세요.');
    return {
        url: '',
        key: ''
    };
}

// 프로덕션 환경에서 에러 로깅
if (IS_PRODUCTION) {
    window.addEventListener('error', (e) => {
        console.error('🎮 Game Error:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('🔥 Unhandled Promise Rejection:', e.reason);
    });
}

// 카드 설정
const CARD_WIDTH = 90;
const CARD_HEIGHT = 120;
const CARD_MARGIN = 10;
const GRID_COLS = 4;
const GRID_ROWS = 4;

// 카드 이미지/아이콘 배열 (이모지 사용)
const cardSymbols = ['🎈', '🎯', '🎭', '🎪', '🎨', '🎵', '🎸', '🎤'];

// 카드 클래스
class Card {
    constructor(x, y, symbol, index) {
        this.x = x;
        this.y = y;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.symbol = symbol;
        this.index = index;
        this.isFlipped = false;
        this.isMatched = false;
        this.flipProgress = 0; // 0: 뒷면, 1: 앞면
        this.animating = false;
        this.glowEffect = 0;
    }

    // 마우스 클릭 감지
    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }

    // 카드 뒤집기 애니메이션
    flip() {
        if (this.animating || this.isMatched) return;
        
        this.animating = true;
        this.isFlipped = !this.isFlipped;
        
        const startProgress = this.flipProgress;
        const targetProgress = this.isFlipped ? 1 : 0;
        const animationDuration = 300; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // 3D 뒤집기 효과를 위한 sine wave 사용
            const easeInOut = 0.5 - Math.cos(progress * Math.PI) / 2;
            this.flipProgress = startProgress + (targetProgress - startProgress) * easeInOut;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.flipProgress = targetProgress;
                this.animating = false;
            }
        };
        
        animate();
    }

    // 매치 애니메이션
    match() {
        this.isMatched = true;
        this.isFlipped = true;
        
        // 반짝이는 효과
        const startTime = Date.now();
        const glowAnimate = () => {
            const elapsed = Date.now() - startTime;
            this.glowEffect = Math.sin(elapsed * 0.01) * 0.5 + 0.5;
            
            if (elapsed < 1000) {
                requestAnimationFrame(glowAnimate);
            } else {
                this.glowEffect = 0;
            }
        };
        
        glowAnimate();
        
        // 파티클 효과 생성
        createParticles(this.x + this.width/2, this.y + this.height/2);
    }

    // 카드 그리기
    draw() {
        ctx.save();

        // 3D 뒤집기 효과
        const scaleX = Math.cos(this.flipProgress * Math.PI);
        const centerX = this.x + this.width / 2;
        
        ctx.translate(centerX, 0);
        ctx.scale(Math.abs(scaleX), 1);
        ctx.translate(-centerX, 0);

        // 그림자 효과
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // 매치된 카드 글로우 효과
        if (this.isMatched && this.glowEffect > 0) {
            ctx.shadowColor = `rgba(255, 215, 0, ${this.glowEffect})`;
            ctx.shadowBlur = 20;
        }

        // 카드 배경
        ctx.fillStyle = this.flipProgress < 0.5 ? '#4a90e2' : '#fff';
        ctx.strokeStyle = '#2c5aa0';
        ctx.lineWidth = 2;
        
        this.drawRoundedRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.stroke();

        // 카드 내용
        if (this.flipProgress < 0.5) {
            // 뒷면 - 패턴 그리기
            this.drawBackPattern();
        } else {
            // 앞면 - 심볼 그리기
            this.drawSymbol();
        }

        ctx.restore();
    }

    // 둥근 사각형 그리기
    drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // 카드 뒷면 패턴
    drawBackPattern() {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 물음표 그리기
        ctx.fillText('?', this.x + this.width/2, this.y + this.height/2);
        
        // 장식적인 패턴
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x1 = centerX + Math.cos(angle) * 20;
            const y1 = centerY + Math.sin(angle) * 20;
            const x2 = centerX + Math.cos(angle) * 30;
            const y2 = centerY + Math.sin(angle) * 30;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    // 카드 앞면 심볼
    drawSymbol() {
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        
        ctx.fillText(
            this.symbol,
            this.x + this.width/2,
            this.y + this.height/2
        );
    }
}

// 파티클 클래스 (매치 효과용)
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 6 + 2;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // 중력
        this.life -= this.decay;
        return this.life > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

// 파티클 생성 함수
function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y));
    }
}

// 게임 초기화
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 이벤트 리스너
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // 플레이어 이름 입력 필드 엔터키 지원
    const playerNameInput = document.getElementById('playerName');
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            playerNameInput.blur();
        }
    });
    
    // 플레이어 이름 입력 시 실시간 점수 업데이트 미리보기
    playerNameInput.addEventListener('input', () => {
        updateCurrentScorePreview();
    });
    
    // 리더보드 관련 이벤트 리스너들
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleStatsBtn = document.getElementById('toggleStatsBtn');
    const refreshLeaderboardBtn = document.getElementById('refreshLeaderboard');
    
    leaderboardBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 이벤트 전파 중단
        showLeaderboard();
    });
    
    closeModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideLeaderboard();
    });
    
    toggleStatsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStatsView();
    });
    
    refreshLeaderboardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        refreshLeaderboard();
    });
    
    // 카드 생성 및 배치
    createCards();
    
    // 타이머 시작
    startTimer();
    
    // 게임 루프 시작
    gameLoop();
}

// 현재 점수 미리보기 업데이트
function updateCurrentScorePreview() {
    if (gameState === 'playing' && attempts > 0) {
        const elapsed = Date.now() - startTime;
        const previewScore = Math.max(100, 1000 - (attempts * 20) - Math.floor(elapsed / 1000));
        currentScore = previewScore;
        updateScore();
    }
}

// 카드 생성
function createCards() {
    cards = [];
    
    // 심볼 쌍 생성 (각 심볼을 2개씩)
    const symbols = [...cardSymbols, ...cardSymbols];
    
    // 카드 셔플
    for (let i = symbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    
    // 카드 위치 계산 및 생성
    const startX = (canvas.width - (GRID_COLS * (CARD_WIDTH + CARD_MARGIN) - CARD_MARGIN)) / 2;
    const startY = (canvas.height - (GRID_ROWS * (CARD_HEIGHT + CARD_MARGIN) - CARD_MARGIN)) / 2;
    
    let symbolIndex = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const x = startX + col * (CARD_WIDTH + CARD_MARGIN);
            const y = startY + row * (CARD_HEIGHT + CARD_MARGIN);
            
            cards.push(new Card(x, y, symbols[symbolIndex], symbolIndex));
            symbolIndex++;
        }
    }
}

// 마우스 클릭 처리
function handleClick(event) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // 클릭된 카드 찾기
    const clickedCard = cards.find(card => 
        card.isClicked(mouseX, mouseY) && !card.isFlipped && !card.animating
    );
    
    if (clickedCard && flippedCards.length < 2) {
        clickedCard.flip();
        flippedCards.push(clickedCard);
        
        // 두 카드가 뒤집어졌을 때
        if (flippedCards.length === 2) {
            attempts++;
            updateAttempts();
            updateCurrentScorePreview(); // 실시간 점수 업데이트
            
            setTimeout(() => {
                checkMatch();
            }, 600); // 카드가 완전히 뒤집어진 후 체크
        }
    }
}

// 마우스 움직임 처리 (호버 효과용)
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // 카드 위에 마우스가 있는지 확인
    const hoveredCard = cards.find(card => 
        card.isClicked(mouseX, mouseY) && !card.isFlipped && !card.animating
    );
    
    canvas.style.cursor = hoveredCard ? 'pointer' : 'default';
}

// 카드 매치 확인
function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.symbol === card2.symbol) {
        // 매치 성공
        card1.match();
        card2.match();
        matchedPairs++;
        updateMatchCount();
        
        // 게임 완료 확인
        if (matchedPairs === totalPairs) {
            gameState = 'completed';
            setTimeout(() => {
                showVictory();
            }, 1000);
        }
    } else {
        // 매치 실패 - 카드 다시 뒤집기
        setTimeout(() => {
            card1.flip();
            card2.flip();
        }, 500);
    }
    
    flippedCards = [];
}

// 점수 계산 함수
function calculateScore() {
    const completionTime = Date.now() - startTime;
    // 기본 1000점에서 시도 횟수와 시간에 따라 차감
    const score = Math.max(100, 1000 - (attempts * 20) - Math.floor(completionTime / 1000));
    return { score, completionTime };
}

// 승리 표시
async function showVictory() {
    const { score, completionTime } = calculateScore();
    currentScore = score;
    updateScore();
    
    // 승리 파티클 효과
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height * 0.3
            );
        }, i * 50);
    }
    
    // 승리 메시지와 점수 저장
    setTimeout(async () => {
        const playerName = document.getElementById('playerName').value.trim() || '익명';
        
        // 수파베이스에 점수 저장
        try {
            await saveScoreToSupabase(playerName, attempts, completionTime);
            
            const showRanking = confirm(`🎉 축하합니다! 게임을 완료했습니다!\n\n플레이어: ${playerName}\n시도 횟수: ${attempts}\n시간: ${formatTime(completionTime)}\n점수: ${score}점\n\n점수가 기록되었습니다!\n\n순위표를 확인하시겠습니까?`);
            
            if (showRanking) {
                setTimeout(() => showLeaderboard(), 500);
            }
        } catch (error) {
            console.error('점수 저장 실패:', error);
            alert(`🎉 축하합니다! 게임을 완료했습니다!\n플레이어: ${playerName}\n시도 횟수: ${attempts}\n시간: ${formatTime(completionTime)}\n점수: ${score}점\n\n❌ 점수 저장에 실패했습니다.\n네트워크 연결을 확인해주세요.`);
        }
    }, 1000);
}

// 타이머 시작
function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);
}

// 타이머 업데이트
function updateTimer() {
    if (gameState === 'playing') {
        const elapsed = Date.now() - startTime;
        document.getElementById('timer').textContent = formatTime(elapsed);
        
        // 게임 진행 중 실시간 점수 업데이트
        if (attempts > 0) {
            updateCurrentScorePreview();
        }
    }
}

// 시간 포맷팅
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

// UI 업데이트 함수들
function updateMatchCount() {
    document.getElementById('matchCount').textContent = matchedPairs;
}

function updateAttempts() {
    document.getElementById('attempts').textContent = attempts;
}

function updateScore() {
    document.getElementById('score').textContent = currentScore;
}

// 게임 리셋
function resetGame() {
    gameState = 'playing';
    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    currentScore = 0;
    particles = [];
    
    if (timer) {
        clearInterval(timer);
    }
    
    updateMatchCount();
    updateAttempts();
    updateScore();
    createCards();
    startTimer();
}

// 게임 루프
function gameLoop() {
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 카드 그리기
    cards.forEach(card => card.draw());
    
    // 파티클 업데이트 및 그리기
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });
    
    requestAnimationFrame(gameLoop);
}

// 수파베이스 API 함수들
async function saveScoreToSupabase(playerName, attempts, completionTime) {
    const config = getSupabaseConfig();
    const response = await fetch(`${config.url}/rest/v1/game_scores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.key}`,
            'apikey': config.key
        },
        body: JSON.stringify({
            player_name: playerName,
            attempts: attempts,
            completion_time: completionTime,
            total_pairs: totalPairs,
            difficulty: 'normal'
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getLeaderboard(limit = 20) {
    const config = getSupabaseConfig();
    const response = await fetch(
        `${config.url}/rest/v1/game_scores?select=*&order=score.desc,created_at.desc&limit=${limit}`,
        {
            headers: {
                'Authorization': `Bearer ${config.key}`,
                'apikey': config.key
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getGameStats() {
    const config = getSupabaseConfig();
    const response = await fetch(
        `${config.url}/rest/v1/game_scores?select=score,attempts,completion_time,created_at`,
        {
            headers: {
                'Authorization': `Bearer ${config.key}`,
                'apikey': config.key
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const scores = await response.json();
    
    if (scores.length === 0) {
        return {
            totalGames: 0,
            averageScore: 0,
            bestScore: 0,
            averageTime: 0,
            averageAttempts: 0
        };
    }

    return {
        totalGames: scores.length,
        averageScore: Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length),
        bestScore: Math.max(...scores.map(s => s.score)),
        averageTime: Math.round(scores.reduce((sum, s) => sum + s.completion_time, 0) / scores.length / 1000),
        averageAttempts: Math.round(scores.reduce((sum, s) => sum + s.attempts, 0) / scores.length)
    };
}

let showingStats = false;

// 순위표 표시/숨김 함수들
async function showLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    const listDiv = document.getElementById('leaderboardList');
    
    // 모달 초기화 플래그 설정
    modalInitialized = true;
    
    // 모달 애니메이션
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 50); // 딜레이를 50ms로 증가
    
    if (showingStats) {
        await loadGameStats();
    } else {
        await loadLeaderboardScores();
    }
}

async function loadLeaderboardScores() {
    const listDiv = document.getElementById('leaderboardList');
    const refreshBtn = document.getElementById('refreshLeaderboard');
    
    // 로딩 상태
    refreshBtn.style.opacity = '0.6';
    refreshBtn.style.pointerEvents = 'none';
    listDiv.innerHTML = `
        <div class="loading-spinner">
            <div style="text-align: center; padding: 40px; color: #666;">
                <div class="spinner"></div>
                <p style="margin-top: 15px;">순위표를 불러오는 중...</p>
            </div>
        </div>
    `;
    
    try {
        const scores = await getLeaderboard(15);
        
        if (scores.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>🎯 아직 기록이 없습니다</h3>
                    <p>첫 번째 게임을 완료하여 순위표에 이름을 올려보세요!</p>
                </div>
            `;
        } else {
            let html = '<div style="margin-bottom: 15px;">';
            
            scores.forEach((score, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}위`;
                const date = new Date(score.created_at).toLocaleDateString('ko-KR', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const time = Math.round(score.completion_time / 1000);
                const rankClass = rank <= 3 ? `rank-${rank}` : '';
                
                html += `
                    <div class="leaderboard-item ${rankClass}">
                        <div class="leaderboard-rank">${medal}</div>
                        <div class="leaderboard-name">${escapeHtml(score.player_name)}</div>
                        <div class="leaderboard-stats">
                            <div style="font-weight: bold; color: #333; font-size: 1.1em;">${score.score}점</div>
                            <div style="color: #666;">${score.attempts}회 시도 • ${time}초</div>
                            <div style="font-size: 0.8em; color: #888;">${date}</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            listDiv.innerHTML = html;
        }
        
    } catch (error) {
        console.error('순위표 로딩 실패:', error);
        listDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                <h3>❌ 순위표 로딩 실패</h3>
                <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
                <button onclick="refreshLeaderboard()" style="margin-top: 15px; padding: 10px 20px; 
                        background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    다시 시도
                </button>
            </div>
        `;
    } finally {
        refreshBtn.style.opacity = '1';
        refreshBtn.style.pointerEvents = 'auto';
    }
}

async function loadGameStats() {
    const listDiv = document.getElementById('leaderboardList');
    
    listDiv.innerHTML = `
        <div class="loading-spinner">
            <div style="text-align: center; padding: 40px; color: #666;">
                <div class="spinner"></div>
                <p style="margin-top: 15px;">통계를 불러오는 중...</p>
            </div>
        </div>
    `;
    
    try {
        const stats = await getGameStats();
        
        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalGames}</div>
                    <div class="stat-label">총 게임 수</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.bestScore}</div>
                    <div class="stat-label">최고 점수</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageScore}</div>
                    <div class="stat-label">평균 점수</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageAttempts}</div>
                    <div class="stat-label">평균 시도</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageTime}초</div>
                    <div class="stat-label">평균 시간</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="toggleStatsView()" style="padding: 10px 20px; background: #667eea; 
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                    🏆 순위표 보기
                </button>
            </div>
        `;
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('통계 로딩 실패:', error);
        listDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                <h3>❌ 통계 로딩 실패</h3>
                <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 순위표/통계 토글
async function toggleStatsView() {
    showingStats = !showingStats;
    
    // 버튼 텍스트 업데이트
    const statsButton = document.querySelector('button[onclick="showLeaderboard()"]');
    if (statsButton) {
        statsButton.innerHTML = showingStats ? '🏆 순위표' : '📊 전체 통계';
    }
    
    if (showingStats) {
        await loadGameStats();
    } else {
        await loadLeaderboardScores();
    }
}

// 새로고침 함수
async function refreshLeaderboard() {
    if (showingStats) {
        await loadGameStats();
    } else {
        await loadLeaderboardScores();
    }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        showingStats = false; // 리셋
        modalInitialized = false; // 초기화 플래그 리셋
    }, 300);
}

// 모달 외부 클릭시 닫기 (안전한 이벤트 처리)
let modalInitialized = false;
document.addEventListener('click', (event) => {
    // 모달이 아직 초기화되지 않았으면 무시
    if (!modalInitialized) return;
    
    const modal = document.getElementById('leaderboardModal');
    const content = document.getElementById('leaderboardContent');
    
    // 모달이 보이고 있는 상태에서만 처리
    if (modal && modal.style.display === 'flex' && modal.classList.contains('show')) {
        // 모달 컨텐츠 외부를 클릭했을 때만 닫기
        if (content && !content.contains(event.target)) {
            hideLeaderboard();
        }
    }
});

// ESC 키로 순위표 닫기
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        hideLeaderboard();
    }
});

// 설정 대기 및 게임 초기화
function waitForConfigAndStart() {
    const maxWait = 5000; // 5초 대기
    const startTime = Date.now();
    
    function checkConfig() {
        // 설정이 로드되었는지 확인
        if (window.SUPABASE_CONFIG || window.GAME_CONFIG || window.ENV) {
            console.log('✅ 설정 로드 완료 - 게임 시작');
            initGame();
            return;
        }
        
        // 타임아웃 체크
        if (Date.now() - startTime > maxWait) {
            console.warn('⚠️ 설정 로드 타임아웃 - 기본값으로 시작');
            initGame();
            return;
        }
        
        // 100ms 후 재시도
        setTimeout(checkConfig, 100);
    }
    
    checkConfig();
}

// DOM 로드 완료 후 설정 대기
window.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM 로드 완료 - 설정 확인 중...');
    waitForConfigAndStart();
});