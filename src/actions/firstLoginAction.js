//表單:暱稱驗證
export function nicknameInputValidate(nickname) {
    return {
        type: "NICKNAME_INPUT_VALIDATE",
        payload: {nickname}
    };
}

//設定性別
export function setUserGender(gender) {
    return {
        type: "SET_USER_GENDER",
        payload: {gender}
    };
}

//設定使用者暱稱與性別失敗
export function setUserNicknameAndGenderError(error) {
    return {
        type: "SET_USER_NICKNAME_AND_GENDER_ERROR",
        payload: {error}
    };
}

//設定使用者暱稱與性別成功，正式更新User
export function setUserNicknameAndGenderSuccess(nickname, gender) {
    return {
        type: "SET_USER_NICKNAME_AND_GENDER_SUCCESS",
        payload: nickname, gender
    };
}

// 向伺服器發出設定使用者暱稱與性別
export function setUserNicknameAndGender(nickname, gender) {
    return {
        type: "SET_USER_NICKNAME_AND_GENDER",
        payload: {nickname, gender}
    };
}

// 大頭照部分
export function getUserAvatarBlob(imgSrc){
    "use strict";
    return {
        type: "GET_USER_AVATAR_BLOB",
        payload: {imgSrc}
    };
}

export function uploadUserAvatar(avatar){
    "use strict";
    return {
        type: "UPLOAD_USER_AVATAR",
        payload: {avatar}
    };
}
// 僅更新FirstLogin中State的Avatar
export function setFirstLoginAvatar(avatar) {
    return {
        type: "SET_FIRST_LOGIN_AVATAR",
        payload: {avatar}
    };
}

// 背景部分
export function getUserBgImgBlob(imgSrc){
    "use strict";
    return {
        type: "GET_USER_BGIMG_BLOB",
        payload: {imgSrc}
    };
}

export function uploadUserBgImg(bgImg){
    "use strict";
    return {
        type: "UPLOAD_USER_BGIMG",
        payload: {bgImg}
    };
}

export function setFirstLoginBgImg(bgImg) {
    return {
        type: "SET_FIRST_LOGIN_BGIMG",
        payload: {bgImg}
    };
}

// step4 取得目前所有設定
export function getUserData(){
    "use strict";
    return {
        type: 'GET_USER_DATA',
        payload: ''
    }
}

// 切換進度
export function goNextStep(step) {
    return {
        type: "GO_NEXT_STEP",
        payload: {step}
    }
}
// 更新state
export function setNextStep(step) {
    return {
        type: "SET_NEXT_STEP",
        payload: {step}
    }
}