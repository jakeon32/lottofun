// UI 컴포넌트 관리
import { Utils } from './utils.js';
import { AppState } from './state.js';

export const UIComponents = {
    // 탭 초기화
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // 탭별 콜백 실행
                this.handleTabChange(targetTab);
            });
        });
    },

    // 탭 변경 처리
    handleTabChange(targetTab) {
        const callbacks = {
            'statistics': () => window.Statistics?.updateStatistics(),
            'history': () => window.GameHistory?.displayGameHistory(),
            'analysis': () => window.PatternAnalysis?.updatePatternAnalysis()
        };

        if (callbacks[targetTab]) {
            callbacks[targetTab]();
        }
    },

    // 번호 그리드 초기화
    initializeNumberGrid() {
        const grid = document.getElementById('numberGrid');
        grid.innerHTML = '';
        
        for (let i = 1; i <= 45; i++) {
            const numberElement = this.createGridNumber(i);
            grid.appendChild(numberElement);
        }
        
        this.updateSelectionCount();
    },

    // 그리드 번호 생성
    createGridNumber(number) {
        const numberElement = document.createElement('div');
        numberElement.className = 'grid-number';
        numberElement.textContent = number;
        numberElement.dataset.number = number;
        
        // 클릭 이벤트
        numberElement.addEventListener('click', () => {
            window.NumberSelection?.toggleNumberSelection(number);
        });
        
        // 터치 이벤트 (모바일 최적화)
        numberElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            numberElement.style.transform = 'translateY(-1px) scale(1.02)';
        });
        
        numberElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            setTimeout(() => {
                if (!numberElement.classList.contains('selected')) {
                    numberElement.style.transform = '';
                }
            }, 100);
            window.NumberSelection?.toggleNumberSelection(number);
        });
        
        return numberElement;
    },

    // 선택 카운트 업데이트
    updateSelectionCount() {
        const state = AppState.store.getState();
        const countElement = document.getElementById('selectionCount');
        const count = state.userSelectedNumbers.length;
        
        countElement.textContent = `${count}/6`;
        
        if (count === 6) {
            countElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            countElement.style.animation = 'pulse 1s ease-in-out';
        } else {
            countElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            countElement.style.animation = '';
        }
    },

    // 선택된 번호 표시 업데이트
    updateSelectedNumbersDisplay() {
        const state = AppState.store.getState();
        const container = document.getElementById('selectedNumbers');
        container.innerHTML = '';
        
        state.userSelectedNumbers.forEach((number) => {
            const ball = Utils.createNumberBall(number, true);
            ball.addEventListener('click', () => {
                window.NumberSelection?.removeUserNumber(number);
            });
            container.appendChild(ball);
        });
    },

    // 그리드 상태 업데이트
    updateGridState() {
        const state = AppState.store.getState();
        const gridNumbers = document.querySelectorAll('.grid-number');
        const maxReached = state.userSelectedNumbers.length >= 6;
        
        gridNumbers.forEach(element => {
            const number = parseInt(element.dataset.number);
            const isSelected = state.userSelectedNumbers.includes(number);
            
            // 선택/해제 상태 업데이트
            if (isSelected) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected', 'deselecting');
            }
            
            // 비활성화 상태 업데이트
            if (maxReached && !isSelected) {
                element.classList.add('disabled');
            } else {
                element.classList.remove('disabled');
            }
        });
    },

    // 게임 세트 표시
    displayGameSet(gameSet) {
        const games = ['A', 'B', 'C', 'D', 'E'];
        
        games.forEach((gameLetter, index) => {
            setTimeout(() => {
                const container = document.getElementById(`game${gameLetter}`);
                container.innerHTML = '';
                
                const gameData = gameSet[index];
                gameData.numbers.forEach(number => {
                    const ball = Utils.createNumberBall(number);
                    if (gameData.userNumbers.includes(number)) {
                        ball.classList.add('user-selected');
                    }
                    container.appendChild(ball);
                });
            }, index * 300);
        });
        
        // 선택된 번호 표시
        const state = AppState.store.getState();
        document.getElementById('selectedNumbersInSet').textContent = 
            state.userSelectedNumbers.length > 0 ? state.userSelectedNumbers.join(', ') : '없음';
    },

    // 폼 요소 초기화
    initializeForms() {
        // 구매 날짜 기본값 설정
        const today = Utils.getTodayISO();
        const purchaseDateInput = document.getElementById('purchaseDate');
        if (purchaseDateInput) {
            purchaseDateInput.value = today;
        }

        // 키보드 이벤트 설정
        this.setupKeyboardEvents();
    },

    // 키보드 이벤트 설정
    setupKeyboardEvents() {
        const gameRoundInput = document.getElementById('gameRound');
        if (gameRoundInput) {
            gameRoundInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('purchaseDate')?.focus();
                }
            });
        }
    },

    // 상태 변경 구독
    subscribeToStateChanges() {
        AppState.store.subscribe((state) => {
            this.updateSelectionCount();
            this.updateSelectedNumbersDisplay();
            this.updateGridState();
        });
    },

    // 모든 UI 초기화
    initialize() {
        this.initializeTabs();
        this.initializeNumberGrid();
        this.initializeForms();
        this.subscribeToStateChanges();
    }
};