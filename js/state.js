// 애플리케이션 상태 관리 (Redux 패턴)
export const AppState = {
    // 상태
    state: {
        userSelectedNumbers: [],
        currentLottoNumbers: [],
        currentGameSet: [],
        gameHistory: []
    },

    // 액션 타입
    ActionTypes: {
        SET_USER_NUMBERS: 'SET_USER_NUMBERS',
        SET_CURRENT_LOTTO: 'SET_CURRENT_LOTTO',
        SET_CURRENT_GAME_SET: 'SET_CURRENT_GAME_SET',
        SET_GAME_HISTORY: 'SET_GAME_HISTORY',
        ADD_GAME: 'ADD_GAME',
        UPDATE_GAME: 'UPDATE_GAME',
        CLEAR_CURRENT_GAME: 'CLEAR_CURRENT_GAME'
    },

    // 리듀서
    reducer(state, action) {
        switch (action.type) {
            case this.ActionTypes.SET_USER_NUMBERS:
                return { ...state, userSelectedNumbers: action.payload };
            
            case this.ActionTypes.SET_CURRENT_LOTTO:
                return { ...state, currentLottoNumbers: action.payload };
            
            case this.ActionTypes.SET_CURRENT_GAME_SET:
                return { ...state, currentGameSet: action.payload };
            
            case this.ActionTypes.SET_GAME_HISTORY:
                return { ...state, gameHistory: action.payload };
            
            case this.ActionTypes.ADD_GAME:
                const newHistory = [...state.gameHistory, action.payload];
                return { ...state, gameHistory: newHistory };
            
            case this.ActionTypes.UPDATE_GAME:
                const updatedHistory = state.gameHistory.map(game => 
                    game.id === action.payload.id ? { ...game, ...action.payload.updates } : game
                );
                return { ...state, gameHistory: updatedHistory };
            
            case this.ActionTypes.CLEAR_CURRENT_GAME:
                return { 
                    ...state, 
                    userSelectedNumbers: [],
                    currentLottoNumbers: [],
                    currentGameSet: []
                };
            
            default:
                return state;
        }
    },

    // 액션 생성자들
    actions: {
        setUserNumbers: (numbers) => ({
            type: AppState.ActionTypes.SET_USER_NUMBERS,
            payload: numbers
        }),

        setCurrentLotto: (numbers) => ({
            type: AppState.ActionTypes.SET_CURRENT_LOTTO,
            payload: numbers
        }),

        setCurrentGameSet: (gameSet) => ({
            type: AppState.ActionTypes.SET_CURRENT_GAME_SET,
            payload: gameSet
        }),

        setGameHistory: (history) => ({
            type: AppState.ActionTypes.SET_GAME_HISTORY,
            payload: history
        }),

        addGame: (game) => ({
            type: AppState.ActionTypes.ADD_GAME,
            payload: game
        }),

        updateGame: (id, updates) => ({
            type: AppState.ActionTypes.UPDATE_GAME,
            payload: { id, updates }
        }),

        clearCurrentGame: () => ({
            type: AppState.ActionTypes.CLEAR_CURRENT_GAME
        })
    },

    // 스토어
    store: {
        listeners: [],
        
        dispatch(action) {
            AppState.state = AppState.reducer(AppState.state, action);
            this.listeners.forEach(listener => listener(AppState.state));
        },

        subscribe(listener) {
            this.listeners.push(listener);
            return () => {
                this.listeners = this.listeners.filter(l => l !== listener);
            };
        },

        getState() {
            return AppState.state;
        }
    }
};