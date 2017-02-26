### ChiChat V2  
此專案從[ChiChat V1](https://github.com/sj82516/chichat)複寫而來  
#### 功能
・基本的帳號登入、註冊，以及欄位驗證
・串連OAUTH第三方登入，包含Google+/ Github/ Facebook
・瀏覽器端保存資料，讓使用者重整頁面可直接登入
・即時通訊，包含加好友、回應好友請求與即時傳送訊息等功能
![Imgur](http://i.imgur.com/lpODYux.jpg)
![Imgur](http://i.imgur.com/Txt4LnS.jpg)
![Imgur](http://i.imgur.com/TFOEa50.jpg)
#### 實作紀錄
・加入Redux Saga將 資料邏輯與頁面更新邏輯切開  
登入、註冊、發送訊息等AJAX Call或是使用Indexed DB，這些Async Call都必須針對回傳結果在做近一步的處理，像是登入還必須處理成功或失敗，或是有帳號、密碼錯誤等機制  
使用Redux Saga可以做到上述的要求，至於使用方式可以參考我寫的網誌[]()  
至於頁面更新邏輯如 切換頁面、欄位驗證等單純的Sync Call就使用原本的Redux即可  
・加入Material UI  
部分UI元件替換為Material UI，基本上所有的Button都替換掉，整體美感增加許多  
不過Material UI元件的style比較難以設定，例如說<icon style>如果要變色是要用'fill'而非'backgroundColor'，且單個元件又有多層Style可以設定，需要花時間去嘗試  
・利用Redis，加入上線狀態  
使用Redis中的`SET`資料結構，在上線時加入sadd；下線時刪除srem；如果要判斷帳號是否在線使用sismember，如果在列會回傳true，反之為false
```javascript
socket.on('CONNECT', (msg)=> {
     "use strict";
     // 將account暫存入Redis，方便上線查詢與Socket對應
     RedisDB.sadd('onlineList', msg.account);
 });
 // socket自己維護的斷線事件
 socket.on('disconnect', ()=> {
     "use strict";
     RedisDB.get('socket:' + socket.id, function (err, account) {
         // 刪除上線帳號
         console.log('該帳號離線', socket.id, account);
         RedisDB.srem('onlineList', account);
     });
 });
 
 // Redis cli不支援Promise，源碼有多加一層Promise包起來，所以這裡才使用resolve()
 RedisDB.sismember('onlineList', f.friendAccount, function (err, reply) {
     if (err) {
         return consol****e.error('onlineList error', err);
     }
     console.log(reply);
     // 表示存在
     if (reply) {
         resolve(f.friendAccount);
     } else {
         resolve(0);
     }
 })
```
#### 一些奇怪的坑
1. function vs function()  
在使用setTimeout()時，不小心搞混了`調用函式`與`指向函式本身`，例如說  
```
var a = function log(){console.log('haha')}
setTimeout(a(), 1000);
setTimeout(a, 1000);
setTimeout(function(){
    a()
}, 1000);
setTimeout(()=>a(), 1000);
```
結果第一個例子會直接執行，其他兩個都會乖乖等一秒後執行，這裡牽扯到 如果將function()當作參數傳入，JS會立刻執行該function()並把return質當作參數傳入  
```
function sum(a,b){return a+b};
function log(a){console.log("log:",a)}
log(sum(1,2))
// log: 3
```
所以在原本的setTimeout中或是所有會用到callback function，記得傳入指向函式本身而調用函式   
