let router = require('express').Router();
const jwt = require('jsonwebtoken');
const superAgent = require('superagent');
const mongoose = require('mongoose');
const UserModel = require('../model/user.model');
const multer = require('multer');
const path = require('path');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads/'))
    },
    filename: function (req, file, cb) {
        let fileExRE = /\..*$/;
        let fileExt = fileExRE.exec(file.originalname) === null ? '.png' : fileExRE.exec(file.originalname)[0];
        let subPathRE = /^\/([a-zA-Z]*)\//.exec(req.originalUrl)[1];
        let subPath = subPathRE === 'setUserAvatar' ? '-avatar' : '-bgImg';
        cb(null, req.account + subPath + fileExt)
    }
});

let upload = multer({storage: storage}).single('image');

let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;
let GithubStrategy = require('passport-github').Strategy;
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let LocalStrategy = require('passport-local').Strategy;

const serverURL = 'http://' + process.env.SERVER_URL;

const jwtSecret = process.env.JWT_SECRET;

// 社群登入/註冊
// 兩者合一，如果發現User存在則從MongoDB取出並返回
// 如果User不存在則先於MongoDB創建並返回
// 成功: {user: user}
// 失敗: {error: 'db error'}
// 此時回傳值會到 serializeUser那
passport.use(new GithubStrategy({
        clientID: '15903a443dfa3f5b0dfe',
        clientSecret: '803e3531261e4a17716a1e846a494d6b2711df67',
        callbackURL: serverURL + "/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
        handleOauth(cb, profile, 'github');
    }
));

passport.use(new FacebookStrategy({
        clientID: '242783576153807',
        clientSecret: '5d4c785b6d984cbbab2fd216ad75eca4',
        callbackURL: serverURL + "/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
        superAgent.get('https://graph.facebook.com/v2.8/' + profile.id + "/picture?access_token=" + accessToken)
            .end((err, fbres)=> {
                if (err) {
                    return cb(err, false);
                }
                profile.photo = fbres.redirects[0];
                handleOauth(cb, profile, 'facebook');
            });
    }
));

passport.use(new GoogleStrategy({
        clientID: '502704391112-68rmhftneqh7vmcgslrsdk5l9p4o464v.apps.googleusercontent.com',
        clientSecret: 'JW2Tk1aOPd31dluLahFz7s2-',
        callbackURL: serverURL + "/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
        handleOauth(cb, profile, 'google');
    }
));

function handleOauth(cb, profile, type) {
    UserModel.findOne({
        account: profile.id
    }, function (err, user) {
        console.log('handle oauth', err, user);
        if (err) {
            return cb(null, false, {message: 'DBError'});
        }
        if (!user) {
            UserModel.create({
                account: profile.id,
                avatar: type === 'facebook' ? profile.photo : profile.photos[0].value,
                nickname: profile.displayName
            }, function (err, user) {
                if (err || !user) {
                    return cb(err, false);
                }
                return cb(null, {data: {user: user, token: createJWT(user.account)}});
            })
        } else {
            return cb(null, {data: {user: user, token: createJWT(user.account)}});
        }
    });
}

passport.use(new LocalStrategy({
        usernameField: 'account',
        passwordField: 'password'
    },
    function (account, password, cb) {
        UserModel.findOne({account: account}, function (err, user) {
            if (err) {
                console.error('DB Error in Passport localstrategy:', err);
                return cb(err, false);
            }
            if (user && user.password !== password) {
                return cb(null, false, {message: 'passwordWrong'});
            }
            return cb(null, user);
        });
    }));

// 從strategy那得到輸入值，passport會自動存入redis
passport.serializeUser(function (info, done) {
    done(null, info.data.user.account);
});

// 從redis中將值放入 req.session.passport.user中
passport.deserializeUser(function (info, done) {
    console.log('de:', info);
    if (info) {
        UserModel.find({account: info}).exec().then(user=> {
            if (user[0]) {
                done(null, {data: {user: user[0], token: createJWT(user[0].account)}});
            } else {
                done(null, false, {error: 'NoData'});
            }
        }).catch(err=> {
            console.log("DBError", err);
            done(null, false, {error: 'NoData'});
        })
    }
});

const index_path = __dirname + '/public/index.html';

router.get('/', function (request, response) {
    response.sendFile(index_path, function (error) {
        if (error) {
            console.log(error);
        }
    });
});

router.get('/auth/github', passport.authenticate('github'));
// 將頁面導回首頁
router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: serverURL,
        session: true, successRedirect: serverURL
    }));

router.get('/auth/google',
    passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: serverURL,
        session: true, successRedirect: serverURL
    }));

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'user_friends']}));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: serverURL,
        session: true, successRedirect: serverURL
    }));

