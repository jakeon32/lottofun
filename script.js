let userSelectedNumbers = [];
let currentLottoNumbers = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeNumberGrid();
    loadGameHistory();
    updateStatistics();
    
    // 구매 날짜 기본값을 오늘로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchaseDate').value = today;
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            if (targetTab === 'statistics') {
                updateStatistics();
            } else if (targetTab === 'history') {
                displayGameHistory();
            } else if (targetTab === 'analysis') {
                updatePatternAnalysis();
            }
        });
    });
}

function initializeNumberGrid() {
    const grid = document.getElementById('numberGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 45; i++) {
        const numberElement = document.createElement('div');
        numberElement.className = 'grid-number';
        numberElement.textContent = i;
        numberElement.dataset.number = i;
        
        numberElement.addEventListener('click', () => toggleNumberSelection(i));
        
        // 터치 이벤트 추가 (모바일 최적화)
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
            toggleNumberSelection(i);
        });
        
        grid.appendChild(numberElement);
    }
    
    updateSelectionCount();
}

function toggleNumberSelection(number) {
    const numberElement = document.querySelector(`[data-number="${number}"]`);
    
    if (userSelectedNumbers.includes(number)) {
        // 번호 선택 해제
        numberElement.classList.add('deselecting');
        setTimeout(() => {
            numberElement.classList.remove('selected', 'deselecting');
            userSelectedNumbers = userSelectedNumbers.filter(n => n !== number);
            updateSelectedNumbersDisplay();
            updateSelectionCount();
            updateGridState();
        }, 150);
    } else {
        // 번호 선택
        if (userSelectedNumbers.length >= 6) {
            showMaxSelectionAlert();
            return;
        }
        
        userSelectedNumbers.push(number);
        userSelectedNumbers.sort((a, b) => a - b);
        numberElement.classList.add('selected');
        updateSelectedNumbersDisplay();
        updateSelectionCount();
        updateGridState();
    }
}

function updateGridState() {
    const gridNumbers = document.querySelectorAll('.grid-number');
    const maxReached = userSelectedNumbers.length >= 6;
    
    gridNumbers.forEach(element => {
        const number = parseInt(element.dataset.number);
        const isSelected = userSelectedNumbers.includes(number);
        
        if (maxReached && !isSelected) {
            element.classList.add('disabled');
        } else {
            element.classList.remove('disabled');
        }
    });
}

function updateSelectionCount() {
    const countElement = document.getElementById('selectionCount');
    countElement.textContent = `${userSelectedNumbers.length}/6`;
    
    if (userSelectedNumbers.length === 6) {
        countElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        countElement.style.animation = 'pulse 1s ease-in-out';
    } else {
        countElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        countElement.style.animation = '';
    }
}

function showMaxSelectionAlert() {
    const alertElement = document.createElement('div');
    alertElement.className = 'max-selection-alert';
    alertElement.textContent = '최대 6개까지만 선택할 수 있습니다!';
    
    document.body.appendChild(alertElement);
    
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertElement);
        }, 300);
    }, 2000);
}

function addUserNumber() {
    // 이 함수는 더 이상 사용되지 않습니다 (그래픽 UI로 대체됨)
}

function updateSelectedNumbersDisplay() {
    const container = document.getElementById('selectedNumbers');
    container.innerHTML = '';
    
    userSelectedNumbers.forEach((number, index) => {
        const ball = createNumberBall(number, true);
        ball.addEventListener('click', () => removeUserNumber(number));
        container.appendChild(ball);
    });
}

function createNumberBall(number, removable = false) {
    const ball = document.createElement('div');
    ball.className = `number-ball ${removable ? 'removable' : ''}`;
    ball.textContent = number;
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    ball.style.background = colors[(number - 1) % colors.length];
    
    return ball;
}

function removeUserNumber(number) {
    userSelectedNumbers = userSelectedNumbers.filter(n => n !== number);
    updateSelectedNumbersDisplay();
}

function clearUserNumbers() {
    // 그리드에서 선택된 번호들 시각적으로 제거
    const selectedElements = document.querySelectorAll('.grid-number.selected');
    
    selectedElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('deselecting');
            setTimeout(() => {
                element.classList.remove('selected', 'deselecting');
            }, 150);
        }, index * 50);
    });
    
    // 데이터 초기화
    setTimeout(() => {
        userSelectedNumbers = [];
        updateSelectedNumbersDisplay();
        updateSelectionCount();
        updateGridState();
    }, selectedElements.length * 50 + 150);
}

