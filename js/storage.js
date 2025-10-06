// 로컬 스토리지 관리
export const Storage = {
    // 키 상수
    KEYS: {
        LOTTO_HISTORY: 'lottoHistory'
    },

    // 게임 히스토리 로드
    loadGameHistory() {
        try {
            const data = localStorage.getItem(this.KEYS.LOTTO_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('게임 히스토리 로드 실패:', error);
            return [];
        }
    },

    // 게임 히스토리 저장
    saveGameHistory(history) {
        try {
            localStorage.setItem(this.KEYS.LOTTO_HISTORY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('게임 히스토리 저장 실패:', error);
            return false;
        }
    },

    // 게임 추가
    addGame(game) {
        const history = this.loadGameHistory();
        history.push(game);
        return this.saveGameHistory(history);
    },

    // 게임 업데이트
    updateGame(gameId, updates) {
        const history = this.loadGameHistory();
        const gameIndex = history.findIndex(game => game.id === gameId);
        
        if (gameIndex !== -1) {
            history[gameIndex] = { ...history[gameIndex], ...updates };
            return this.saveGameHistory(history);
        }
        
        return false;
    },

    // 히스토리 초기화
    clearHistory() {
        try {
            localStorage.removeItem(this.KEYS.LOTTO_HISTORY);
            return true;
        } catch (error) {
            console.error('히스토리 초기화 실패:', error);
            return false;
        }
    },

    // 데이터 백업 (JSON 파일로 다운로드)
    exportData() {
        const data = {
            gameHistory: this.loadGameHistory(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lotto-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 데이터 복원
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.gameHistory && Array.isArray(data.gameHistory)) {
                        this.saveGameHistory(data.gameHistory);
                        resolve(data.gameHistory.length);
                    } else {
                        reject(new Error('잘못된 백업 파일 형식입니다.'));
                    }
                } catch (error) {
                    reject(new Error('파일을 읽을 수 없습니다.'));
                }
            };
            
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file);
        });
    }
};