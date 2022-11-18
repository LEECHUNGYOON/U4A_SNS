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
    FormData = oAPP.remote.require('form-data'),
    PATH = oAPP.path,
    telegramUrl = `https://api.telegram.org/bot5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ/sendDocument`,
    U4ABOT_ID = "-1001817590912";

let VIDEO_FILE_ID = "",
    IMAGE_FILE_ID = "";


/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

// 메시지 본문
function Lfn_getBody(sParams) {

    var Lbody = "★ 제목" + " \n " +
        sParams.TITLE + " \n\n " +
        "★ 모듈(업무)" + " \n " +
        sParams.TYPE + " \n\n " +
        "★ 상세설명" + " \n " +
        sParams.DESC + " \n\n ";

    //샘플 URL 정보가 존재한다면 
    if (sParams.SAMPLE_URL && sParams.SAMPLE_URL !== "") {

        Lbody = Lbody + "★ 샘플 HOME 이동" + " \n " +
            encodeURI(sParams.SAMPLE_URL) + " \n\n ";

    }

    //서브 이미지 URL 존재시
    if (sParams.IMAGE.T_URL.length != 0) {

        Lbody = Lbody +
            "★ 추가 참조 이미지" + " \n ";

        for (var i = 0; i < sParams.IMAGE.T_URL.length; i++) {
            var sUrl = sParams.IMAGE.T_URL[i];

            Lbody = Lbody +
                encodeURI(sUrl.URL) + " \n\n ";

        }

    }

    return Lbody;

}


//텔레그램 고객 전체에 메시지 전송
async function Lfn_sendTelegramMsg(USER_INFO, sParams, CB) {

    VIDEO_FILE_ID = "";
    IMAGE_FILE_ID = "";

    let oErrLog = oAPP.errorlog;

    if (USER_INFO.length == 0) {

        //오류 메시지 수집
        oErrLog.addLog({
            RETCD: "E",
            RTMSG: "[ TELEGRAM send Message #1 ] 메시지 전송할 User가 없습니다."
        });

        CB(sParams);
        return;
    }

    // 메시지 본문
    var Lbody = Lfn_getBody(sParams);

    if (sParams.VIDEO.FPATH && sParams.VIDEO.FPATH !== "") {
        sParams.VIDEO.URL = "";
    }

    // URL 이 있으면 
    if (sParams.VIDEO.URL && sParams.VIDEO.URL !== "") {

        // 여기서 채널봇으로 전송
        try {

            await BOT.sendVideo(U4ABOT_ID, sParams.VIDEO.URL, {
                caption: Lbody
            });

        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM send Message #2 ]: " + error.toString()
            });

        }

    }

    // 로컬 pc의 동영상 경로일 경우
    if (sParams.VIDEO.FPATH && sParams.VIDEO.FPATH !== "") {

        await sendVideo(sParams);

    }

    // URL 이 있으면 
    if (sParams.IMAGE.URL && sParams.IMAGE.URL !== "") {

        // 여기서 채널봇으로 전송

        try {
            await BOT.sendPhoto(U4ABOT_ID, sParams.IMAGE.URL, {
                caption: Lbody
            });

        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM send Message #2 ]: " + error.toString()
            });

        }

    }

    // URL 이 있으면 여기서 채널봇으로 전송

    // 로컬 pc의 이미지 경로일 경우
    if (sParams.IMAGE.FPATH && sParams.IMAGE.FPATH !== "") {

        await sendImage(sParams);

    }

    for (let index = 0; index < USER_INFO.length; index++) {
        var sUserInfo = USER_INFO[index];

        if (sUserInfo.chat_id === U4ABOT_ID) {
            continue;
        }

        await sendMessage(sUserInfo.chat_id, sParams);

    }

    //BOT 연결 종료
    //BOT.close();

    CB(sParams);

}

/************************************************************************
 * 로컬 pc의 동영상 텔레그램 업로드 하여 http url을 구한다.
 ************************************************************************/
