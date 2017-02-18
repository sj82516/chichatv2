import * as mainApi from "../api/mainApi";
import * as mainAction from "../actions/mainAction";
import uuid from "uuid";

import io from 'socket.io-client';
import {eventChannel} from 'redux-saga';
import {fork, take, call, put, cancel, select, spawn} from 'redux-saga/effects';

const socketURL = window.location.hostname;

function connect(account, token) {
    const socket = io(socketURL);
    return new Promise(resolve => {
        socket.on('connect', () => {
            console.log('與Server建立Socket連線');
            // 用於建立連線並加入自己帳號的房間
            socket.emit('CONNECT', {account, token});
            resolve(socket);
        });
    });
}

// SR表示送出訊息後Server回傳的確認值，如果沒有錯誤代表成功發送，LocalMessage可以刪去暫存
// 有些地方需要account做辨別
function *subscribe(socket, account, token) {
    return eventChannel(emit => {
        socket.on('connect', () => {
            console.log('與Server重新建立Socket連線');
            // 恢復連線要繼續關注
        });
        // Server確認好友請求
        socket.on('FRIEND_INVITATION_REQUEST_SR', msg => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_REQUEST_SR error', msg.error);
            } else {
                mainApi.delLocalMessage(msg.id);
            }
        });
        // 收到好友請求
        socket.on('FRIEND_INVITATION_REQUEST_R', (msg) => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_REQUEST_R error', msg.error);
            } else {
                emit(mainAction.friendInvitationRequestR(msg));
            }
        });

        // Server確認好友答覆
        socket.on('FRIEND_INVITATION_REQUEST_SR', (msg) => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_REQUEST_SR error', msg.error);
            } else {
                mainApi.delLocalMessage(msg.id);
            }
        });

        // 好友搜尋結果
        socket.on('FRIEND_SEARCH_R', (msg)=> {
            "use strict";
            if (msg.error) {
                console.error('FRIEND_SEARCH_R error', msg.error);
            } else {
                emit(mainAction.friendSearchR(account, msg));
            }
        });

        //收到好友名單
        socket.on('FRIEND_LIST_R', (msg) => {
            if (msg.error) {
                console.error('FRIEND_LIST_R error', msg.error);
            } else {
                emit(mainAction.friendListR(msg));
                // 每次收到新的好友清單就發送
                emit(mainAction.onlineListS());
            }
        });

        // Server確認好友答覆
        socket.on('FRIEND_INVITATION_RESPONSE_SR', (msg) => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_RESPONSE_SR error', msg.error);
            } else {
                mainApi.delLocalMessage(msg.id);
            }
        });

        // Server確認訊息並回傳剛才的訊息
        socket.on('MESSAGE_SR', (msg) => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_RESPONSE_SR error', msg.error);
            } else {
                mainApi.delLocalMessage(msg.data.id);
                //因為自己發出去的訊息也要顯示，所以Server收到後會再傳回剛剛自己發送的訊息
                console.log(msg.data);
                emit(mainAction.messageSR(msg.data.id, msg.data.messageList[0].receiver));
                emit(mainAction.messageR(account, msg))
            }
        });

        // 收到訊息
        socket.on('MESSAGE_R', (msg) => {
            if (msg.error) {
                console.error('FRIEND_INVITATION_RESPONSE_SR error', msg.error);
            } else {
                emit(mainAction.messageR(account, msg));
            }
        });

        //每五秒監控好友上下限狀態
        socket.on('ONLINELIST_R', (msg) => {
            "use strict";
            if (msg.error) {
                console.error('ONLINELIST_R error', msg.error);
            } else {
                emit(mainAction.onlineListR(msg));
                setTimeout(()=>{emit(mainAction.onlineListS())}, 5000);
            }
        });

        socket.on('disconnect', e => {
            // 更新為斷線顯示
        });
        return () => {
        };
    });
}

function* read(socket, account, token) {
    const channel = yield call(subscribe, socket, account, token);
    while (true) {
        let action = yield take(channel);
        yield put(action);
    }
}

function* write(socket, account, token) {
    while (true) {
        // 只要type最後為_S結尾都是要發送的訊息
        const sendRE = /.*_S$/;
        const action = yield take(action => {
            console.log('write', action.type, sendRE.test(action.type));
            return sendRE.test(action.type);
        });
        console.log('write pass', uuid.v1());
        // 生成一個ID,之後識別用
        action.payload.id = uuid.v1();
        // 加入驗證用的帳號與token
        action.payload.account = account;
        action.payload.token = token;
        // 部分*_S不會放入暫存，因為單純索取資料(safe)不需要double-check，例如 搜尋好友
        if (action.type !== 'FRIEND_SEARCH_S' && action.type !== 'ONLINELIST_S') {
            yield call(mainApi.storeLocalMessage, action);
        }
        // 如果是Message_S，要先將Message顯示到螢幕
        if (action.type === 'MESSAGE_S') {
            yield put(mainAction.messageSUI(action));
        }

        socket.emit(action.type, action.payload);
    }
}

function* handleIO(socket, account, token) {
    //取出帳號與token, 因為發送訊息都要用
    yield fork(read, socket, account, token);
    yield fork(write, socket, account, token);
}

export function* mainFlow() {
    while (true) {
        yield take('CHAT_INIT');
        // user 是 Immutable.Map()
        let user = yield select(state => state.user);
        const socket = yield call(connect, user.get('account'), user.get('token'));
        socket.emit('CHAT_INIT', {account: user.get('account'), token: user.get('token')});

        const task = yield fork(handleIO, socket, user.get('account'), user.get('token'));

        yield take('LOGOUT');
        socket.emit('logout');
        yield cancel(task);
	console.log('logout');
    }
}