function generateLotto() {
    const availableNumbers = [];
    for (let i = 1; i <= 45; i++) {
        if (!userSelectedNumbers.includes(i)) {
            availableNumbers.push(i);
        }
    }
    
    const remainingCount = 6 - userSelectedNumbers.length;
    const randomNumbers = [];
    
    for (let i = 0; i < remainingCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const selectedNumber = availableNumbers.splice(randomIndex, 1)[0];
        randomNumbers.push(selectedNumber);
    }
    
    currentLottoNumbers = [...userSelectedNumbers, ...randomNumbers].sort((a, b) => a - b);
    displayLottoNumbers();
    
    document.getElementById('saveSection').style.display = 'block';
    document.getElementById('saveSection').scrollIntoView({ behavior: 'smooth' });
}

function displayLottoNumbers() {
    const container = document.getElementById('generatedNumbers');
    container.innerHTML = '';
    
    currentLottoNumbers.forEach((number, index) => {
        setTimeout(() => {
            const ball = createNumberBall(number);
            container.appendChild(ball);
        }, index * 200);
    });
}

function savePendingGame() {
    const gameRound = document.getElementById('gameRound').value;
    const purchaseDate = document.getElementById('purchaseDate').value;
    
    if (!gameRound) {
        alert('게임 회차를 입력해주세요.');
        return;
    }
    
    const game = {
        id: Date.now(),
        round: parseInt(gameRound),
        numbers: [...currentLottoNumbers],
        userNumbers: [...userSelectedNumbers],
        result: null, // 아직 결과 없음
        amount: 0,
        cost: 1000,
        date: purchaseDate || new Date().toLocaleDateString('ko-KR'),
        purchaseDate: purchaseDate || new Date().toLocaleDateString('ko-KR'),
        status: 'pending' // 결과 대기 상태
    };
    
    let gameHistory = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    gameHistory.push(game);
    localStorage.setItem('lottoHistory', JSON.stringify(gameHistory));
    
    document.getElementById('gameRound').value = '';
    document.getElementById('purchaseDate').value = '';
    document.getElementById('saveSection').style.display = 'none';
    
    currentLottoNumbers = [];
    userSelectedNumbers = [];
    updateSelectedNumbersDisplay();
    updateSelectionCount();
    updateGridState();
    document.getElementById('generatedNumbers').innerHTML = '';
    
    alert('게임이 저장되었습니다! 추첨 후 "게임 기록"에서 결과를 입력하세요.');
    updateStatistics();
}

function saveGame() {
    // 이 함수는 이제 결과 입력용으로 사용됩니다
}

function loadGameHistory() {
    return JSON.parse(localStorage.getItem('lottoHistory') || '[]');
}

function displayGameHistory() {
    const gameHistory = loadGameHistory();
    const container = document.getElementById('gameHistory');
    
    if (gameHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">저장된 게임이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    gameHistory.reverse().forEach(game => {
        const gameElement = document.createElement('div');
        const isPending = game.status === 'pending' || game.result === null;
        const hasResult = game.result && game.result !== null;
        
        gameElement.className = `history-item ${hasResult && game.result !== '꽝' ? 'win' : ''}`;
        
        gameElement.innerHTML = `
            <div class="history-header-info">
                <span class="round-info">${game.round}회차</span>
                <span class="date-info">${game.date}</span>
            </div>
            <div class="history-numbers">
                ${game.numbers.map(num => {
                    const isUserSelected = game.userNumbers.includes(num);
                    return `<div class="number-ball ${isUserSelected ? 'user-selected' : ''}" style="background: ${getNumberColor(num)}; ${isUserSelected ? 'border: 3px solid #ffd700;' : ''}">${num}</div>`;
                }).join('')}
            </div>
            <div class="history-result">
                ${isPending ? 
                    `<span class="pending-status">결과 대기</span>
                     <button class="result-input-btn" onclick="showResultForm(${game.id})">결과 입력</button>` :
                    `<span class="win-status ${game.result !== '꽝' ? 'win' : 'lose'}">${game.result}</span>
                     <span class="win-amount">${game.amount.toLocaleString()}원</span>`
                }
            </div>
            ${isPending ? `<div id="result-form-${game.id}" style="display: none;"></div>` : ''}
        `;
        
        container.appendChild(gameElement);
    });
}

function getNumberColor(number) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[(number - 1) % colors.length];
}

function clearHistory() {
    if (confirm('모든 게임 기록을 삭제하시겠습니까?')) {
        localStorage.removeItem('lottoHistory');
        displayGameHistory();
        updateStatistics();
    }
}

