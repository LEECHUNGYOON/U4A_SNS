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
 * @param {String} sErrType
 * - 01 : 일반적인 오류 또는 스크립트(window onerror) 오류
 * - 02 : SNS 전송 과정에 발생한 오류
 * @param {String, Array} oLogData
 * - 로그를 저장할 오류 정보가 있는 데이터
 * - 예) { RETCD : "E", RTMSG: "OOO 오류" }
 ************************************************************************/
oErrLog.writeLog = (sErrType, oLogData) => {

    let sPrefixFileName = "";

    // 오류 타입에 따른 파일명 분기
    switch (sErrType) {
        case "01":
            sPrefixFileName = "error_log";
            break;

        case "02":
            sPrefixFileName = "sns_log";
            break;

    }

    // Error Type 지정 누락일 경우 (잘못된 파라미터)
    if (sPrefixFileName === "") {
        return;
    }

    // 로그를 남길 오류 정보가 없을 경우 (잘못된 파라미터)
    if (oLogData === null || typeof oLogData === "undefined") {
        return;
    }

    let sDirPath = "",
        sLogFileName = `${sPrefixFileName}_${new Date().format("yyyyMMdd_A/P_hhmmss")}_${RANDOMKEY.generateBase30(10)}.json`;

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

    // 에러 구조가 Array 일 경우
    if (oLogData instanceof Array == true) {
        FS.writeFileSync(sLogFile, JSON.stringify(oLogData));
        return;
    }

    // 에러 구조가 object일 경우
    if (typeof oLogData == "object") {
        FS.writeFileSync(sLogFile, JSON.stringify([oLogData]));
        return;
    }

}; // end of oErrLog.writeLog

/************************************************************************
 * error log 정보를 저장할 폴더를 만든다.
 ************************************************************************/
oErrLog.createLogFolder = () => {

    return new Promise((resolve) => {

        let sFolderPath = process.env.SERVER_LOG_PATH;

        // 컴퓨터 이름을 읽어서 백그라운드 모드일지 아닐지 판단
        if (process.env.COMPUTERNAME !== process.env.SERVER_COMPUTERNAME) {
            sFolderPath = process.env.LOCAL_LOG_PATH;
        }

        let bIsExistsFolder = FS.existsSync(sFolderPath);

        if (bIsExistsFolder) {
            resolve();
            return;
        }

        // 없으면 생성
        FS.mkdirSync(sFolderPath, {
            recursive: true
        });

        resolve();

    });

}; // end of oErrLog.createLogFolder

module.exports = oErrLog;