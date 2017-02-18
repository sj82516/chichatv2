import Immutable from 'immutable'
const defaultState = Immutable.fromJS({
    formType: true,

    accountInput:'',
    accountInputValidation: false,
    accountInputValidationErr: '',

    passwordInput: '',
    passwordInputValidation: false,
    passwordInputValidationErr: '',
});
/* 負責更新Index頁面相關的狀態  */
export function indexReducer(state = defaultState, action){
    switch(action.type){
        case 'SET_INDEX_FORM_TYPE':

            return state.merge({
                formType:action.payload.type,
                //如果使用者切換狀態，那麼除了 帳號格式錯誤 之外都應該清除
                accountInputValidation: state.get('accountInputValidationErr') !== "帳號必須為正確Email格式",
                accountInputValidationErr: state.get('accountInputValidationErr') === "帳號必須為正確Email格式" ? '帳號必須為正確Email格式' : ''
            });
        case 'ACCOUNT_INPUT_VALIDATE': {
            const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return state.merge({
                accountInputValidation: emailRE.test(action.payload.input),
                accountInput: action.payload.input,
                accountInputValidationErr: emailRE.test(action.payload.input) ? '' : '帳號必須為正確Email格式'
            })
        }
        case 'PASSWORD_INPUT_VALIDATE': {
            const passwordRE = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,10}$/;
            return state.merge({
                passwordInputValidation: passwordRE.test(action.payload.input),
                passwordInput: action.payload.input,
                passwordInputValidationErr: passwordRE.test(action.payload.input) ? '' : '密碼必須包含至少一個英文與數字，長度限制6~10字'
            })
        }
        case 'LOGIN_FLOW_FAIL':
            if(action.payload.error === 'accountNotFound'){
                return state.merge({
                    accountInputValidation: false,
                    accountInputValidationErr: '帳號不存在'
                })
            }else if(action.payload.error === 'accountRepeat'){
                return state.merge({
                    accountInputValidation: false,
                    accountInputValidationErr: '帳號被搶先註冊囉'
                })
            }else if( action.payload.error === 'passwordWrong'){
                return state.merge({
                    passwordInputValidation: false,
                    passwordInputValidationErr: '密碼錯誤'
                })
            }
            return state;
        default:
            return state;
    }
}