function showResultForm(gameId) {
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
                    <button class="cancel-btn" onclick="hideResultForm(${gameId})">취소</button>
                    <button class="submit-btn" onclick="submitResult(${gameId})">저장</button>
                </div>
            </div>
        `;
        
        // 당첨 결과 변경 시 금액 자동 설정
        document.getElementById(`result-${gameId}`).addEventListener('change', function(e) {
            const amountInput = document.getElementById(`amount-${gameId}`);
            if (e.target.value === '꽝') {
                amountInput.value = '0';
            } else {
                amountInput.focus();
            }
        });
    } else {
        hideResultForm(gameId);
    }
}

function hideResultForm(gameId) {
    const formContainer = document.getElementById(`result-form-${gameId}`);
    formContainer.style.display = 'none';
}

function submitResult(gameId) {
    const result = document.getElementById(`result-${gameId}`).value;
    const amount = parseInt(document.getElementById(`amount-${gameId}`).value) || 0;
    
    let gameHistory = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    const gameIndex = gameHistory.findIndex(game => game.id === gameId);
    
    if (gameIndex !== -1) {
        gameHistory[gameIndex].result = result;
        gameHistory[gameIndex].amount = amount;
        gameHistory[gameIndex].status = 'completed';
        
        localStorage.setItem('lottoHistory', JSON.stringify(gameHistory));
        
        displayGameHistory();
        updateStatistics();
        
        if (result !== '꽝') {
            alert(`🎉 축하합니다! ${result} 당첨! ${amount.toLocaleString()}원`);
        } else {
            alert('결과가 저장되었습니다.');
        }
    }
}

function updateStatistics() {
    const gameHistory = loadGameHistory();
    
    const totalGames = gameHistory.length;
    const totalInvestment = totalGames * 1000;
    const totalWinnings = gameHistory.reduce((sum, game) => sum + (game.amount || 0), 0);
    const profitRate = totalInvestment > 0 ? ((totalWinnings - totalInvestment) / totalInvestment * 100).toFixed(1) : 0;
    const winCount = gameHistory.filter(game => game.result && game.result !== '꽝' && game.result !== null).length;
    const bestWin = gameHistory.length > 0 ? Math.max(...gameHistory.map(game => game.amount || 0)) : 0;
    
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalInvestment').textContent = totalInvestment.toLocaleString() + '원';
    document.getElementById('totalWinnings').textContent = totalWinnings.toLocaleString() + '원';
    document.getElementById('profitRate').textContent = profitRate + '%';
    document.getElementById('winCount').textContent = winCount + '회';
    document.getElementById('bestWin').textContent = bestWin > 0 ? bestWin.toLocaleString() + '원' : '-';
    
    updateFrequentNumbers(gameHistory);
}

function updateFrequentNumbers(gameHistory) {
    const numberFreq = {};
    
    gameHistory.forEach(game => {
        game.userNumbers.forEach(num => {
            numberFreq[num] = (numberFreq[num] || 0) + 1;
        });
    });
    
    const sortedNumbers = Object.entries(numberFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const container = document.getElementById('frequentNumbers');
    container.innerHTML = '';
    
    if (sortedNumbers.length === 0) {
        container.innerHTML = '<p style="color: #6c757d;">선택한 번호가 없습니다.</p>';
        return;
    }
    
    sortedNumbers.forEach(([number, count]) => {
        const frequentItem = document.createElement('div');
        frequentItem.className = 'frequent-number';
        
        const ball = createNumberBall(parseInt(number));
        ball.className += ' frequent-ball';
        
        const countSpan = document.createElement('span');
        countSpan.className = 'frequency-count';
        countSpan.textContent = `${count}회`;
        
        frequentItem.appendChild(ball);
        frequentItem.appendChild(countSpan);
        container.appendChild(frequentItem);
    });
}

document.getElementById('gameRound').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('purchaseDate').focus();
    }
});


function generateSmartNumbers() {
    const gameHistory = loadGameHistory();
    
    if (gameHistory.length < 3) {
        alert('더 많은 게임 데이터가 필요합니다. (최소 3게임)');
        return;
    }
    
    const numberFreq = {};
    const numberWeight = {};
    
    for (let i = 1; i <= 45; i++) {
        numberFreq[i] = 0;
        numberWeight[i] = 0;
    }
    
    gameHistory.forEach((game, index) => {
        const weight = (index + 1) / gameHistory.length;
        game.numbers.forEach(num => {
            numberFreq[num]++;
            numberWeight[num] += weight;
        });
    });
    
    const oddEvenBalance = analyzeOddEven(gameHistory);
    const rangeBalance = analyzeRange(gameHistory);
    
    const availableNumbers = [];
    for (let i = 1; i <= 45; i++) {
        if (!userSelectedNumbers.includes(i)) {
            availableNumbers.push({
                number: i,
                frequency: numberFreq[i],
                weight: numberWeight[i],
                score: calculateSmartScore(i, numberFreq[i], numberWeight[i], oddEvenBalance, rangeBalance)
            });
        }
    }
    
    availableNumbers.sort((a, b) => b.score - a.score);
    
    const remainingCount = 6 - userSelectedNumbers.length;
    const smartNumbers = [];
    
    for (let i = 0; i < Math.min(remainingCount, availableNumbers.length); i++) {
        smartNumbers.push(availableNumbers[i].number);
    }
    
    while (smartNumbers.length < remainingCount) {
        const randomIndex = Math.floor(Math.random() * (45 - userSelectedNumbers.length - smartNumbers.length));
        let count = 0;
        for (let i = 1; i <= 45; i++) {
            if (!userSelectedNumbers.includes(i) && !smartNumbers.includes(i)) {
                if (count === randomIndex) {
                    smartNumbers.push(i);
                    break;
                }
                count++;
            }
        }
    }
    
    currentLottoNumbers = [...userSelectedNumbers, ...smartNumbers].sort((a, b) => a - b);
    displaySmartNumbers();
    
    document.getElementById('saveSection').style.display = 'block';
    document.getElementById('saveSection').scrollIntoView({ behavior: 'smooth' });
}

function calculateSmartScore(number, frequency, weight, oddEvenBalance, rangeBalance) {
    let score = 0;
    
    score += (45 - frequency) * 2;
    score += weight * 10;
    
    const isOdd = number % 2 === 1;
    if ((isOdd && oddEvenBalance.odd < 50) || (!isOdd && oddEvenBalance.even < 50)) {
        score += 5;
    }
    
    const range = getRangeIndex(number);
    if (rangeBalance[range] < 20) {
        score += 3;
    }
    
    score += Math.random() * 10;
    
    return score;
}

function getRangeIndex(number) {
    if (number <= 10) return 0;
    if (number <= 20) return 1;
    if (number <= 30) return 2;
    if (number <= 40) return 3;
    return 4;
}

function displaySmartNumbers() {
    const container = document.getElementById('smartNumbers');
    container.innerHTML = '';
    
    currentLottoNumbers.forEach((number, index) => {
        setTimeout(() => {
            const ball = createNumberBall(number);
            if (userSelectedNumbers.includes(number)) {
                ball.style.border = '3px solid #ffd700';
            }
            container.appendChild(ball);
        }, index * 150);
    });
}

function updatePatternAnalysis() {
    const gameHistory = loadGameHistory();
    
    if (gameHistory.length === 0) {
        showEmptyAnalysis();
        return;
    }
    
    updateOddEvenAnalysis(gameHistory);
    updateRangeAnalysis(gameHistory);
    updateConsecutiveAnalysis(gameHistory);
    updateSumAnalysis(gameHistory);
    updateNumberHeatmap(gameHistory);
}

function showEmptyAnalysis() {
    document.getElementById('oddValue').textContent = '0%';
    document.getElementById('evenValue').textContent = '0%';
    
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`range${i}Value`).textContent = '0%';
        document.getElementById(`range${i}`).style.setProperty('--width', '0%');
    }
    
    document.getElementById('consecutive2').textContent = '0회';
    document.getElementById('consecutive3').textContent = '0회';
    document.getElementById('consecutive4').textContent = '0회';
    
    document.getElementById('averageSum').textContent = '0';
    document.getElementById('maxSum').textContent = '0';
    document.getElementById('minSum').textContent = '0';
    
    document.getElementById('numberHeatmap').innerHTML = '<p style="color: #6c757d;">게임 데이터가 없습니다.</p>';
}

function analyzeOddEven(gameHistory) {
    let oddCount = 0;
    let evenCount = 0;
    
    gameHistory.forEach(game => {
        game.numbers.forEach(num => {
            if (num % 2 === 1) oddCount++;
            else evenCount++;
        });
    });
    
    const total = oddCount + evenCount;
    return {
        odd: total > 0 ? (oddCount / total * 100) : 0,
        even: total > 0 ? (evenCount / total * 100) : 0
    };
}

function updateOddEvenAnalysis(gameHistory) {
    const analysis = analyzeOddEven(gameHistory);
    
    document.getElementById('oddValue').textContent = `${analysis.odd.toFixed(1)}%`;
    document.getElementById('evenValue').textContent = `${analysis.even.toFixed(1)}%`;
}

function analyzeRange(gameHistory) {
    const ranges = [0, 0, 0, 0, 0];
    let total = 0;
    
    gameHistory.forEach(game => {
        game.numbers.forEach(num => {
            const rangeIndex = getRangeIndex(num);
            ranges[rangeIndex]++;
            total++;
        });
    });
    
    return ranges.map(count => total > 0 ? (count / total * 100) : 0);
}

function updateRangeAnalysis(gameHistory) {
    const analysis = analyzeRange(gameHistory);
    
    analysis.forEach((percentage, index) => {
        const rangeElement = document.getElementById(`range${index + 1}`);
        const valueElement = document.getElementById(`range${index + 1}Value`);
        
        valueElement.textContent = `${percentage.toFixed(1)}%`;
        rangeElement.style.setProperty('--width', `${percentage}%`);
        
        const rangeBar = rangeElement.querySelector('::after') || rangeElement;
        rangeBar.style.width = `${percentage}%`;
    });
    
    const style = document.createElement('style');
    analysis.forEach((percentage, index) => {
        style.textContent += `#range${index + 1}::after { width: ${percentage}%; }`;
    });
    document.head.appendChild(style);
}

