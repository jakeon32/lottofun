let userSelectedNumbers = [];
let currentLottoNumbers = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadGameHistory();
    updateStatistics();
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
            }
        });
    });
}

function addUserNumber() {
    const input = document.getElementById('userNumbers');
    const number = parseInt(input.value);
    
    if (!number || number < 1 || number > 45) {
        alert('1부터 45까지의 숫자를 입력해주세요.');
        return;
    }
    
    if (userSelectedNumbers.includes(number)) {
        alert('이미 선택된 번호입니다.');
        return;
    }
    
    if (userSelectedNumbers.length >= 6) {
        alert('최대 6개까지만 선택할 수 있습니다.');
        return;
    }
    
    userSelectedNumbers.push(number);
    userSelectedNumbers.sort((a, b) => a - b);
    updateSelectedNumbersDisplay();
    input.value = '';
    input.focus();
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
    userSelectedNumbers = [];
    updateSelectedNumbersDisplay();
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

function saveGame() {
    const gameRound = document.getElementById('gameRound').value;
    const winResult = document.getElementById('winResult').value;
    const winAmount = parseInt(document.getElementById('winAmount').value) || 0;
    
    if (!gameRound) {
        alert('게임 회차를 입력해주세요.');
        return;
    }
    
    const game = {
        id: Date.now(),
        round: parseInt(gameRound),
        numbers: [...currentLottoNumbers],
        userNumbers: [...userSelectedNumbers],
        result: winResult,
        amount: winAmount,
        cost: 1000,
        date: new Date().toLocaleDateString('ko-KR')
    };
    
    let gameHistory = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
    gameHistory.push(game);
    localStorage.setItem('lottoHistory', JSON.stringify(gameHistory));
    
    document.getElementById('gameRound').value = '';
    document.getElementById('winResult').value = '꽝';
    document.getElementById('winAmount').value = '';
    document.getElementById('saveSection').style.display = 'none';
    
    currentLottoNumbers = [];
    userSelectedNumbers = [];
    updateSelectedNumbersDisplay();
    document.getElementById('generatedNumbers').innerHTML = '';
    
    alert('게임이 저장되었습니다!');
    updateStatistics();
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
        gameElement.className = `history-item ${game.result !== '꽝' ? 'win' : ''}`;
        
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
                <span class="win-status ${game.result !== '꽝' ? 'win' : 'lose'}">${game.result}</span>
                <span class="win-amount">${game.amount.toLocaleString()}원</span>
            </div>
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

function updateStatistics() {
    const gameHistory = loadGameHistory();
    
    const totalGames = gameHistory.length;
    const totalInvestment = totalGames * 1000;
    const totalWinnings = gameHistory.reduce((sum, game) => sum + game.amount, 0);
    const profitRate = totalInvestment > 0 ? ((totalWinnings - totalInvestment) / totalInvestment * 100).toFixed(1) : 0;
    const winCount = gameHistory.filter(game => game.result !== '꽝').length;
    const bestWin = gameHistory.length > 0 ? Math.max(...gameHistory.map(game => game.amount)) : 0;
    
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

document.getElementById('userNumbers').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addUserNumber();
    }
});

document.getElementById('gameRound').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('winResult').focus();
    }
});

document.getElementById('winAmount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        saveGame();
    }
});

document.getElementById('winResult').addEventListener('change', function(e) {
    const winAmount = document.getElementById('winAmount');
    const result = e.target.value;
    
    if (result === '꽝') {
        winAmount.value = '0';
    } else {
        winAmount.focus();
    }
});