function sendVideo(sParams) {

    return new Promise(async (resolve) => {

        let oErrLog = oAPP.errorlog;

        // 로컬 pc의 동영상 경로
        let sPath = sParams.VIDEO.FPATH;

        // 파일이 진짜로 있는지 확인
        let bIsExists = oAPP.fs.existsSync(sPath);
        if (!bIsExists) {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송오류 ] 로컬pc 경로에 동영상이 없습니다."
            });
            resolve();
            return;
        }

        // 파일명
        let sFileName = PATH.basename(sPath);

        // 메시지 본문
        var Lbody = Lfn_getBody(sParams);

        const formData = new FormData();
        formData.append('chat_id', U4ABOT_ID);
        formData.append('caption', Lbody);
        formData.append('document', oAPP.fs.createReadStream(sPath), sFileName);

        try {

            var sRET = await axios.post(telegramUrl, formData, {
                headers: formData.getHeaders(),
                validateStatus: false
            });

        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #1] " + error.toString()
            });

            resolve();
            return;

        }

        //오류 
        if (sRET.status != 200) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #2] "
            });

            resolve();
            return;
        }

        //오류
        if (typeof sRET.data === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #3] "
            });
            resolve();
            return;

        }

        //오류
        if (typeof sRET.data.result === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #4] "
            });
            resolve();
            return;

        }

        // 비디오 전송 결과
        let sResult = sRET.data.result,
            sFile_id = "";

        // Object 구조에 따라 file_id 를 구한다.
        if (sResult.video && sResult.video.file_id) {
            sFile_id = sResult.video.file_id;
        }

        if (sResult.document && sResult.document.file_id) {
            sFile_id = sResult.document.file_id;
        }

        // file id가 없으면 오류
        if (sFile_id == "") {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #5] "
            });

            resolve();

            return;
        }


        // 실제 파일 경로
        var LURL = "https://api.telegram.org/bot5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ/getFile?file_id=" + sFile_id
        // sRET.data.result.video.file_id;
        // sRET.data.result.document.file_id;

        // 임시 글로벌에 file id를 담는다.
        // VIDEO_FILE_ID = sRET.data.result.video.file_id;
        VIDEO_FILE_ID = sFile_id;

        sParams.VIDEO.FILE_ID = sFile_id;

        try {
            var sRET = await axios.get(LURL, {
                validateStatus: false
            });
        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #6] "
            });
            resolve();
            return;

        }

        //오류 
        if (sRET.status != 200) {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #7] "
            });
            resolve();
            return;
        }

        //오류
        if (typeof sRET.data === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #8] "
            });
            resolve();
            return;

        }

        //오류
        if (typeof sRET.data.result === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Video 전송 오류 #9] "
            });
            resolve();
            return;

        }

        sParams.VIDEO.FPATH = "";
        sParams.VIDEO.URL = "https://api.telegram.org/file/bot5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ/" + sRET.data.result.file_path;

        resolve();

    });

}


/************************************************************************
 * 로컬 pc의 이미지를 텔레그램 업로드 하여 http url을 구한다.
 ************************************************************************/
function sendImage(sParams) {

    return new Promise(async (resolve) => {

        let oErrLog = oAPP.errorlog;

        // 로컬 pc의 이미지 경로
        let sPath = sParams.IMAGE.FPATH;

        // 파일이 진짜로 있는지 확인
        let bIsExists = oAPP.fs.existsSync(sPath);
        if (!bIsExists) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송오류 ] 로컬pc 경로에 이미지가 없습니다."
            });

            resolve();

            return;
        }

        // 파일명
        let sFileName = PATH.basename(sPath);

        // 메시지 본문
        var Lbody = Lfn_getBody(sParams);

        const formData = new FormData();

        formData.append('chat_id', U4ABOT_ID);
        formData.append('caption', Lbody);
        formData.append('document', oAPP.fs.createReadStream(sPath), sFileName);

        try {

            var sRET = await axios.post(telegramUrl, formData, {
                headers: formData.getHeaders(),
                validateStatus: false

            });

        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #1] " + error.toString()
            });

            resolve();
            return;

        }



        //오류 
        if (sRET.status != 200) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #2] "
            });

            resolve();
            return;
        }

        //오류
        if (typeof sRET.data === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #3] "
            });
            resolve();
            return;

        }

        //오류
        if (typeof sRET.data.result === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #4] "
            });
            resolve();
            return;

        }

        // 이미지 전송 결과
        let sResult = sRET.data.result,
            sFile_id = "";

        // // Object 구조에 따라 file_id 를 구한다.
        // if (sResult.video && sResult.video.file_id) {
        //     sFile_id = sResult.video.file_id;
        // }

        if (sResult.document && sResult.document.file_id) {
            sFile_id = sResult.document.file_id;
        }

        // file id가 없으면 오류
        if (sFile_id == "") {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #5] "
            });

            resolve();

            return;
        }

        // 실제 파일 경로
        var LURL = "https://api.telegram.org/bot5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ/getFile?file_id=" + sFile_id;
        // sRET.data.result.document.file_id;

        // IMAGE_FILE_ID = sRET.data.result.document.file_id;
        IMAGE_FILE_ID = sFile_id;

        sParams.IMAGE.FILE_ID = sFile_id;

        try {
            var sRET = await axios.get(LURL, {
                validateStatus: false
            });
        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #6] "
            });
            resolve();
            return;

        }

        //오류 
        if (sRET.status != 200) {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #7] "
            });
            resolve();
            return;
        }

        //오류
        if (typeof sRET.data === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #8] "
            });
            resolve();
            return;

        }

        //오류
        if (typeof sRET.data.result === "undefined") {
            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: "[ TELEGRAM Image 전송 오류 #10] "
            });
            resolve();
            return;

        }

        sParams.IMAGE.FPATH = "";
        sParams.IMAGE.URL = "https://api.telegram.org/file/bot5462273470:AAFtKZ14L-EBxyH84KF7tunAYxf_AFVbpTQ/" + sRET.data.result.file_path;

        resolve();

    });

} // end of getImageVideoUrl

