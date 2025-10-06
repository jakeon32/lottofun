// 통계 관리
import { Storage } from './storage.js';

export const Statistics = {
    updateStatistics() {
        const gameHistory = Storage.loadGameHistory();
        
        const totalGames = gameHistory.length;
        let totalInvestment = 0;
        let totalWinnings = 0;
        let winCount = 0;
        let bestWin = 0;
        
        gameHistory.forEach(game => {
            // 투자 금액 계산
            totalInvestment += game.cost || (game.type === 'set' ? 5000 : 1000);
            
            // 당첨 금액 계산
            if (game.type === 'set' && game.results) {
                // 5게임 세트의 경우
                const setWinnings = Object.values(game.results).reduce((sum, result) => sum + (result.amount || 0), 0);
                totalWinnings += setWinnings;
                
                // 당첨 게임 수 계산 (5게임 중 당첨된 게임)
                const setWinCount = Object.values(game.results).filter(result => result.result && result.result !== '꽝').length;
                winCount += setWinCount;
                
                // 최고 당첨 업데이트
                if (setWinnings > bestWin) {
                    bestWin = setWinnings;
                }
            } else {
                // 기존 단일 게임의 경우
                const gameWinnings = game.amount || 0;
                totalWinnings += gameWinnings;
                
                if (game.result && game.result !== '꽝' && game.result !== null) {
                    winCount++;
                }
                
                if (gameWinnings > bestWin) {
                    bestWin = gameWinnings;
                }
            }
        });
        
        const profitRate = totalInvestment > 0 ? ((totalWinnings - totalInvestment) / totalInvestment * 100).toFixed(1) : 0;
        
        // DOM 업데이트
        this.updateStatisticsDOM({
            totalGames,
            totalInvestment,
            totalWinnings,
            profitRate,
            winCount,
            bestWin
        });
        
        this.updateFrequentNumbers(gameHistory);
    },

    updateStatisticsDOM(stats) {
        const elements = {
            totalGames: document.getElementById('totalGames'),
            totalInvestment: document.getElementById('totalInvestment'),
            totalWinnings: document.getElementById('totalWinnings'),
            profitRate: document.getElementById('profitRate'),
            winCount: document.getElementById('winCount'),
            bestWin: document.getElementById('bestWin')
        };

        if (elements.totalGames) elements.totalGames.textContent = stats.totalGames;
        if (elements.totalInvestment) elements.totalInvestment.textContent = stats.totalInvestment.toLocaleString() + '원';
        if (elements.totalWinnings) elements.totalWinnings.textContent = stats.totalWinnings.toLocaleString() + '원';
        if (elements.profitRate) elements.profitRate.textContent = stats.profitRate + '%';
        if (elements.winCount) elements.winCount.textContent = stats.winCount + '회';
        if (elements.bestWin) elements.bestWin.textContent = stats.bestWin > 0 ? stats.bestWin.toLocaleString() + '원' : '-';
    },

    updateFrequentNumbers(gameHistory) {
        const numberFreq = {};
        
        gameHistory.forEach(game => {
            const userNumbers = game.userNumbers || [];
            userNumbers.forEach(num => {
                numberFreq[num] = (numberFreq[num] || 0) + 1;
            });
        });
        
        const sortedNumbers = Object.entries(numberFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const container = document.getElementById('frequentNumbers');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (sortedNumbers.length === 0) {
            container.innerHTML = '<p style="color: #6c757d;">선택한 번호가 없습니다.</p>';
            return;
        }
        
        sortedNumbers.forEach(([number, count]) => {
            const frequentItem = document.createElement('div');
            frequentItem.className = 'frequent-number';
            
            const ball = this.createFrequentNumberBall(parseInt(number));
            
            const countSpan = document.createElement('span');
            countSpan.className = 'frequency-count';
            countSpan.textContent = `${count}회`;
            
            frequentItem.appendChild(ball);
            frequentItem.appendChild(countSpan);
            container.appendChild(frequentItem);
        });
    },

    createFrequentNumberBall(number) {
        const ball = document.createElement('div');
        ball.className = 'number-ball frequent-ball';
        ball.textContent = number;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        ball.style.background = colors[(number - 1) % colors.length];
        
        return ball;
    }
};

// 전역 객체에 노출
window.Statistics = Statistics;