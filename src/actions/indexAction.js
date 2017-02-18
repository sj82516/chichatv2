export function pageInit(){
    "use strict";
    return({
        type: 'PAGE_INIT',
    })
}

export function setIndexFormType(type){
    "use strict";
    return ({
        type: "SET_INDEX_FORM_TYPE",
        payload: {type},
    })
}

export function accountInputValidate(input){
    "use strict";
    return ({
        type: "ACCOUNT_INPUT_VALIDATE",
        payload: {input}
    })
}

export function passwordInputValidate(input){
    "use strict";
    return ({
        type: "PASSWORD_INPUT_VALIDATE",
        payload: {input}
    })
}

export function loginByAccount(account, password) {
    return ({
        type: "LOGIN_BY_ACCOUNT",
        payload: {account, password},
    })
}

export function signupByAccount(account, password) {
    return ({
        type: "SIGNUP_BY_ACCOUNT",
        payload: {account, password},
    })
}

export function updateUser(user, token){
    "use strict";
    return({
        type: 'UPDATE_USER',
        payload: {user, token}
    })
}

export function logout(){
    "use strict";
    return({
        type: 'LOGOUT',
        payload: {}
    })
}
