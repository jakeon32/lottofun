// 메인 애플리케이션 진입점
import { AppState } from './state.js';
import { Storage } from './storage.js';
import { UIComponents } from './ui.js';
import { NumberGenerator } from './generator.js';
import { Utils } from './utils.js';

// 전역 객체에 모듈들 노출 (기존 코드 호환성)
window.AppState = AppState;
window.Storage = Storage;
window.UIComponents = UIComponents;
window.NumberGenerator = NumberGenerator;
window.Utils = Utils;

// 번호 선택 관리
window.NumberSelection = {
    toggleNumberSelection(number) {
        const state = AppState.store.getState();
        const numberElement = document.querySelector(`[data-number="${number}"]`);
        
        if (state.userSelectedNumbers.includes(number)) {
            // 번호 선택 해제
            numberElement.classList.add('deselecting');
            setTimeout(() => {
                const newNumbers = state.userSelectedNumbers.filter(n => n !== number);
                AppState.store.dispatch(AppState.actions.setUserNumbers(newNumbers));
            }, 150);
        } else {
            // 번호 선택
            if (state.userSelectedNumbers.length >= 6) {
                Utils.showMaxSelectionAlert();
                return;
            }
            
            const newNumbers = [...state.userSelectedNumbers, number].sort((a, b) => a - b);
            AppState.store.dispatch(AppState.actions.setUserNumbers(newNumbers));
        }
    },

    removeUserNumber(number) {
        const state = AppState.store.getState();
        const newNumbers = state.userSelectedNumbers.filter(n => n !== number);
        AppState.store.dispatch(AppState.actions.setUserNumbers(newNumbers));
    },

    clearUserNumbers() {
        const selectedElements = document.querySelectorAll('.grid-number.selected');
        
        selectedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('deselecting');
            }, index * 50);
        });
        
        setTimeout(() => {
            AppState.store.dispatch(AppState.actions.clearCurrentGame());
        }, selectedElements.length * 50 + 150);
    }
};

// 게임 생성 관리
window.GameGeneration = {
    generateLottoSet() {
        const state = AppState.store.getState();
        
        try {
            const gameSet = NumberGenerator.generateGameSet(state.userSelectedNumbers);
            AppState.store.dispatch(AppState.actions.setCurrentGameSet(gameSet));
            
            UIComponents.displayGameSet(gameSet);
            document.getElementById('lottoSet').style.display = 'block';
            document.getElementById('saveSection').style.display = 'block';
            document.getElementById('saveSection').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert(error.message);
        }
    },

    generateSmartNumbers() {
        const state = AppState.store.getState();
        const gameHistory = Storage.loadGameHistory();
        
        try {
            const smartNumbers = NumberGenerator.generateSmartNumbers(gameHistory, state.userSelectedNumbers);
            AppState.store.dispatch(AppState.actions.setCurrentLotto(smartNumbers));
            this.generateLottoSet();
        } catch (error) {
            alert(error.message);
        }
    }
};

// 게임 저장 관리
window.GameSaving = {
    savePendingGame() {
        const gameRound = document.getElementById('gameRound').value;
        const purchaseDate = document.getElementById('purchaseDate').value;
        const state = AppState.store.getState();
        
        if (!gameRound) {
            alert('게임 회차를 입력해주세요.');
            return;
        }
        
        if (state.currentGameSet.length === 0) {
            alert('먼저 5게임 세트를 생성해주세요.');
            return;
        }
        
        const gameSetData = {
            id: Date.now(),
            round: parseInt(gameRound),
            gameSet: state.currentGameSet,
            userNumbers: [...state.userSelectedNumbers],
            results: {},
            totalAmount: 0,
            cost: 5000,
            date: purchaseDate || Utils.formatDate(),
            purchaseDate: purchaseDate || Utils.formatDate(),
            status: 'pending',
            type: 'set'
        };
        
        if (Storage.addGame(gameSetData)) {
            // UI 초기화
            document.getElementById('gameRound').value = '';
            document.getElementById('purchaseDate').value = Utils.getTodayISO();
            document.getElementById('saveSection').style.display = 'none';
            document.getElementById('lottoSet').style.display = 'none';
            
            // 상태 초기화
            AppState.store.dispatch(AppState.actions.clearCurrentGame());
            
            alert('5게임 세트가 저장되었습니다! (총 5,000원)\n추첨 후 "게임 기록"에서 결과를 입력하세요.');
            
            if (window.Statistics) {
                window.Statistics.updateStatistics();
            }
        } else {
            alert('저장에 실패했습니다.');
        }
    }
};

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 초기 상태 설정
    const gameHistory = Storage.loadGameHistory();
    AppState.store.dispatch(AppState.actions.setGameHistory(gameHistory));
    
    // UI 초기화
    UIComponents.initialize();
    
    // 초기 통계 업데이트
    if (window.Statistics) {
        window.Statistics.updateStatistics();
    }
    
    console.log('🎰 로또 번호 생성기 앱이 초기화되었습니다!');
    console.log('📁 모듈화된 구조:', {
        state: '상태 관리 (Redux 패턴)',
        storage: '로컬 스토리지 관리',
        generator: '번호 생성 로직',
        ui: 'UI 컴포넌트',
        utils: '유틸리티 함수'
    });
});

// 전역 함수 호환성 유지
window.generateLottoSet = window.GameGeneration.generateLottoSet;
window.generateLotto = window.GameGeneration.generateLottoSet;
window.generateSmartNumbers = window.GameGeneration.generateSmartNumbers;
window.savePendingGame = window.GameSaving.savePendingGame;
window.addUserNumber = () => {}; // 더 이상 사용 안 함
window.clearUserNumbers = window.NumberSelection.clearUserNumbers;