window.oAPP = {};

(async (oAPP) => {
    "use strict";

    oAPP.fn = {};
    oAPP.auth = {};
    oAPP.conf = {};

    oAPP.bIsBackgroundMode = false; // 현재 실행 환경이 백그라운드 모드인지 아닌지 Flag   

    /************************************************************************
     * Electron & NPM Library
     ************************************************************************/
    oAPP.remote = require('@electron/remote');
    oAPP.app = oAPP.remote.app;
    oAPP.tray = oAPP.remote.Tray;
    oAPP.dialog = oAPP.remote.dialog;
    oAPP.trayMenu = oAPP.remote.Menu;
    oAPP.apppath = oAPP.app.getAppPath();
    oAPP.userdata = oAPP.app.getPath("userData");
    oAPP.path = oAPP.remote.require('path');
    oAPP.fs = oAPP.remote.require('fs');
    oAPP.mimetype = require('mime-types');
    oAPP.randomkey = require("random-key");
    oAPP.ip = require('ip');
    oAPP.autoUpdater = oAPP.remote.require("electron-updater").autoUpdater;
    oAPP.octokit = oAPP.remote.require("@octokit/core").Octokit;
    oAPP.MongClinet = oAPP.remote.require('mongodb').MongoClient;
    oAPP.telegramBotAPI = oAPP.remote.require("node-telegram-bot-api");

    /************************************************************************
     * Prefix
     ************************************************************************/
    process.env.SERVER_COMPUTERNAME = "u4arndx";
    process.env.SERVER_LOG_PATH = "D:\\log\\u4a_sns_log";
    process.env.LOCAL_LOG_PATH = oAPP.path.join(oAPP.userdata, "log", "u4a_sns_log");


    // 컴퓨터 이름을 읽어서 백그라운드 모드일지 아닐지 판단
    if (process.env.COMPUTERNAME == process.env.SERVER_COMPUTERNAME) {
        oAPP.bIsBackgroundMode = true;
    }

    /************************************************************************
     * [Util] Local Js Path
     ************************************************************************/
    oAPP.JsPath = oAPP.path.join(oAPP.apppath, "js");

    oAPP.errorlog = require(oAPP.path.join(oAPP.JsPath, "errlog.js")); // 에러 로그 관련 util
    oAPP.mongdb = require(oAPP.path.join(oAPP.JsPath, "mongdb.js")); // 몽고 디비 연결 및 SNS별 Token Key 정보 구하기
    oAPP.autoUpdate = require(oAPP.path.join(oAPP.JsPath, "autoUpdate.js"));

    /************************************************************************
     * Auto Update Check
     ************************************************************************/

    // no build 일 경우는 자동 업데이트를 확인하지 않는다.
    if (oAPP.app.isPackaged) {
        await oAPP.autoUpdate.checkUpdate();
    }

    /************************************************************************
     * Mongdb & Telegram Info
     ************************************************************************/
    let Lpw = "%U4aIde&";
    Lpw = encodeURIComponent(Lpw);

    oAPP.MongDB_HOST = "mongodb://u4arnd:" + Lpw + "@118.34.215.175:9102/admin";

    let oResult = await oAPP.mongdb.onGET();
    if (oResult.RETCD == "E") {
        oErrLog.writeLog(oResult);
        return;
    }

    oAPP.telegramBOT = new oAPP.telegramBotAPI(oAPP.auth.telegram, {
        polling: false
    });

    /************************************************************************
     * SNS
     ************************************************************************/
    oAPP.facebook = require(oAPP.path.join(oAPP.JsPath, "facebook.js"));
    oAPP.youtube = require(oAPP.path.join(oAPP.JsPath, "youtube.js"));
    oAPP.instagram = require(oAPP.path.join(oAPP.JsPath, "instagram.js"));
    oAPP.kakao = require(oAPP.path.join(oAPP.JsPath, "kakao.js"));
    oAPP.telegram = require(oAPP.path.join(oAPP.JsPath, "telegram.js"));

    /************************************************************************
     * Library Url
     ************************************************************************/
    oAPP.fbUrl = "https://connect.facebook.net/en_US/sdk.js";
    oAPP.fbApi = "https://graph.facebook.com";

    /************************************************************************
     * Description
     ************************************************************************/
    oAPP.subject = {
        TITLE: "제목",
        TYPE: "모듈(업무)",
        DESC: "상세설명",
        SAMPLE_URL: "Sample URL",
        REF_IMG: "참고이미지"
    };

    /************************************************************************
     * Config Info
     ************************************************************************/
    oAPP.conf.localServerIP = oAPP.ip.address();
    oAPP.conf.localServerPort = 1333;

    oAPP.conf.youtube_server_port = 1977; // node server port    

    /************************************************************************
     * HttpServer 
     ************************************************************************/
    oAPP.server = require(oAPP.path.join(oAPP.JsPath, "CreateServer.js"));

    /************************************************************************
     * APP 에러 감지
     ************************************************************************/
    oAPP.fn.onError = (message, url, line, col, errorObj) => {

        let sErrMsg = `[window onError] : ${message} \n ${url}, ${line}:${col}`;

        // 포그라운드 모드 이면 오류 내용을 화면에 뿌려준다.
        if (!oAPP.bIsBackgroundMode) {
            oAPP.showErrorBox("script Error", sErrMsg);
            return;
        }

        // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)



    }; // end of oAPP.fn.onError

    oAPP.showErrorBox = (sTitle = "오류", sMsg) => {

        oAPP.dialog.showErrorBox(sTitle, sMsg);

    };

    /************************************************************************
     * APP 구동 시작
     ************************************************************************/
    oAPP.fn.onStart = () => {

        let oFrame = document.getElementById("ws_frame");
        if (!oFrame) {
            return;
        }

        let sUrl = oAPP.path.join(oAPP.apppath, "main.html");
        oFrame.src = sUrl;

    }; // end of oAPP.onStart

    document.addEventListener('deviceready', onDeviceReady, false);

    function onDeviceReady() {

        // APP 구동 시작
        oAPP.fn.onStart();

    }

    // 오류 감지
    window.onerror = oAPP.fn.onError;
    document.onerror = oAPP.fn.onError;

})(oAPP);