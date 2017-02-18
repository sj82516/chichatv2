import {takeLatest} from 'redux-saga';
import { spawn } from "redux-saga/effects";
import * as userSaga from './userSaga';
import * as mainSage from './mainSaga';
import * as firstLoginSaga from './firstLoginSaga';


// main saga generators
export function* sagas() {
  yield [
      spawn(userSaga.loginFlow),
      spawn(userSaga.logout),
      spawn(takeLatest, 'PAGE_INIT', userSaga.pageInit),
      spawn(takeLatest, '@@router/LOCATION_CHANGE', userSaga.pageRedirect),
      spawn(takeLatest, 'UPDATE_USER', userSaga.pageRedirect),
      spawn(mainSage.mainFlow),

      spawn(takeLatest, 'SET_USER_NICKNAME_AND_GENDER', firstLoginSaga.setUserNicknameAndGender),
      spawn(takeLatest, 'GET_USER_AVATAR_BLOB',firstLoginSaga.getUserAvatarBlob),
      spawn(takeLatest, 'GO_NEXT_STEP', firstLoginSaga.goNextStep),
      spawn(takeLatest, 'GET_USER_AVATAR_BLOB', firstLoginSaga.getUserAvatarBlob),
      spawn(takeLatest, 'UPLOAD_USER_AVATAR', firstLoginSaga.uploadUserAvatar),
      spawn(takeLatest, 'GET_USER_BGIMG_BLOB', firstLoginSaga.getUserBgImgBlob),
      spawn(takeLatest, 'UPLOAD_USER_BGIMG', firstLoginSaga.uploadUserBgImg),
      spawn(takeLatest, 'GET_USER_DATA', firstLoginSaga.getUserData),
  ];
}
