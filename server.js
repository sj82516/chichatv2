const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');
const {MongoDB, RedisDB} = require('./server/db.connection');
// express-limiter 必須宣告在Redis Client和Express App之後，並當作參數傳入
const limiter = require('express-limiter')(app, RedisDB);
const redisStore = require('connect-redis')(session);
const io = require('socket.io')(http);
const handleSocket = require('./server/route/io');

let passport = require('passport');

//MongoDB
MongoDB.on('error', (err)=>console.error('connection error:', err));
MongoDB.once('open', function () {
    console.log('mongodb connected');
});

//Redis
RedisDB.on("error", function (err) {
    console.log("redisdb error:", err);
});

const userRoute = require('./server/route/user.route');

//cors
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   next();
// });

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(morgan('combined'));

app.use(helmet());
limiter({
    path: '/loginByAccount',
    method: 'post',
    lookup: ['connection.remoteAddress'],
    // 5 requests per 30 seconds
    total: 5,
    expire: 1000 * 30
});
limiter({
    path: '/singupByAccount',
    method: 'post',
    lookup: ['connection.remoteAddress'],
    // 5 requests per 30 seconds
    total: 5,
    expire: 1000 * 30
});

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({
        host: 'localhost',
        port: '6379',
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 24 * 3600000},
    ttl: 24 * 3600000
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(userRoute);

handleSocket(io);

app.use((req, res)=> {
    res.redirect('/');
});

http.listen('8080', ()=> {
    console.log('server start');
});
