const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    sender: {type:String, required:true},
    receiver: {type: String, required:true},
    content:{type: String},
    createAt:{ type: Date, required: true, default: Date.now }
});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;