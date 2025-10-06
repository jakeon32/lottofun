// 유틸리티 함수들
export const Utils = {
    // 숫자 색상 가져오기
    getNumberColor(number) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        return colors[(number - 1) % colors.length];
    },

    // 번호 공 생성
    createNumberBall(number, removable = false) {
        const ball = document.createElement('div');
        ball.className = `number-ball ${removable ? 'removable' : ''}`;
        ball.textContent = number;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        ball.style.background = colors[(number - 1) % colors.length];
        
        return ball;
    },

    // 최대 선택 알림 표시
    showMaxSelectionAlert() {
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
    },

    // 범위 인덱스 가져오기
    getRangeIndex(number) {
        if (number <= 10) return 0;
        if (number <= 20) return 1;
        if (number <= 30) return 2;
        if (number <= 40) return 3;
        return 4;
    },

    // 날짜 포맷팅
    formatDate(date = new Date()) {
        return date.toLocaleDateString('ko-KR');
    },

    // 오늘 날짜 ISO 형식
    getTodayISO() {
        return new Date().toISOString().split('T')[0];
    }
};