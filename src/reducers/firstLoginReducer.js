const defaultValue = {
    nicknameInput: '',
    nicknameInputValidation: false,
    nicknameInputValidationErr: '',
    gender: true,

    avatar: null,

    bgImg: null,

    step: 1,
};

export function firstLoginReducer(state = defaultValue, action) {
    switch (action.type) {
        case 'NICKNAME_INPUT_VALIDATE':
            action.payload.nickname = action.payload.nickname===undefined? '':action.payload.nickname;
            const nicknameRE = /^[\p{Han}a-zA-Z0-9]{3,20}$/;
            return {
                ...state,
                nicknameInputValidation: nicknameRE.test(action.payload.nickname),
                nicknameInput: action.payload.nickname,
                nicknameInputValidationErr: nicknameRE.test(action.payload.nickname) ? '' : '暱稱必須為長度3~20的包含中英文、數字的名稱'
            };
        case 'SET_USER_GENDER':
            return {...state, gender: action.payload.gender}
        case 'SET_USER_NICKNAME_AND_GENDER_ERROR':
            if(action.payload.error === 'nicknameRepeated'){
                return {
                    ...state,
                    nicknameInputValidation: false,
                    nicknameInputValidationErr: '暱稱重複'
                };
            }
            return state;
        case 'SET_FIRST_LOGIN_AVATAR':
            return {...state, avatar: action.payload.avatar}
        case 'SET_FIRST_LOGIN_BGIMG':
            return {...state, bgImg: action.payload.bgImg}
        // 下一步
        case 'SET_NEXT_STEP':{
            return {...state, step:action.payload.step}
        }
        default:
            return state;
    }
}
