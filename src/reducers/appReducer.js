import Immutable from 'immutable'
const defaultState = Immutable.fromJS({
    snackBarShow: false,
    snackBarMsg: '',
    dialogShow: false,
    dialogMsg: '',
});

export function appReducer(state = defaultState, action) {
    switch (action.type) {
        case 'UPDATE_USER':
            return Immutable.fromJS(action.payload.user);
        case 'LOGIN_WITH_ACCOUNT__SUCCESS':
            return state;
        case 'SIGNUP_WITH_ACCOUNT__SUCCESS':
            return state;
        case 'LOGIN_FLOW_FAIL':
            return state;
        default:
            return state;
    }
}