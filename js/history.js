// 게임 기록 관리
import { Storage } from './storage.js';
import { Utils } from './utils.js';

export const GameHistory = {
    displayGameHistory() {
        const gameHistory = Storage.loadGameHistory();
        const container = document.getElementById('gameHistory');
        
        if (gameHistory.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">저장된 게임이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = '';
        
        gameHistory.reverse().forEach(game => {
            const gameElement = document.createElement('div');
            const isGameSet = game.type === 'set' && game.gameSet;
            const isPending = game.status === 'pending';
            
            if (isGameSet) {
                this.renderGameSetItem(gameElement, game, isPending);
            } else {
                this.renderSingleGameItem(gameElement, game, isPending);
            }
            
            container.appendChild(gameElement);
        });
    },

    renderGameSetItem(gameElement, game, isPending) {
        const hasAnyResult = game.results && Object.keys(game.results).length > 0;
        const totalWinnings = hasAnyResult ? Object.values(game.results).reduce((sum, result) => sum + (result.amount || 0), 0) : 0;
        
        gameElement.className = `history-item ${totalWinnings > 0 ? 'win' : ''}`;
        
        gameElement.innerHTML = `
            <div class="history-header-info">
                <span class="round-info">${game.round}회차 (5게임 세트)</span>
                <span class="date-info">${game.date}</span>
            </div>
            <div class="game-set-display">
                ${game.gameSet.map(gameData => `
                    <div class="mini-game-row">
                        <span class="mini-game-label">${gameData.game}</span>
                        <div class="mini-game-numbers">
                            ${gameData.numbers.map(num => {
                                const isUserSelected = game.userNumbers.includes(num);
                                return `<div class="mini-number-ball ${isUserSelected ? 'user-selected' : ''}" style="background: ${Utils.getNumberColor(num)};">${num}</div>`;
                            }).join('')}
                        </div>
                        <div class="mini-game-result">
                            ${game.results[gameData.game] ? 
                                `<span class="mini-result ${game.results[gameData.game].result !== '꽝' ? 'win' : 'lose'}">${game.results[gameData.game].result}</span>` :
                                '<span class="mini-pending">대기</span>'
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="history-result">
                <span class="cost-info">비용: ${game.cost.toLocaleString()}원</span>
                ${isPending ? 
                    `<span class="pending-status">결과 대기</span>
                     <button class="result-input-btn" onclick="GameHistory.showGameSetResultForm(${game.id})">결과 입력</button>` :
                    `<span class="win-amount">총 당첨: ${totalWinnings.toLocaleString()}원</span>`
                }
            </div>
            ${isPending ? `<div id="result-form-${game.id}" style="display: none;"></div>` : ''}
        `;
    },

    renderSingleGameItem(gameElement, game, isPending) {
        const hasResult = game.result && game.result !== null;
        
        gameElement.className = `history-item ${hasResult && game.result !== '꽝' ? 'win' : ''}`;
        
        gameElement.innerHTML = `
            <div class="history-header-info">
                <span class="round-info">${game.round}회차</span>
                <span class="date-info">${game.date}</span>
            </div>
            <div class="history-numbers">
                ${(game.numbers || []).map(num => {
                    const isUserSelected = (game.userNumbers || []).includes(num);
                    return `<div class="number-ball ${isUserSelected ? 'user-selected' : ''}" style="background: ${Utils.getNumberColor(num)}; ${isUserSelected ? 'border: 3px solid #ffd700;' : ''}">${num}</div>`;
                }).join('')}
            </div>
            <div class="history-result">
                ${isPending ? 
                    `<span class="pending-status">결과 대기</span>
                     <button class="result-input-btn" onclick="GameHistory.showResultForm(${game.id})">결과 입력</button>` :
                    `<span class="win-status ${game.result !== '꽝' ? 'win' : 'lose'}">${game.result}</span>
                     <span class="win-amount">${(game.amount || 0).toLocaleString()}원</span>`
                }
            </div>
            ${isPending ? `<div id="result-form-${game.id}" style="display: none;"></div>` : ''}
        `;
    },

    clearHistory() {
        if (confirm('모든 게임 기록을 삭제하시겠습니까?')) {
            Storage.clearHistory();
            this.displayGameHistory();
            if (window.Statistics) {
                window.Statistics.updateStatistics();
            }
        }
    },

    showResultForm(gameId) {
        const formContainer = document.getElementById(`result-form-${gameId}`);
        
        if (formContainer.style.display === 'none') {
            formContainer.style.display = 'block';
            formContainer.innerHTML = `
                <div class="result-form">
                    <h4>🎯 추첨 결과 입력</h4>
                    <div class="form-row">
                        <label>당첨 결과:</label>
                        <select id="result-${gameId}">
                            <option value="꽝">꽝</option>
                            <option value="5등">5등 (3개 일치)</option>
                            <option value="4등">4등 (4개 일치)</option>
                            <option value="3등">3등 (5개 일치)</option>
                            <option value="2등">2등 (5개 일치 + 보너스)</option>
                            <option value="1등">1등 (6개 일치)</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>당첨 금액:</label>
                        <input type="number" id="amount-${gameId}" placeholder="당첨 금액 (원)">
                    </div>
                    <div class="form-actions">
                        <button class="cancel-btn" onclick="GameHistory.hideResultForm(${gameId})">취소</button>
                        <button class="submit-btn" onclick="GameHistory.submitResult(${gameId})">저장</button>
                    </div>
                </div>
            `;
            
            document.getElementById(`result-${gameId}`).addEventListener('change', function(e) {
                const amountInput = document.getElementById(`amount-${gameId}`);
                if (e.target.value === '꽝') {
                    amountInput.value = '0';
                } else {
                    amountInput.focus();
                }
            });
        } else {
            this.hideResultForm(gameId);
        }
    },

    hideResultForm(gameId) {
        const formContainer = document.getElementById(`result-form-${gameId}`);
        formContainer.style.display = 'none';
    },

    submitResult(gameId) {
        const result = document.getElementById(`result-${gameId}`).value;
        const amount = parseInt(document.getElementById(`amount-${gameId}`).value) || 0;
        
        const updates = {
            result: result,
            amount: amount,
            status: 'completed'
        };
        
        if (Storage.updateGame(gameId, updates)) {
            this.displayGameHistory();
            if (window.Statistics) {
                window.Statistics.updateStatistics();
            }
            
            if (result !== '꽝') {
                alert(`🎉 축하합니다! ${result} 당첨! ${amount.toLocaleString()}원`);
            } else {
                alert('결과가 저장되었습니다.');
            }
        }
    },

    showGameSetResultForm(gameId) {
        const formContainer = document.getElementById(`result-form-${gameId}`);
        
        if (formContainer.style.display === 'none') {
            formContainer.style.display = 'block';
            
            const gameHistory = Storage.loadGameHistory();
            const game = gameHistory.find(g => g.id === gameId);
            
            if (!game || !game.gameSet) return;
            
            formContainer.innerHTML = `
                <div class="result-form">
                    <h4>🎯 5게임 세트 결과 입력</h4>
                    ${game.gameSet.map(gameData => `
                        <div class="game-result-row">
                            <div class="game-result-header">
                                <span class="game-label-small">${gameData.game}</span>
                                <div class="game-numbers-small">
                                    ${gameData.numbers.map(num => 
                                        `<span class="number-small" style="background: ${Utils.getNumberColor(num)};">${num}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="game-result-inputs">
                                <select id="result-${gameId}-${gameData.game}" class="mini-select">
                                    <option value="꽝">꽝</option>
                                    <option value="5등">5등</option>
                                    <option value="4등">4등</option>
                                    <option value="3등">3등</option>
                                    <option value="2등">2등</option>
                                    <option value="1등">1등</option>
                                </select>
                                <input type="number" id="amount-${gameId}-${gameData.game}" 
                                       placeholder="금액" class="mini-input">
                            </div>
                        </div>
                    `).join('')}
                    <div class="form-actions">
                        <button class="cancel-btn" onclick="GameHistory.hideResultForm(${gameId})">취소</button>
                        <button class="submit-btn" onclick="GameHistory.submitGameSetResult(${gameId})">모두 저장</button>
                    </div>
                </div>
            `;
            
            game.gameSet.forEach(gameData => {
                document.getElementById(`result-${gameId}-${gameData.game}`).addEventListener('change', function(e) {
                    const amountInput = document.getElementById(`amount-${gameId}-${gameData.game}`);
                    if (e.target.value === '꽝') {
                        amountInput.value = '0';
                    } else {
                        amountInput.focus();
                    }
                });
            });
        } else {
            this.hideResultForm(gameId);
        }
    },

    submitGameSetResult(gameId) {
        const gameHistory = Storage.loadGameHistory();
        const game = gameHistory.find(g => g.id === gameId);
        
        if (!game) return;
        
        const results = {};
        let totalAmount = 0;
        let winCount = 0;
        
        game.gameSet.forEach(gameData => {
            const result = document.getElementById(`result-${gameId}-${gameData.game}`).value;
            const amount = parseInt(document.getElementById(`amount-${gameId}-${gameData.game}`).value) || 0;
            
            results[gameData.game] = { result, amount };
            totalAmount += amount;
            
            if (result !== '꽝') {
                winCount++;
            }
        });
        
        const updates = {
            results: results,
            totalAmount: totalAmount,
            status: 'completed'
        };
        
        if (Storage.updateGame(gameId, updates)) {
            this.displayGameHistory();
            if (window.Statistics) {
                window.Statistics.updateStatistics();
            }
            
            if (winCount > 0) {
                alert(`🎉 축하합니다! 5게임 중 ${winCount}게임 당첨!\n총 당첨금: ${totalAmount.toLocaleString()}원`);
            } else {
                alert('모든 결과가 저장되었습니다.');
            }
        }
    }
};

// 전역 객체에 노출
window.GameHistory = GameHistory;