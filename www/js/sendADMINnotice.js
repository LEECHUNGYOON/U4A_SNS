/* ================================================================= */
// 설치 npm 



/* ================================================================= */

/* ================================================================= */
// I/F 필드 정의 
/* ================================================================= */
/*



*/
/* ================================================================= */


/* ================================================================= */
/* 사용 예시 
    var sendADMINnotice = require(oAPP.path.join(__dirname, 'js/sendADMINnotice.js'));
    var retdata = await sendADMINnotice.send(oAPP.remote, "TEMP");
    retdata.RETCD <-- E:오류 
    retdata.RTMSG <-- 처리 메시지 
      
*/
/* ================================================================= */


/* ================================================================= */
/* 내부 전역 변수 
/* ================================================================= */

let BOT = null;
let TELEGRAMKEY = "5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ";

var T_ADMIN = [];
T_ADMIN.push("2142197003"); //홍영선
T_ADMIN.push("5311179178"); //홍성호
T_ADMIN.push("2141804045"); //박은섭
T_ADMIN.push("498542502"); //이청윤

/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

//템플릿 
async function _temp(REMOTE, RESOLVE) {

    var LMSG = " 😡 서비스 가동 완료!!!";

    for (let i = 0; i < T_ADMIN.length; i++) {
        var S_ADMIN = T_ADMIN[i];

        //이미지 + 텍스트 전송 방식
        //await oAPP.BOT.sendPhoto(S_USER, "https://www.u4ainfo.com/u4a_sample/img/error-page.png",{caption: LMSG});

        //메시지 전송 방식
        await BOT.sendMessage(S_ADMIN, LMSG);

    }

    RESOLVE({
        RETCD: "S",
        RTMSG: "처리 완료!!"
    });

}

// sns 프로그램 실행 메시지 전송
async function _sns_start(REMOTE, RESOLVE) {

    var LMSG = "️💬 SNS Service ON!! 👍";

    var aAdmin = [
        "5311179178",
        "498542502",
        "2141804045"
    ];

    for (let i = 0; i < aAdmin.length; i++) {

        var S_ADMIN = aAdmin[i];

        //메시지 전송 방식
        await BOT.sendMessage(S_ADMIN, LMSG);

    }

    RESOLVE({
        RETCD: "S",
        RTMSG: "처리 완료!!"
    });

}

// sns 프로그램 실행 메시지 전송
async function _sns_restart(REMOTE, RESOLVE) {

    var LMSG = "!! 👍 SNS Service Restart!! 👍";

    var aAdmin = [
        "5311179178",
        "498542502",
        "2141804045"
    ];

    for (let i = 0; i < aAdmin.length; i++) {

        var S_ADMIN = aAdmin[i];

        //메시지 전송 방식
        await BOT.sendMessage(S_ADMIN, LMSG);

    }

    RESOLVE({
        RETCD: "S",
        RTMSG: "처리 완료!!"
    });

}


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = async function (REMOTE, PRCCD) {

    return new Promise((resolve, reject) => {
        debugger;

        if (BOT == null) {
            var TelegramBot = REMOTE.require('node-telegram-bot-api');
            BOT = new TelegramBot(TELEGRAMKEY, {
                polling: false
            });

        }

        //처리 프로세스 코드에 따른 분기
        switch (PRCCD) {
            case "TEMP": //샘플
                _temp(REMOTE, resolve);

                break;

            case "001": // SNS Service 실행 완료 메시지
                _sns_start(REMOTE, resolve);

                break;

            case "002": // SNS Service 재시작 메시지
                _sns_restart(REMOTE, resolve);

                break;

            default:
                resolve({
                    RETCD: "E",
                    RTMSG: "처리 유형 오류"
                });
                break;
        }

    });

};