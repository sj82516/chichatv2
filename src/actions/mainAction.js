export function toggleFriendInvitationRequestList() {
    return ({
        type: 'TOGGLE_FRIEND_INVITATION_REQUEST_LIST',
        payload: ''
    })
}

export function toggleFriendList() {
    return ({
        type: 'TOGGLE_FRIEND_LIST',
        payload: ''
    })
}

export function togglefriendSearch() {
    return ({
        type: 'TOGGLE_FRIEND_SEARCH',
        payload: ''
    })
}

// 進入聊天室,聊天室顯示並顯示相關對話
export function enterChatRoom(other) {
    return ({
        type: 'ENTER_CHATROOM',
        payload: {other}
    })
}
// 離開聊天室
export function leaveChatRoom() {
    return ({
        type: 'LEAVE_CHATROOM',
        payload: ''
    })
}

/* 要發送的訊息定義在此, S表示Send, 使用者發送 */

// 準備建立Socket，並索取第一批資料
export function chatInit() {
    return ({
        type: 'CHAT_INIT',
        payload: {}
    })
}

export function friendInvitationRequestS(requestee) {
    return ({
        type: 'FRIEND_INVITATION_REQUEST_S',
        payload: {
            content: {
                requestee: requestee,
            }
        }
    })
}

// Requestee(自)回覆是否答應交友請求
export function friendInvitationReponseS(requester, answer) {
    return ({
        type: 'FRIEND_INVITATION_RESPONSE_S',
        payload: {
            content: {
                requester: requester,
                answer
            }
        }
    })
}

// 搜尋好友
export function friendSearch(string) {
    return ({
        type: 'FRIEND_SEARCH_S',
        payload: {
            content: {
                string
            }
        }
    })
}

// 發送訊息
export function messageS(other, content) {
    return ({
        type: 'MESSAGE_S',
        payload: {
            content: {
                receiver: other,
                content
            }
        }
    })
}

//請求好友上線狀態
export function onlineListS(){
    "use strict";
    return ({
        type: 'ONLINELIST_S',
        payload: {}
    })
}

// 發送訊息
export function messageSR(id, receiver) {
    return ({
        type: 'MESSAGE_SR',
        payload: {id, receiver}
    })
}

// 更新發送訊息到UI上
export function messageSUI(action) {
    return ({
        type: 'MESSAGE_S_UI',
        payload: {
            ...action.payload

        }
    })
}

/*  這裡放MainSaga處理完資料後，要發送到Reducer變更store state的action */

export function friendInvitationRequestR(msg) {
    "use strict";
    return {
        type: 'FRIEND_INVITATION_REQUEST_R',
        // msg 中放 請求者的個人資料
        payload: {...msg}
    }
}

export function friendListR(msg) {
    "use strict";
    return {
        type: 'FRIEND_LIST_R',
        // msg 中放 data: 請求者的個人資料
        payload: {...msg}
    }
}

export function messageR(account, msg) {
    "use strict";
    return {
        type: 'MESSAGE_R',
        // msg 中放 請求者的個人資料
        payload: {...msg, account}
    }
}

export function friendSearchR(account, msg) {
    "use strict";
    return {
        type: 'FRIEND_SEARCH_R',
        // msg 中放 請求者的個人資料
        payload: {...msg, account}
    }
}

//請求好友上線狀態
export function onlineListR(onlineList){
    "use strict";
    return ({
        type: 'ONLINELIST_R',
        payload: { ...onlineList}
    })
}