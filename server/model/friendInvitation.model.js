const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FriendInvitationSchema = new Schema({
    requestee: {type:String},
    requester: {type: String}
});

const FriendInvitationModel = mongoose.model('Friendship', FriendInvitationSchema);

module.exports = FriendInvitationModel;