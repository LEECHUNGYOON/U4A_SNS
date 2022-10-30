const
    REMOTE = require('@electron/remote'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    RANDOMKEY = require("random-key"),
    FS = require("fs");


let oErrLog = {};

let aLog = [];


/************************************************************************
 * Error 내용 수집
 ************************************************************************
 * @param {Object(JSON)} oError 
 * - ERROR 구조 
 *  예) --> { RETCD:  "E", RTMSG: "" }
 ************************************************************************/
oErrLog.addLog = (oError) => {

    if (!oError) {
        return;
    }

    aLog.push(oError);

}; // end of oErrLog.collect

/************************************************************************
 * 수집된 Error 내용 리턴
 ************************************************************************
 * @return Array
 ************************************************************************/
oErrLog.getLog = () => {

    return aLog;

} // end of oErrLog.getErrorLog

/************************************************************************
 * 수집된 Error 내용 전체 clear
 ************************************************************************/
oErrLog.clearAll = () => {

    aLog = [];

}; // end of oErrLog.clear

/************************************************************************
 * Directory에 Log 파일을 만든다.
 ************************************************************************
 * @param {String} sFileName
 * 
 * @param {String, Array} oLogData
 ************************************************************************/
oErrLog.writeLog = (sFileName, oLogData) => {

    if (oLogData === null || typeof oLogData === "undefined") {
        return;
    }

    let sPrefixFileName = "";

    // 파일 이름 파라미터에 값이 없으면 Default 이름으로 지정한다.
    if (sFileName === null || typeof sFileName !== "string") {
        sPrefixFileName = "error_log";
    } else {
        sPrefixFileName = sFileName;
    }

    let sDirPath = "",
        sLogFileName = `${sPrefixFileName}_${new Date().format("yyyyMMdd_HHmmss")}_${RANDOMKEY.generateBase30(10)}.json`;

    // 백그라운드 모드 일 경우
    if (oAPP.bIsBackgroundMode) {

        // 서버 디렉토리 경로
        sDirPath = process.env.SERVER_LOG_PATH;

    } else {

        // 앱 설치된 폴더 경로
        sDirPath = process.env.LOCAL_LOG_PATH;
    }

    // 오늘날짜의 폴더를 만든다.
    let sToday = new Date().format("yyyyMMdd"),
        sTodayFolderPath = PATH.join(sDirPath, sToday),
        bIsExistsTodayFolder = FS.existsSync(sTodayFolderPath);

    // 로그 폴더에 오늘 날짜 폴더가 없을 경우 만든다.
    if (!bIsExistsTodayFolder) {

        // 없으면 생성
        FS.mkdirSync(sTodayFolderPath, {
            recursive: true
        });

    }

    let sLogFile = PATH.join(sTodayFolderPath, sLogFileName);

    if (typeof oLogData == "object") {
        FS.writeFileSync(sLogFile, JSON.stringify([oLogData]));
    }

    if (oLogData instanceof Array == true) {
        FS.writeFileSync(sLogFile, JSON.stringify(oLogData));
    }

}; // end of oErrLog.writeLog

module.exports = oErrLog;