import request from "superagent";

const serverURL = "";

//設定使用者暱稱與性別
export function setUserNicknameAndGender(nickname, gender, account, token) {
    return request.post(serverURL + '/setUserNicknameAndGender/' + account)
        .withCredentials()
        .set('x-access-token', token)
        .set("Content-Type", "application/json")
        .type('form')
        .send({nickname, gender})
}

/* 大頭照 */
// 原本的webURL無法直接顯示，要先轉為BLOB
export function getUserAvatarBlob(imgSrc) {
    return request.get(imgSrc)
        .responseType('blob')
}
// 上傳到伺服器
export function uploadUserAvatar(avatar, account, token) {
    return request.post(serverURL + '/setUserAvatar/' + account)
        .withCredentials()
        .set('x-access-token', token)
        .attach('image', avatar)
}

/* 背景照 */
export function getUserBgImgBlob(imgSrc) {
    return request.get(imgSrc)
        .responseType('blob')

}

export function uploadUserBgImg(bgImg, account, token) {
    return request.post(serverURL + '/setUserBgImg/' + account)
        .withCredentials()
        .set('x-access-token', token)
        .attach('image', bgImg)
}

// 取得完整使用者資料
export function getUserData(account, token) {
    return request.get(serverURL + '/getUserData/' + account)
        .withCredentials()
        .set('x-access-token', token)
}