/************************************************************************
 * 게시글 본문 구성하기
 ************************************************************************/
async function sendMessage(chat_id, sParams) {

    let oErrLog = oAPP.errorlog;

    // var Lbody = "★ 제목" + " \n " +
    //     sParams.TITLE + " \n\n " +
    //     "★ 모듈(업무)" + " \n " +
    //     sParams.TYPE + " \n\n " +
    //     "★ 상세설명" + " \n " +
    //     sParams.DESC + " \n\n ";

    // //샘플 URL 정보가 존재한다면 
    // if (sParams.SAMPLE_URL !== "") {

    //     Lbody = Lbody + "★ 샘플 HOME 이동" + " \n " +
    //         sParams.SAMPLE_URL + " \n\n ";

    // }

    var bSend = false;

    // 메시지 본문
    var Lbody = Lfn_getBody(sParams);

    // 대표 이미지가 존재할 경우
    if (sParams.IMAGE.URL && sParams.IMAGE.URL !== "") {

        bSend = true;

        // //서브 이미지 URL 존재시
        // if (sParams.IMAGE.T_URL.length != 0) {

        //     Lbody = Lbody +
        //         "★ 추가 참조 이미지" + " \n ";

        //     for (var i = 0; i < sParams.IMAGE.T_URL.length; i++) {
        //         var sUrl = sParams.IMAGE.T_URL[i];

        //         Lbody = Lbody +
        //             sUrl.URL + " \n\n ";

        //     }

        // }

        let sImgUrl = sParams.IMAGE.URL;

        // 이미지 경로가 텔레그램 경로인지 확인
        if (IMAGE_FILE_ID !== "") {
            sImgUrl = IMAGE_FILE_ID;
        }

        //미리보기 사진 형식 본문 포멧 전송
        try {

            await BOT.sendPhoto(chat_id, sImgUrl, {
                caption: Lbody
            });

        } catch (error) {

            try {

                await BOT.sendDocument(chat_id, sImgUrl, {
                    caption: Lbody
                });

            } catch (error) {

                // 진짜 오류

                //오류 메시지 수집
                oErrLog.addLog({
                    RETCD: "E",
                    RTMSG: `[ TELEGRAM sendMessage 전송 오류 #1] chat_id: ${chat_id} \n ${error.toString()}`
                });

            }

        }

    }

    // url 형식의 비디오가 있다면.
    if (sParams.VIDEO.URL && sParams.VIDEO.URL !== "") {

        bSend = true;

        let sVideoUrl = sParams.VIDEO.URL;

        // 비디오 경로가 텔레그램 경로인지 확인
        if (VIDEO_FILE_ID !== "") {
            sVideoUrl = VIDEO_FILE_ID;
        }

        try {

            await BOT.sendVideo(chat_id, sVideoUrl, {
                caption: Lbody
            });

        } catch (error) {

            //오류 메시지 수집
            oErrLog.addLog({
                RETCD: "E",
                RTMSG: `[ TELEGRAM sendMessage 전송 오류 #2] chat_id: ${chat_id} \n ${error.toString()}`
            });

        }

        return;

    }

    if (bSend) {
        return;
    }

    //일반 본문 포멧 전송 
    try {
        await BOT.sendMessage(chat_id, Lbody);
    } catch (error) {

        //오류 메시지 수집
        oErrLog.addLog({
            RETCD: "E",
            RTMSG: `[ TELEGRAM sendMessage 전송 오류 #3] chat_id: ${chat_id} \n ${error.toString()}`
        });

    }

}; // end of getMessage

/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = function(sParams, oChoiceInfo, CB) {
 //Callback 
 CB(sParams);
 return;
    // 임시 변수 초기화
    if(sParams.VIDEO.FILE_ID){ delete sParams.VIDEO.FILE_ID; }
    if(sParams.IMAGE.FILE_ID){ delete sParams.IMAGE.FILE_ID; }

    if (!oChoiceInfo || !oChoiceInfo.TELEGRAM) {

        //Callback 
        CB(sParams);
        return;

    }

    var remote = oAPP.remote,
        MongClinet = oAPP.MongClinet,
        MongDB_HOST = oAPP.MongDB_HOST;

    let oErrLog = oAPP.errorlog;

    //몽고 DB에 전체 사용자 정보 얻기 
    MongClinet.connect(MongDB_HOST, function(err, db) {

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

        dbo.collection(dbname).find(query).toArray(function(err, result) {

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