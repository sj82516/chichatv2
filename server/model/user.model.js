const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    account: {type:String, unique: true},
    password: {type:String, default:''},
    avatar: {type:String, default:''},
    nickname: {type:String, default:''},
    bgImg: {type:String, default:''},
    isFirstLogin: {type:Boolean,  default:true},
    gender: {type:Boolean, default:true},
    friendList: [
        {friendAccount: String, friendshipTime: Date}
    ]
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;