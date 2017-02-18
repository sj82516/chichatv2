let mongoose = require('mongoose'),
    util = require('util');


const redis = require("redis"),
    client = redis.createClient({ "host": 'localhost', "port": "6379" }),
    db = mongoose.connection;

// MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/chichat');

module.exports = {
    MongoDB: db,
    RedisDB: client
};