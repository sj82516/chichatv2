import Dexie from "dexie";

const db = new Dexie("LocalDatabase");
db.version(1).stores({
    localMessage: "msgId,action",
    friendInvitationList:"msgId,action",
    friendList:"msgId,action",
    messageList:"msgId,message"
});

// 暫存訊息到local端，支援離線功能
export function storeLocalMessage(action) {
    "use strict";
    console.log('Dexie');
    return db.transaction('rw', db.localMessage, function*() {
        yield db.localMessage.add({msgId: action.payload.id, action: action});
    }).catch(e => {
        console.error(e.stack || e);
    });
}

//從local端刪除訊息
export function delLocalMessage(msgId) {
    "use strict";
    return db.transaction('rw', db.localMessage, function*() {
        yield db.localMessage.where("msgId").equals(msgId).delete();
    }).catch(e => {
        console.error(e.stack || e);
    });
}

export function storeMessageList(message){
    "use strict";
    return db.transaction('rw', db.messageList, function*() {
        yield db.messageList.add({msgId: message.id, message});
    }).catch(e => {
        console.error(e.stack || e);
    });
}

export function getMessageList(){
    "use strict";
    return db.transaction('rw', db.messageList, function*() {
        yield db.messageList.toArray();
    }).catch(e => {
        console.error(e.stack || e);
    });
}