/* ================================================================= */
// 설치 npm 
// npm install node-telegram-bot-api
// npm install mongodb
/* ================================================================= */

/* ================================================================= */
// I/F 필드 정의 
/* ================================================================= */
/*
var TY_IFDATA = {

    "TITLE": "",      //제목 
    "TYPE" : "",      //문서 유형
    "DESC" : "",      //내역 
    "SAMPLE_URL": "", //샘플 URL
    "IMAGE": {
       "URL" :"",     //대표 이미지 URL
       "T_URL":[],    //서브 이미지 URL 
       "DATA": ""     //대표 이미지 Data (Base64)
    },
    "VIDEO": {
       "URL"  : "",   //동영상 URL 
       "FPATH": ""    //동영상 path(PC 디렉토리 경로)
    },
    "HASHTAG" : []    //해시태그
};
*/
/* ================================================================= */


/* ================================================================= */
// 사용 예시 
// var ret = require(oAPP.path.join(__dirname, 'js/telegram.js'));
//     ret.send(TY_IFDATA, CB);
//                     
// 
/* ================================================================= */


/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

//텔레그램 고객 전체에 메시지 전송
async function Lfn_sendTelegramMsg(USER_INFO, sParams, CB){

    if(USER_INFO.length == 0){ return; }

    let TelegramBot   = oAPP.remote.require("node-telegram-bot-api"),
        TelegramToken = "5631746596:AAG-Mxhmig-yVId7NP_0RzJj1QBDlBXXmVc";
    

    let BOT = new TelegramBot(TelegramToken, {polling: true});
    
    for (let index = 0; index < USER_INFO.length; index++) {
        var sUserInfo = USER_INFO[index];

        if(sParams.DESC === ""){ continue; }
        await BOT.sendMessage(sUserInfo.chat_id, sParams.DESC);

    }

    //BOT 연결 종료
    BOT.close();

    CB(sParams);

}

 


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = function(sParams, CB){

    const remote       = oAPP.remote,
          MongClinet   = oAPP.remote.require('mongodb').MongoClient,
          MongDB_HOST  = 'mongodb://118.34.215.175:27017';
         
        //몽고 DB에 전체 사용자 정보 얻기 
        MongClinet.connect(MongDB_HOST, function(err, db) {
     
            if (err) { CB(sParams); return; }

            var dbo   = db.db("TELEGRAM");
            var query = {};
            
            dbo.collection("USER_INFO").find(query).toArray(function(err, result) {
                debugger;
                db.close();
                if(err){ CB(sParams); return; }

                if(result.length == 0){ return; }

                //텔레그램 고객 전체에 메시지 전송
                Lfn_sendTelegramMsg(result, sParams, CB);

            });

        });


};