router.post('/loginByAccount',
    function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            console.log(err, info);
            //info 專門用於顯示錯誤
            if (info) {
                return res.json({error: info.message});
            }
            if (!user) {
                return res.json({error: 'accountNotFound'});
            }
            return res.json({data: {user: user, token: createJWT(user.account)}});
        })(req, res, next);
    });

router.post('/signupByAccount',
    function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            console.log(info);
            if (info) {
                return res.json({error: info.message});
            }
            if (user) {
                return res.json({error: 'accountRepeat'});
            }
            UserModel.create({
                account: req.body.account,
                password: req.body.password
            }).then((user)=> {
                console.log('signup db user', user);

                return res.json({data: {user: user, token: createJWT(user.account)}});
            }).catch((err)=> {
                console.error('signup db err', err);
                return res.json({error: 'DBError'});
            })
        })(req, res, next);
    });

// 取得使用者資料
// 成功回傳 user data
router.get('/getInitData', (req, res)=> {
    if (req.user) {
        // 僅用於第一次取得資料，避免使用者登出後沒有清除
        req.session.destroy(function (err) {

        });
        return res.json({data: req.user.data});
    }
    return res.json({error: 'noData'});
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//
function createJWT(account) {
    return jwt.sign({data: account}, jwtSecret, {
        expiresIn: '7d' // expires in 7 days
    });
}

// 以下為使用者資料設定，路徑都需要帶帳號，使用JWT比對帳號做驗證
// 將路徑參數account設為req.account
router.param('account', function (req, res, next, account) {
    token = req.header('x-access-token');
    try {
        let decoded = jwt.verify(token, jwtSecret);
        if (account !== decoded.data) {
            throw new Error('tokenInvalid');
        }
    } catch (e) {
        console.log(e);
        return res.send({error: 'tokenInvalid'});
    }
    req.account = account;
    next();
});

// 設定使用者暱稱
// 回傳success
router.post('/setUserNicknameAndGender/:account', function (req, res) {
    const nicknameRE = /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,20}$/;
    const genderRE = /[true]|[false]]/;
    if (!nicknameRE.test(req.body.nickname) || !genderRE.test(req.body.gender)) {
        res.send({error: 'paramsInvalid'});
    }
    //先檢查暱稱有沒有重複
    UserModel.find({'nickname': req.body.nickname}).exec()
        .then((user)=> {
            console.log(user);
            if (user.length !== 0 && user[0].account !== req.account) {
                return res.send({error: 'nicknameRepeated'});
            }
            // 更新使用者資訊
            return UserModel.update({'account': req.account}, {
                'nickname': req.body.nickname,
                'gender': req.body.gender,
                firstTimeLogin: false
            }, {
                'multi': false
            }).exec()
        }).then((numAffected)=> {
        if (numAffected === 0) {
            return res.send({error: 'accountNotFound'});
        }
        return res.send({data: 'success'});
    }).catch((e)=> {
        return res.send({error: 'DBError'});
    })
});

// 上傳使用者大頭照
// 成功回傳success
router.post('/setUserAvatar/:account', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.json({'error': 'serverError'});
        }
        UserModel.update({account: req.account}, {
            avatar: '/uploads/' + req.file.filename,
            firstTimeLogin: false
        }, {'multi': false}).exec()
            .then((numberAffected)=> {
                if (numberAffected.n !== 1) {
                    return res.json({'error': 'DBError'});
                }
                console.log('UPLOAD FINISHED');
                res.json({'data': 'success'});
            })
    })
});

// 上傳使用者背景圖片
// 成功回傳success
router.post('/setUserBgImg/:account', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.json({'error': 'serverError'});
        }
        UserModel.update({account: req.account}, {
            bgImg: '/uploads/' + req.file.filename,
            firstTimeLogin: false
        }, {'multi': false}).exec()
            .then((numberAffected)=> {
                if (numberAffected.n !== 1) {
                    return res.json({'error': 'DBError'});
                }
                console.log('UPLOAD FINISHED');
                res.json({'data': 'success'});
            })
    })
});

// 取得使用者資料，目的在於資料更新後取得新的資料
// 成功回傳 user data
router.get('/getUserData/:account', function (req, res) {
    UserModel.update({account: req.account}, {isFirstLogin: false}).exec().then((numberAffected, err)=> {
        if (numberAffected===0 || err) {
            return res.json({error: "DBError"});
        }
        return UserModel.findOne({account: req.account}).exec()
    }).then((user) => {
        "use strict";
        if (!user) {
            return res.json({error: "DBError"});
        }
        return res.json({data: {user}});
    })
});

module.exports = router;
