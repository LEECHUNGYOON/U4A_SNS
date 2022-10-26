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
const
    TelegramBot = oAPP.remote.require("node-telegram-bot-api"),
    TelegramToken = "5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ",
    BOT = new TelegramBot(TelegramToken, {
        polling: true
    });

/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

//텔레그램 고객 전체에 메시지 전송
async function Lfn_sendTelegramMsg(USER_INFO, sParams, CB) {

    debugger;

    if (USER_INFO.length == 0) {
        return;
    }

    await BOT.sendMessage("-1001817590912", sParams.DESC);
    CB(sParams);

    return;

    for (let index = 0; index < USER_INFO.length; index++) {
        var sUserInfo = USER_INFO[index];

        if (sUserInfo.chat_id === "-1001817590912") {
            await BOT.sendMessage(sUserInfo.chat_id, sParams.DESC);
            break;
        }

        continue;

        if (sParams.DESC === "") {
            continue;
        }
        await BOT.sendMessage(sUserInfo.chat_id, sParams.DESC);

    }

    //BOT 연결 종료
    //BOT.close();

    CB(sParams);

}

/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = function (sParams, oChoiceInfo, CB) {

    if (!oChoiceInfo || !oChoiceInfo.TELEGRAM) {

        //Callback 
        CB(sParams);
        return;

    }


    //[임시]
    var tt = JSON.parse('[{"chat_id":"-1001817590912","first_name":"U4A BOT","last_name":"U4A 채널 전송 채팅 ID"},{"chat_id":5311179178,"first_name":"성호","last_name":"홍"},{"chat_id":2141804045,"first_name":"eun seop","last_name":"park"},{"chat_id":498542502,"first_name":"CHUNGYOON","last_name":"LEE"},{"chat_id":2142197003,"first_name":"영선","last_name":"홍"},{"chat_id":5653627299,"first_name":"혜정","last_name":"윤"},{"chat_id":5750732267,"first_name":"SEONGEUN","last_name":"HONG"}]');

    Lfn_sendTelegramMsg(tt, sParams, CB);


    return;






    const remote = oAPP.remote,
        MongClinet = oAPP.remote.require('mongodb').MongoClient,
        MongDB_HOST = 'mongodb://118.34.215.175:27017';

    //몽고 DB에 전체 사용자 정보 얻기 
    MongClinet.connect(MongDB_HOST, function (err, db) {

        if (err) {
            CB(sParams);
            return;
        }

        var dbo = db.db("TELEGRAM");
        var query = {};

        dbo.collection("USER_INFO").find(query).toArray(function (err, result) {
            debugger;
            db.close();
            if (err) {
                CB(sParams);
                return;
            }

            if (result.length == 0) {
                return;
            }

            //텔레그램 고객 전체에 메시지 전송
            Lfn_sendTelegramMsg(result, sParams, CB);

        });

    });


};