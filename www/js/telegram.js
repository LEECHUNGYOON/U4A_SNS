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
       "DATA": "",    //대표 이미지 Data (Base64)
       "FPATH": ""    //이미지 path(PC 디렉토리 경로) 
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
    BOT = oAPP.telegramBOT,
    axios = oAPP.remote.require('axios'),
    FormData = oAPP.remote.require('form-data');
/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

//텔레그램 고객 전체에 메시지 전송
async function Lfn_sendTelegramMsg(USER_INFO, sParams, CB) {

    if (USER_INFO.length == 0) {
        return;
    }

    await getImageVideoUrl(sParams);

    // await BOT.sendMessage("-1001817590912", sParams.DESC);
    // CB(sParams);

    // return;

    for (let index = 0; index < USER_INFO.length; index++) {
        var sUserInfo = USER_INFO[index];

        // if (sUserInfo.chat_id === "-1001817590912") {
        //     await BOT.sendMessage(sUserInfo.chat_id, sParams.DESC);
        //     break;
        // }

        // continue;

        // if (sParams.DESC === "") {
        //     continue;
        // }

        await sendMessage(sUserInfo.chat_id, sParams);

    }

    //BOT 연결 종료
    //BOT.close();

    CB(sParams);

}

/************************************************************************
 * 텔레그램에 전송한 이미지, 동영상 url을 구한다.
 ************************************************************************/
function getImageVideoUrl(sParams) {

    return new Promise((resolve) => {

        // 이미지 로컬 경로가 있을 경우
        if ((typeof sParams.IMAGE.FPATH !== "undefined") && sParams.IMAGE.FPATH !== "") {

            // 이미지파일을 텔레그램에 던진다.





            // 텔레그램 url을 파라미터에 매핑한다.
            sParams.IMAGE.URL = "";

        }

        // // 로컬 pc에 비디오 파일이 있다면
        if (sParams.VIDEO.FPATH !== "") {

            // 비디오 파일을 텔레그램에 던진다.



            // 텔레그램 비디오 url을 파라미터에 매핑한다.
            sParams.VIDEO.URL = "";

        }

        resolve();

    });

} // end of getImageVideoUrl

/************************************************************************
 * 게시글 본문 구성하기
 ************************************************************************/
async function sendMessage(chat_id, sParams) {

    var Lbody = "★ 제목" + " \n " +
        sParams.TITLE + " \n\n " +
        "★ 모듈(업무)" + " \n " +
        sParams.TYPE + " \n\n " +
        "★ 상세설명" + " \n " +
        sParams.DESC + " \n\n ";

    //샘플 URL 정보가 존재한다면 
    if (sParams.SAMPLE_URL !== "") {

        Lbody = Lbody + "★ 샘플 HOME 이동" + " \n " +
            sParams.SAMPLE_URL + " \n\n ";

    }


    // 우선순위
    // 1. FPATH


    // 대표 이미지가 존재할 경우
    if (sParams.IMAGE.URL !== "") {

        //서브 이미지 URL 존재시
        if (sParams.IMAGE.T_URL.length != 0) {

            Lbody = Lbody +
                "★ 추가 참조 이미지" + " \n ";

            for (var i = 0; i < sParams.IMAGE.T_URL.length; i++) {
                var sUrl = sParams.IMAGE.T_URL[i];

                Lbody = Lbody +
                    sUrl.URL + " \n\n ";

            }

        }

        //미리보기 사진 형식 본문 포멧 전송
        await BOT.sendPhoto(chat_id, sParams.IMAGE.URL, {
            caption: Lbody
        });

    }

    // 이미지 로컬 경로가 있을 경우
    if ((typeof sParams.IMAGE.FPATH !== "undefined") && sParams.IMAGE.FPATH !== "") {


        const url = `https://api.telegram.org/bot` + oAPP.auth.telegram + `/sendDocument`;


        return;

    }


    // url 형식의 비디오가 있다면.
    if (sParams.VIDEO.URL !== "") {

        // 확장자 점검 해야함!!
        // mp4, mov ??

        // await BOT.sendVideo(chat_id, sParams.VIDEO.URL, { caption: Lbody });


        return;
    }

    //일반 본문 포멧 전송 
    await BOT.sendMessage(chat_id, Lbody);


}; // end of getMessage

/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = function (sParams, oChoiceInfo, CB) {

    debugger;

    if (!oChoiceInfo || !oChoiceInfo.TELEGRAM) {

        //Callback 
        CB(sParams);
        return;

    }

    var
        remote = oAPP.remote,
        MongClinet = oAPP.MongClinet,
        MongDB_HOST = oAPP.MongDB_HOST;

    let oErrLog = oAPP.errorlog;

    //몽고 DB에 전체 사용자 정보 얻기 
    MongClinet.connect(MongDB_HOST, function (err, db) {

        if (err) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM #1 ] 몽고 DB 접속 실패: " + err.toString()
            });

            CB(sParams);

            return;
        }

        var dbo = db.db("TELEGRAM"),
            dbname = "USER_INFO";
        var query = {};

        dbo.collection(dbname).find(query).toArray(function (err, result) {
            debugger;

            db.close();

            if (err) {

                //오류 메시지 수집
                oErrLog.addLog({
                    RETCD: "E",
                    RTMSG: "[ TELEGRAM #2 ] dbo.collection('USER_INFO'): " + err.toString()
                });

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