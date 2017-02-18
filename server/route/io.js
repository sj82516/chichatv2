const {RedisDB} = require('../db.connection');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const FriendInvitationModel = require('../model/friendInvitation.model');
const UserModel = require('../model/user.model');
const MessageModel = require('../model/message.model');

module.exports = function handleSocket(io) {

    io.on('connection', (socket)=> {
        socket.on('CONNECT', (msg)=> {
            "use strict";
            if (!msg.account && !verifyAuth(msg.account, msg.token)) {
                return socket.emit('ERROR', {error: 'AuthError'});
            }
            socket.join(msg.account);
            // 將account暫存入Redis，方便上線查詢與Socket對應
            RedisDB.sadd('onlineList', msg.account);
            RedisDB.set('socket:' + socket.id, msg.account, function (err, reply) {
                console.log('Redis 連線建立成功', reply);
            });
        });

        // socket自己維護的斷線事件
        socket.on('disconnect', ()=> {
            "use strict";
            RedisDB.get('socket:' + socket.id, function (err, account) {
                // 刪除上線帳號
                console.log('該帳號離線', socket.id, account);
                RedisDB.srem('onlineList', account);
                RedisDB.del('socket:' + socket.id);
            });
        });
	socket.on('logout', ()=> {
            "use strict";
            RedisDB.get('socket:' + socket.id, function (err, account) {
                // 刪除上線帳號
                console.log('該帳號離線', socket.id, account);
                RedisDB.srem('onlineList', account);
                RedisDB.del('socket:' + socket.id);
            });
        });
        //使用者剛進入主頁面，會主動發起創建 chatInit 建立連線
        //Socket IO 預設每個用戶都有預設的Room，儲存sokcet.id mapping account於Redis中
        socket.on('CHAT_INIT', (msg)=> {
            if (!msg.account && !verifyAuth(msg.account, msg.token)) {
                return socket.emit('ERROR', {error: 'AuthError'});
            }

            /*  回傳資料 */
            //取出好友請求
            FriendInvitationModel.find({requestee: msg.account}).exec().then((fqs)=> {
                return UserModel.find({
                    account: {$in: fqs.map((user)=> user.requester)}
                }, {account: 1, nickname: 1, avatar: 1, bgImg: 1})
            }).then(users => {
                io.sockets.in(msg.account).emit('FRIEND_INVITATION_REQUEST_R', {data: {friendInvitationRequestList: users}});
            }).catch(err=>console.error('chatInit friendship', err));

            //取出所有好友
            UserModel.find({account: msg.account}, {friendList: 1}).exec().then(users=> {
                console.log('chatInit friend', users[0].friendList);
                let friendListWithAccount = users[0].friendList.map(f=>f.friendAccount);
                return UserModel.find({account: {$in: friendListWithAccount}}, {
                    account: 1,
                    nickname: 1,
                    avatar: 1,
                    bgImg: 1
                }).exec()
            }).then(users=> {
                console.log('chatInit friend', users);
                io.sockets.in(msg.account).emit('FRIEND_LIST_R', {data: {friendList: users}});
            }).catch(err=>console.error('chatInit friend', err));

            //取出所有訊息
            MessageModel.find({$or: [{sender: msg.account}, {receiver: msg.account}]}).sort({"createAt": 1}).exec().then(messages=> {
                console.log('message', messages);
                io.sockets.in(msg.account).emit('MESSAGE_R', {data: {messageList: messages}});
            }).catch(err => console.error('chatInit msg', err));
        });

        // 由Requester發送 交友請求
        socket.on('FRIEND_INVITATION_REQUEST_S', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('ERROR', {error: 'AuthError'});
            }

            //findOrCreate,
            FriendInvitationModel.find({
                requester: msg.account,
                requestee: msg.content.requestee
            }).exec().then((friendship)=> {
                if (friendship.length === 0) {
                    console.log('new requestFriendship', friendship);
                    return FriendInvitationModel.create({requester: msg.account, requestee: msg.content.requestee})
                }
                return friendship;
                // 找出Requester的資料，送給Requestee
            }).then((reply)=> {
                console.log('requestFriendship', reply);
                return UserModel.findOne({account: msg.account}).select({
                    account: 1,
                    avatar: 1,
                    nickname: 1,
                    bgImg: 1
                }).exec()
            }).then((user)=> {
                console.log('requestee', msg.content.requestee, user);
                RedisDB.sismember('onlineList', msg.content.requestee, function (err, reply) {
                    if (err) {
                        throw err
                    }
                    // 對方再線上
                    if (reply) {
                        io.sockets.in(msg.content.requestee).emit('FRIEND_INVITATION_REQUEST_R', {data: {friendInvitationRequestList: [user]}});
                    }
                    io.sockets.in(msg.account).emit('FRIEND_INVITATION_REQUEST_SR', msg);
                });
            }).catch((err)=> {
                console.log('requestFriendship Err', err);
            })
        });

        //由Requestee發送 回應交友請求
        socket.on('FRIEND_INVITATION_RESPONSE_S', (msg)=> {
            console.log(msg);
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            FriendInvitationModel.findOneAndRemove({
                requestee: msg.account,
                requester: msg.content.requester
            }).exec().then((reply)=> {
                // 如果答應才互增好友
                if (msg.content.answer) {
                    return Promise.all([
                        UserModel.findOneAndUpdate({account: msg.account},
                            {$pushAll: {friendList: [{friendAccount: msg.content.requester}]}},
                            {
                                new: true, fields: {
                                account: 1,
                                avatar: 1,
                                nickname: 1,
                                bgImg: 1
                            }
                            }).exec(),
                        UserModel.findOneAndUpdate({account: msg.content.requester},
                            {$pushAll: {friendList: [{friendAccount: msg.account}]}},
                            {
                                new: true, fields: {
                                account: 1,
                                avatar: 1,
                                nickname: 1,
                                bgImg: 1
                            }
                            }).exec()
                    ])
                }
                //取出用戶的朋友清單後，還要先取出account，在搜尋一次
            }).then(friendLists => {
                console.log('responseFriendship', friendLists);
                if (!friendLists) {
                    return;
                }
                let userRequestee = friendLists[0];
                let userRequester = friendLists[1];

                io.sockets.in(userRequestee.account).emit('FRIEND_LIST_R', {data: {friendList: [userRequester]}});
                io.sockets.in(userRequester.account).emit('FRIEND_LIST_R', {data: {friendList: [userRequestee]}})
            }).catch(error=> {
                console.log('responseFriendship Err', error)
            })
        });

        //搜尋好友
        socket.on('FRIEND_SEARCH_S', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            console.log(msg.content.string);
            if (msg.content.string === '') {
                return io.to(msg.account).emit('friendSearch', {data: {result: []}})
            }
            // 找出開頭符合搜尋自創的帳號或暱稱,不分大小寫
            UserModel.find({$or: [{account: new RegExp('^' + msg.content.string, "i")}, {nickname: new RegExp('^' + msg.content.string, "i")}]})
                .select({account: 1, avatar: 1, nickname: 1, bgImg: 1})
                .exec().then(searchResult => {
                console.log(searchResult);
                io.sockets.in(msg.account).emit('FRIEND_SEARCH_R', {data: {result: searchResult}})
            })
        });

        // 發送訊息
        socket.on('MESSAGE_S', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            console.log('message', msg);
            MessageModel.create({
                sender: msg.account,
                receiver: msg.content.receiver,
                content: msg.content.content,
                createdAt: new Date()
            }).then((chat)=> {
                console.log(chat);
                io.sockets.in(chat.receiver).emit('MESSAGE_R', {data: {messageList: [chat]}});
                // 回覆sender成功發送訊息
                // 注意: 回傳資料格式與其他人不同，需要另外處理
                io.sockets.in(chat.sender).emit('MESSAGE_SR', {data: {id: msg.id, messageList: [chat]}});
            }).catch(err=>console.error('chat', err))
        });

        // 找出好友中誰有上線, 回傳陣列
        socket.on('ONLINELIST_S', (msg)=> {
            "use strict";
            console.log('ONLINELIST_S', msg);
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            UserModel.find({account: msg.account}, {friendList: 1}).exec().then(friendList=> {
                let onlineList = [];
                return Promise.all(
                    friendList[0] ? friendList[0].friendList.map(f => {
                        console.log(f.friendAccount);
                        return new Promise((resolve, reject) => {
                            RedisDB.sismember('onlineList', f.friendAccount, function (err, reply) {
                                if (err) {
                                    return console.error('onlineList error', err);
                                }
                                console.log(reply);
                                // 表示存在
                                if (reply) {
                                    resolve(f.friendAccount);
                                } else {
                                    resolve(0);
                                }
                            })
                        })
                    }) : {}
                );
            }).then((onlineList)=> {
                // 如果沒上線的帳號會回傳0, 如果有上線則為帳號本身
                onlineList = onlineList.filter(o=> o!==0);

                socket.emit('ONLINELIST_R', {data: {onlineList}});

            }).catch(err => console.error(err));
        })
    })
};

//檢查jwt token與帳號是否一致
//回傳Boolean
function verifyAuth(account, token) {
    let decoded = jwt.verify(token, jwtSecret);
    return account === decoded.data
}
