// 로또 번호 생성 로직
import { Utils } from './utils.js';

export const NumberGenerator = {
    // 단일 게임 생성
    generateSingleGame(userSelectedNumbers) {
        const availableNumbers = [];
        for (let i = 1; i <= 45; i++) {
            if (!userSelectedNumbers.includes(i)) {
                availableNumbers.push(i);
            }
        }
        
        const remainingCount = 6 - userSelectedNumbers.length;
        const randomNumbers = [];
        
        // 매번 새로운 랜덤 조합 생성
        const shuffledAvailable = [...availableNumbers].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < remainingCount; i++) {
            if (shuffledAvailable.length > 0) {
                const randomIndex = Math.floor(Math.random() * shuffledAvailable.length);
                const selectedNumber = shuffledAvailable.splice(randomIndex, 1)[0];
                randomNumbers.push(selectedNumber);
            }
        }
        
        return [...userSelectedNumbers, ...randomNumbers].sort((a, b) => a - b);
    },

    // 5게임 세트 생성
    generateGameSet(userSelectedNumbers) {
        if (userSelectedNumbers.length === 0) {
            throw new Error('최소 1개 이상의 번호를 선택해주세요!');
        }

        const gameSet = [];
        const games = ['A', 'B', 'C', 'D', 'E'];
        
        games.forEach(gameLetter => {
            const gameNumbers = this.generateSingleGame(userSelectedNumbers);
            gameSet.push({
                game: gameLetter,
                numbers: gameNumbers,
                userNumbers: [...userSelectedNumbers]
            });
        });
        
        return gameSet;
    },

    // 스마트 번호 생성 (패턴 분석 기반)
    generateSmartNumbers(gameHistory, userSelectedNumbers) {
        if (gameHistory.length < 3) {
            throw new Error('더 많은 게임 데이터가 필요합니다. (최소 3게임)');
        }
        
        const numberFreq = {};
        const numberWeight = {};
        
        for (let i = 1; i <= 45; i++) {
            numberFreq[i] = 0;
            numberWeight[i] = 0;
        }
        
        gameHistory.forEach((game, index) => {
            const weight = (index + 1) / gameHistory.length;
            const numbers = this.extractNumbersFromGame(game);
            
            numbers.forEach(num => {
                numberFreq[num]++;
                numberWeight[num] += weight;
            });
        });
        
        const oddEvenBalance = this.analyzeOddEven(gameHistory);
        const rangeBalance = this.analyzeRange(gameHistory);
        
        const availableNumbers = [];
        for (let i = 1; i <= 45; i++) {
            if (!userSelectedNumbers.includes(i)) {
                availableNumbers.push({
                    number: i,
                    frequency: numberFreq[i],
                    weight: numberWeight[i],
                    score: this.calculateSmartScore(i, numberFreq[i], numberWeight[i], oddEvenBalance, rangeBalance)
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
        
        return [...userSelectedNumbers, ...smartNumbers].sort((a, b) => a - b);
    },

    // 게임에서 번호 추출 (5게임 세트와 단일 게임 모두 지원)
    extractNumbersFromGame(game) {
        if (game.type === 'set' && game.gameSet) {
            // 5게임 세트의 경우 모든 게임의 번호를 합침
            return game.gameSet.flatMap(g => g.numbers);
        } else if (game.numbers) {
            // 단일 게임의 경우
            return game.numbers;
        }
        return [];
    },

    // 스마트 점수 계산
    calculateSmartScore(number, frequency, weight, oddEvenBalance, rangeBalance) {
        let score = 0;
        
        // 출현 빈도가 낮을수록 높은 점수
        score += (45 - frequency) * 2;
        
        // 최근 가중치
        score += weight * 10;
        
        // 홀짝 밸런스 고려
        const isOdd = number % 2 === 1;
        if ((isOdd && oddEvenBalance.odd < 50) || (!isOdd && oddEvenBalance.even < 50)) {
            score += 5;
        }
        
        // 구간 밸런스 고려
        const range = Utils.getRangeIndex(number);
        if (rangeBalance[range] < 20) {
            score += 3;
        }
        
        // 랜덤 요소 추가
        score += Math.random() * 10;
        
        return score;
    },

    // 홀짝 분석
    analyzeOddEven(gameHistory) {
        let oddCount = 0;
        let evenCount = 0;
        
        gameHistory.forEach(game => {
            const numbers = this.extractNumbersFromGame(game);
            numbers.forEach(num => {
                if (num % 2 === 1) oddCount++;
                else evenCount++;
            });
        });
        
        const total = oddCount + evenCount;
        return {
            odd: total > 0 ? (oddCount / total * 100) : 0,
            even: total > 0 ? (evenCount / total * 100) : 0
        };
    },

    // 구간별 분석
    analyzeRange(gameHistory) {
        const ranges = [0, 0, 0, 0, 0];
        let total = 0;
        
        gameHistory.forEach(game => {
            const numbers = this.extractNumbersFromGame(game);
            numbers.forEach(num => {
                const rangeIndex = Utils.getRangeIndex(num);
                ranges[rangeIndex]++;
                total++;
            });
        });
        
        return ranges.map(count => total > 0 ? (count / total * 100) : 0);
    }
};