function updateConsecutiveAnalysis(gameHistory) {
    let consecutive2 = 0;
    let consecutive3 = 0;
    let consecutive4Plus = 0;
    
    gameHistory.forEach(game => {
        const sortedNumbers = [...game.numbers].sort((a, b) => a - b);
        let consecutiveCount = 1;
        
        for (let i = 1; i < sortedNumbers.length; i++) {
            if (sortedNumbers[i] === sortedNumbers[i-1] + 1) {
                consecutiveCount++;
            } else {
                if (consecutiveCount >= 2) {
                    if (consecutiveCount === 2) consecutive2++;
                    else if (consecutiveCount === 3) consecutive3++;
                    else consecutive4Plus++;
                }
                consecutiveCount = 1;
            }
        }
        
        if (consecutiveCount >= 2) {
            if (consecutiveCount === 2) consecutive2++;
            else if (consecutiveCount === 3) consecutive3++;
            else consecutive4Plus++;
        }
    });
    
    document.getElementById('consecutive2').textContent = `${consecutive2}회`;
    document.getElementById('consecutive3').textContent = `${consecutive3}회`;
    document.getElementById('consecutive4').textContent = `${consecutive4Plus}회`;
}

function updateSumAnalysis(gameHistory) {
    if (gameHistory.length === 0) return;
    
    const sums = gameHistory.map(game => 
        game.numbers.reduce((sum, num) => sum + num, 0)
    );
    
    const averageSum = sums.reduce((sum, val) => sum + val, 0) / sums.length;
    const maxSum = Math.max(...sums);
    const minSum = Math.min(...sums);
    
    document.getElementById('averageSum').textContent = averageSum.toFixed(1);
    document.getElementById('maxSum').textContent = maxSum;
    document.getElementById('minSum').textContent = minSum;
}

