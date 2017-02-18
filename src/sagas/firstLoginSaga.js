import {take, race, call, put, select} from "redux-saga/effects";
import {push} from 'react-router-redux';

import * as firstLoginAction from "../actions/firstLoginAction"
import * as firstLoginApi from "../api/firstLoginApi"
import * as ApiUser from "../api/userApi"


export function* setUserNicknameAndGender(action) {
    "use strict";
    let user = yield select(state => state.user);
    let account = user.get('account');
    let token = user.get('token');
    let res = yield call(firstLoginApi.setUserNicknameAndGender, action.payload.nickname, action.payload.gender, account, token);
    let resJson = JSON.parse(res.text);
    console.log('setUserNicknameAndGender', res, resJson);
    if (res.status !== 200 || resJson.error) {
        yield put(firstLoginAction.setUserNicknameAndGenderError(resJson.error));
        return;
    }
    yield put(firstLoginAction.setUserNicknameAndGenderSuccess(action.payload.nickname, action.payload.gender));
    yield put(firstLoginAction.goNextStep(2));
}

export function* goNextStep(action) {
    "use strict";
    if (action.payload.step < 5) {
        yield put(firstLoginAction.setNextStep(action.payload.step));
        yield put(push('/firstLogin/step' + action.payload.step));
    }else{
        yield put(push('/main'));
    }
}

// 取得大頭照照片，用於Crop
export function* getUserAvatarBlob(action) {
    let res = yield call(firstLoginApi.getUserAvatarBlob, action.payload.imgSrc);
    if (res.status !== 200) {
        return;
    }
    yield put(firstLoginAction.setFirstLoginAvatar(res.body));
}

// 上傳Croppied後的大頭照圖案
export function* uploadUserAvatar(action) {
    "use strict";
    let user = yield select(state => state.user);
    let account = user.get('account');
    let token = user.get('token');
    let res = yield call(firstLoginApi.uploadUserAvatar, action.payload.avatar, account, token);
    let resJson = JSON.parse(res.text);
    if (res.status !== 200 || resJson.error) {
        return;
    }
    yield put(firstLoginAction.goNextStep(3));
}

// 取得背景照片，用於Crop
export function* getUserBgImgBlob(action) {
    let res = yield call(firstLoginApi.getUserBgImgBlob, action.payload.imgSrc);
    if (res.status !== 200) {
        return;
    }
    yield put(firstLoginAction.setFirstLoginBgImg(res.body));
}

// 上傳Croppied後的背景圖案
export function* uploadUserBgImg(action) {
    "use strict";
    let user = yield select(state => state.user);
    let account = user.get('account');
    let token = user.get('token');
    let res = yield call(firstLoginApi.uploadUserBgImg, action.payload.bgImg, account, token);
    let resJson = JSON.parse(res.text);
    if (res.status !== 200 || resJson.error) {
        return;
    }
    yield put(firstLoginAction.goNextStep(4));
}

// 完成資料設定，從DB取出最新使用者資訊
export function* getUserData(action){
    "use strict";
    let user = yield select(state => state.user);
    let account = user.get('account');
    let token = user.get('token');
    let res = yield call(firstLoginApi.getUserData, account, token);
    let resJson = JSON.parse(res.text);
    if (res.status !== 200 || resJson.error) {
        console.log('err',resJson.error, res);
        return;
    }
    // 更新使用者資料
    yield put({type: 'UPDATE_USER', payload: {user: {...resJson.data.user, isFirstLogin: false}, token: token}});
    yield call(ApiUser.updateUserData, {...resJson.data.user, isFirstLogin: false, token: token});
}