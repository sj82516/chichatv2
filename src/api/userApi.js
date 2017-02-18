import request from "superagent";
import Dexie from "dexie";

const db = new Dexie("LocalUserDatabase");
db.version(1).stores({
    user: "account,userInfo",
});

const serverURL = "";

export function getInitData(){
    "use strict";
    return request.get(serverURL + '/getInitData')
        .withCredentials()
}

export function loginByAccount(account, password){
    "use strict";
    console.log(account, password);
    return request.post(serverURL + '/loginByAccount')
        .withCredentials()
        .type('form')
        .send({account, password})
}

export function signupByAccount(account, password){
    "use strict";
    return request.post(serverURL + '/signupByAccount')
        .withCredentials()
        .type('form')
        .send({account, password})
}


/* 關於本地儲存 */

export function saveUserData(user){
    "use strict";
    return db.transaction('rw', db.user, function*() {
        yield db.user.add({account: user.account, userInfo: user});
    }).catch(e => {
        console.error(e.stack || e);
    });
}

export function getUserData(){
    "use strict";
    return db.transaction('rw', db.user, function*() {
        let user = yield db.user.toArray();
        console.log('getUserData',user);
        return user[0]?user[0].userInfo:{};
    }).catch(e => {
        console.error(e.stack || e);
    });
}

export function updateUserData(user){
    "use strict";
    console.log('updateUserData', user);
    return db.transaction('rw', db.user, function*() {
        yield db.user.put({account: user.account, userInfo: user});
    }).catch(e => {
        console.error(e.stack || e);
    });
}

export function delUserData(){
    "use strict";
    return db.transaction('rw', db.user, function*() {
        yield db.user.clear();
    }).catch(e => {
        console.error(e.stack || e);
    });
}