function updateNumberHeatmap(gameHistory) {
    const numberFreq = {};
    for (let i = 1; i <= 45; i++) {
        numberFreq[i] = 0;
    }
    
    gameHistory.forEach(game => {
        game.numbers.forEach(num => {
            numberFreq[num]++;
        });
    });
    
    const maxFreq = Math.max(...Object.values(numberFreq));
    const heatmapContainer = document.getElementById('numberHeatmap');
    heatmapContainer.innerHTML = '';
    
    for (let i = 1; i <= 45; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.textContent = i;
        
        const intensity = maxFreq > 0 ? numberFreq[i] / maxFreq : 0;
        const opacity = Math.max(0.2, intensity);
        const hue = 240 - (intensity * 60);
        
        cell.style.backgroundColor = `hsla(${hue}, 70%, 50%, ${opacity})`;
        cell.title = `번호 ${i}: ${numberFreq[i]}회 선택`;
        
        cell.addEventListener('click', () => {
            if (userSelectedNumbers.length < 6 && !userSelectedNumbers.includes(i)) {
                userSelectedNumbers.push(i);
                userSelectedNumbers.sort((a, b) => a - b);
                updateSelectedNumbersDisplay();
                
                const tab = document.querySelector('[data-tab="generator"]');
                tab.click();
            }
        });
        
        heatmapContainer.appendChild(cell);
    }
}