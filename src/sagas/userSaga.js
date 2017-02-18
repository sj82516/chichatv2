import {take, race, call, put, select} from "redux-saga/effects";
import * as ApiUser from "../api/userApi";
import {push} from 'react-router-redux';

// 頁面初始化
export function* pageInit() {
    "use strict";
    let localUser = yield call(ApiUser.getUserData);
    // 本地端有資料，重新設定到store中
    try {
        if (localUser && localUser.account && localUser.token) {
            //yield call(requestInitUserData);
            yield put({type: 'UPDATE_USER', payload: {user: localUser, token: localUser.token}});
        } else {
            // 本地端沒有使用者資料，向Server索取
            yield call(requestInitUserData);
        }
    }catch (error){
        console.log(error);
    }
}

function* requestInitUserData(){
    "use strict";
    // 本地端沒有使用者資料，向Server索取
    let res = yield call(ApiUser.getInitData);
    let resJson = JSON.parse(res.text);
    if (resJson.error || res.status !== 200) {
        return;
    }
    yield put({type: 'UPDATE_USER', payload: {user: resJson.data.user, token: resJson.data.token}});
    yield call(ApiUser.saveUserData, {...resJson.data.user, token: resJson.data.token});
}

// 登入流程
// 發出登入/註冊請求 -> 成功則儲存User -> 發出成功訊息
// 失敗重新迴圈
export function* loginFlow() {
    while (true) {
        console.log('start login flow');
        const {loginAction, signupAction} = yield race({
            loginAction: take('LOGIN_BY_ACCOUNT'),
            signupAction: take('SIGNUP_BY_ACCOUNT'),
        });
        let action = loginAction ? loginAction : signupAction, res, resJson;
        try {
            if (loginAction) {
                res = yield call(ApiUser.loginByAccount, action.payload.account, action.payload.password);
            } else {
                res = yield call(ApiUser.signupByAccount, action.payload.account, action.payload.password);
            }
        } catch (error) {
            console.log(error);
            yield put({
                type: 'LOGIN_FLOW_FAIL',
                payload: error
            });
            yield call(ApiUser.delUserData);
            continue;
        }

        resJson = JSON.parse(res.text);
        if (res.status !== 200 || resJson.error) {
            yield put({
                type: 'LOGIN_FLOW_FAIL',
                payload: {error: resJson.error}
            });
            continue
        }
        yield put({
            type: 'LOGIN_FLOW_SUCCESS',
            payload: ''
        });

        yield call(ApiUser.saveUserData, {...resJson.data.user, token: resJson.data.token});
        yield put({type: 'UPDATE_USER', payload: {user: resJson.data.user, token: resJson.data.token}});
    }
}

// 收到登出請求，清理local storage
export function *logout(){
    "use strict";
	while(true){
   		 yield take('LOGOUT');
    		yield put({type: 'UPDATE_USER', payload: {user: {}, token: null}});
    		yield call(ApiUser.delUserData);
    		yield put(push('/'));
	}
}

// 如果User變動，判斷要跳往哪個頁面
export function* pageRedirect() {
    "use strict";
    const {storeUser, pathname} = yield select(state => ({
        'storeUser': state.user,
        'pathname': state.routing.locationBeforeTransitions.pathname
    }));
    console.log('pageRedirect', storeUser.get('account'), storeUser.get('token'));
    // 定義出需要登入才能進去的路徑
    const needUserPath = /((^\/firstLogin)|(^\/main$))/
    // 如果User在首頁卻發現已經有資料，則判別跳轉邏輯
    if (storeUser.get('token') && storeUser.get('account') && pathname==='/') {
        let path = storeUser.get('isFirstLogin') ? '/firstLogin' : '/main';
        yield put(push(path));

        // 反之如果User不在首頁卻發現沒有資料，則回到首頁
    } else if(!storeUser.get('token') && !storeUser.get('account') && needUserPath.test(pathname)){
        console.log('no user login');
        yield put(push('/'));
    }
}
