import _ from "lodash";

const defaultState = {
    friendListShow: false,
    friendInvitationRequestListShow: false,
    friendSearchShow: false,

    chatroomShow: false,
    other: null,

    friendSearchList: [],
    friendInvitationRequestList: [],
    messageList: {},
    friendList: []
};
/* 負責更新main頁面相關的狀態  */
export function mainReducer(state = defaultState, action) {
    switch (action.type) {
        /*  單純頁面UI改變  */
        case 'TOGGLE_FRIEND_LIST': {
            return {...state, 'friendListShow': !state['friendListShow']}
        }
        case 'TOGGLE_FRIEND_INVITATION_REQUEST_LIST': {
            return {...state, 'friendInvitationRequestListShow': !state['friendInvitationRequestListShow']}
        }
        case 'TOGGLE_FRIEND_SEARCH': {
            return {...state, 'friendSearchShow': !state['friendSearchShow']}
        }
        case 'ENTER_CHATROOM': {
            return {...state, 'chatroomShow': true, 'other': {...action.payload.other}};
        }
        case 'LEAVE_CHATROOM': {
            return {...state, 'chatroomShow': false, 'other': null};
        }
        /*  以下為收到訊息後的更新State資料  */

        // 收到搜尋好友的名單
        case 'FRIEND_SEARCH_R': {
            // 因為搜尋是動態的，所以每次都需要重建整個陣列
            // 搜尋好友清單中，需要分成四種狀態: 1.未申請 2.已申請 3.已加好友 4.自己
            console.log(action.payload.account);
            let tempArr = action.payload.data.result.map((fs)=> {
                console.log('FRIEND_SEARCH_R', fs);
                //搜到自己
                if (fs.account === action.payload.account) {
                    return {...fs, state: 4};
                }
                //搜到好友
                if (_.find(state.friendList, {account: fs.account})) {
                    return {...fs, state: 3};
                }
                //對方已經發出好友申請
                console.log(_.find(state.friendInvitationRequestList, {account: fs.account}));
                if (_.find(state.friendInvitationRequestList, {account: fs.account})) {
                    return {...fs, state: 2};
                }
                return {...fs, state: 0};
            });
            return {...state, 'friendSearchList': tempArr};
        }
        // 發出與接收好友請求
        case 'FRIEND_INVITATION_REQUEST_S': {
            return {
                ...state, friendSearchList: state.friendSearchList.map((fs)=> {
                    if (fs.account === action.payload.content.requestee) {
                        return {...fs, state: fs.state === 0 ? 1 : fs.state}
                    }
                    return fs;
                })
            };
        }
        case 'FRIEND_INVITATION_REQUEST_R': {
            // 持續更新類型，所以必須確保item不重複
            let newArr = [...action.payload.data.friendInvitationRequestList];
            let existedArr = [...state.friendInvitationRequestList];
            newArr.forEach(fIR => {
                "use strict";
                //不重複才放進去
                if (existedArr.length === 0 || !existedArr.filter(i => i.account === fIR.account)) {
                    existedArr.push(fIR);
                }
            });
            return {...state, friendInvitationRequestList: [...existedArr]};
        }
        // 回應好友請求
        case 'FRIEND_INVITATION_RESPONSE_S': {
            return {
                ...state,
                friendInvitationRequestList: state.friendInvitationRequestList.filter(user => user.account !== action.payload.content.requester)
            };
        }

        case 'FRIEND_LIST_R': {
            let newArr = [...action.payload.data.friendList];
            let existedArr = [...state.friendList];
            let messageList = {...state.messageList};
            newArr.forEach(f => {
                "use strict";
                // 預設為下線狀態
                f = {...f, onlineStatus: false};
                //如果原本陣列為空直接放，或是不重複才放進去
                if (existedArr.length === 0 || existedArr.filter(i => i.account === f.account).length === 0) {
                    existedArr.push(f);
                }
                // 先創建每位好友的對話,以免之後出現undefined error
                let other = f.account;
                messageList[other] = messageList[other] ? [...messageList[other]] : [];
            });
            return {...state, friendList: [...existedArr], messageList};
        }

        //ONLINELIST
        case 'ONLINELIST_R' : {
            let existedArr = [...state.friendList];
            existedArr.map(f => {
                f.onlineStatus = false;
                action.payload.data.onlineList.map(i=> {
                    if (f.account === i) {
                        f.onlineStatus = true;
                    }
                })
            });
 	    let other = state.other?{...state.other, onlineStatus: false}:null;
 	    if(other){
                action.payload.data.onlineList.map(i=> {
                    if (other.account === i) {
                        other = {...other, onlineStatus: true};
                    }
                });
            }
            return {...state, friendList: [...existedArr], other};
        }

        // 送出的訊息直接放入MessageList，內容為{id, state:0, ..},MESSAGE_SR會根據id刪去
        // 收到的訊息為 {_id, state:1}
        case 'MESSAGE_R': {
            let messageList = {...state.messageList};
            action.payload.data.messageList.forEach((element)=> {
                //  將訊息依照對方帳號分類
                let other = element.sender === action.payload.account ? element.receiver : element.sender;
                let date = new Date(element.createAt);
                let dateFormat = (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
                messageList[other] = messageList[other] ? [...messageList[other]] : [];

                messageList[other].push({...element, state: 1, createAt: dateFormat});
            });

            // 每個都重新排序
            Object.keys(messageList).forEach(account => {
                "use strict";
                return messageList[account].sort((a, b) => new Date(b.date) - new Date(a.date));
            });

            return {
                ...state,
                messageList
            }
        }
        case 'MESSAGE_SR': {
            let messageList = {...state.messageList};
            messageList[action.payload.receiver] = messageList[action.payload.receiver].filter(msg => msg.id !== action.payload.id)
            return {...state, messageList}
        }
        case 'MESSAGE_S_UI': {
            let messageList = {...state.messageList};
            console.log('MESSAGE_S_UI', action.payload);
            messageList[action.payload.content.receiver].push({
                ...action.payload.content,
                state: 0,
                sender: action.payload.account,
                id: action.payload.id
            });
            return {
                ...state,
                messageList
            }
        }
        default:
            return state;
    }
}


/*
 * FriendInvitationRequest
 * {
 *   id: uuid
 *   requester: STRING
 *   requester_avatar: STRING
 *   requester_nickname: STRING
 * }
 * */

/*
 * Friend
 * {
 *   id: uuid
 *   account: STRING
 *   avatar: STRING
 *   nickname: STRING
 *   bgImage: STRING
 *   online: BOOLEAN
 * }
 * */

/*
 * FriendSearchItem
 * {
 *   account: STRING
 *   avatar: STRING
 *   nickname: STRING
 *   state: NOT_FRIEND/ SENDED/ ALREADY/ YOURSELF
 * }
 * */

/*
 * Message
 * {
 *   account: STRING
 *   avatar: STRING
 *   nickname: STRING
 *   state: NOT_FRIEND/ SENDED/ ALREADY/ YOURSELF
 * }
 * */
