import Immutable from 'immutable';

const defaultState = Immutable.fromJS({
    account: '',
    token: '',
    nickname: '',
    avatar: '',
    bgImg: '',
    firstLogin: false,
    friendList: Immutable.Map({})
});

export function userReducer(state = defaultState, action) {
    switch (action.type) {
        case 'UPDATE_USER':
            return Immutable.fromJS({...action.payload.user, token: action.payload.token});
        case 'SET_USER_NICKNAME_AND_GENDER_SUCCESS':
            let newState = state;
            newState.set('nickname', action.payload.nickname);
            newState.set('gender', action.payload.gender);
            return newState;
        default:
            return state;
    }
}