(async () => {
    "use strict";

    window.oAPP = {};

    oAPP.fn = {};
    oAPP.auth = {};
    oAPP.conf = {};

    oAPP.bIsBackgroundMode = false; // 현재 실행 환경이 백그라운드 모드인지 아닌지 Flag    

    /************************************************************************
     * window, document addEventListener
     ************************************************************************/
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onunhandledrejection);

    document.addEventListener("error", onError);

    /************************************************************************
     * Prefix
     ************************************************************************/
    process.env.SERVER_COMPUTERNAME = "U4ARNDX";
    process.env.SERVER_LOG_PATH = "D:\\log\\u4a_sns_log";
    // process.env.LOCAL_LOG_PATH = oAPP.path.join(oAPP.userdata, "log", "u4a_sns_log");
    process.env.LOCAL_LOG_PATH = "C:\\Tmp\\log\\u4a_sns_log";

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
     * [Util] Local Js Path
     ************************************************************************/
    oAPP.JsPath = oAPP.path.join(oAPP.apppath, "js");

    oAPP.errorlog = require(oAPP.path.join(oAPP.JsPath, "errlog.js")); // 에러 로그 관련 util
    oAPP.mongdb = require(oAPP.path.join(oAPP.JsPath, "mongdb.js")); // 몽고 디비 연결 및 SNS별 Token Key 정보 구하기
    oAPP.autoUpdate = require(oAPP.path.join(oAPP.JsPath, "autoUpdate.js"));

    oAPP.aEmogiIcons = require(oAPP.path.join(oAPP.apppath, "json", "emogi.json"));
    oAPP.emogiGroupIcons = require(oAPP.path.join(oAPP.apppath, "json", "emogi-group.json"));

    // 컴퓨터 이름을 읽어서 백그라운드 모드일지 아닐지 판단
    if (process.env.COMPUTERNAME === process.env.SERVER_COMPUTERNAME) {
        oAPP.bIsBackgroundMode = true; // 백그라운드 모드 Flag 
    }

    // error log를 저장할 폴더를 만든다.
    await oAPP.errorlog.createLogFolder();

    /************************************************************************
     * Auto Update Check
     ************************************************************************/
    // build 된 상태에서만 자동 업데이트 체크를 한다.
    if (oAPP.app.isPackaged) {
        await oAPP.autoUpdate.checkUpdate();
    }

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
    oAPP.conf.localServerPort = 9402;

    oAPP.conf.youtube_server_port = 1977; // node server port    

    /************************************************************************
     * Library Url
     ************************************************************************/
    oAPP.fbUrl = "https://connect.facebook.net/en_US/sdk.js";
    oAPP.fbApi = "https://graph.facebook.com";

    /************************************************************************
     * HttpServer 
     ************************************************************************/
    oAPP.server = require(oAPP.path.join(oAPP.JsPath, "CreateServer.js"));

    /************************************************************************
     * 게시글 유형 코드 가져오기
     ************************************************************************/
    oAPP.getModuleCode = require(oAPP.path.join(oAPP.JsPath, "getModuleCode.js"));

    let oModuleCode = await oAPP.getModuleCode.getDataALL(oAPP.remote);
    if (oModuleCode.RETCD == "E") {

        // 화면에 오류 내용을 출력한다.
        oAPP.dialog.showErrorBox("[mongodb.onGet error]", oModuleCode.RTMSG);

        oAPP.errorlog.writeLog("01", oModuleCode);

        return;
    }

    // 게시글 유형 정보를 글로벌 변수에 넣어둔다.
    oAPP.aModuleCode = oModuleCode.T_DATA;

    /************************************************************************
     * Mongdb 연결해서 sns 별 인증 토큰 키 가져오기 & Telegram Info
     ************************************************************************/
    let Lpw = "%U4aIde&";
    Lpw = encodeURIComponent(Lpw);

    oAPP.MongDB_HOST = "mongodb://u4arnd:" + Lpw + "@118.34.215.175:9102/admin";

    let oResult = await oAPP.mongdb.onGET();
    if (oResult.RETCD == "E") {

        // 화면에 오류 내용을 출력한다.
        oAPP.dialog.showErrorBox("[mongodb.onGet error]", oResult.RTMSG);

        oAPP.errorlog.writeLog("01", oResult);

        return;
    }

    oAPP.telegramBOT = new oAPP.telegramBotAPI(oAPP.auth.telegram, {
        polling: false
    });

    /************************************************************************
     * SNS (몽고DB 연결 성공 후 SNS 인증 키를 받아야하므로 반드시 여기에 있어야 함!)
     ************************************************************************/
    oAPP.facebook = require(oAPP.path.join(oAPP.JsPath, "facebook.js"));
    oAPP.youtube = require(oAPP.path.join(oAPP.JsPath, "youtube.js"));
    oAPP.instagram = require(oAPP.path.join(oAPP.JsPath, "instagram.js"));
    oAPP.kakao = require(oAPP.path.join(oAPP.JsPath, "kakao.js"));
    oAPP.telegram = require(oAPP.path.join(oAPP.JsPath, "telegram.js"));        

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

    /************************************************************************
     * 백그라운드 모드인지 아닌지 확인
     ************************************************************************/
    oAPP.isBackgroundMode = () => {

        let bIsBackgroundMode = false;

        // 컴퓨터 이름을 읽어서 백그라운드 모드일지 아닐지 판단
        if (process.env.COMPUTERNAME === process.env.SERVER_COMPUTERNAME) {
            bIsBackgroundMode = true; // 백그라운드 모드 Flag 
        }

        return bIsBackgroundMode;

    }; // end of oAPP.isBackgroundMode

    /************************************************************************
     * Youtube 인증 팝업 호출
     ************************************************************************/
    oAPP.onAuthCall = (URL, CB, sParams, oServer) => {

        // 테스트 웹뷰 
        var op = {
            "height": 900,
            "width": 1100,
            "modal": true,
            "fullscreen": false,
            "alwaysOnTop": true,
            "webPreferences": {
                "devTools": true,
                "nodeIntegration": true,
                "nativeWindowOpen": false,
                "contextIsolation": false,
                "webSecurity": false,
                "webviewTag": true

            }

        };

        oAPP.authWIN = new oAPP.remote.BrowserWindow(op);
        oAPP.authWIN.loadURL(`file://${__dirname}/auth.html`);
        oAPP.authWIN.webContents.on('did-finish-load', () => {
            oAPP.authWIN.show();
            oAPP.authWIN.webContents.send('IF_U4A_APP', {
                config: URL
            });

        });

        oAPP.authWIN.on('close', () => {

            delete oAPP.authWIN;

            oServer.close();

            CB(sParams);

        });

        var remote = require('@electron/remote');
        remote.require('@electron/remote/main').enable(oAPP.authWIN.webContents);

    }; // end of oAPP.onAuthCall

    /************************************************************************
     * 스크립트 오류 감지
     ************************************************************************/
    function onError(oEvent) {

        let oCurrWin = oAPP.remote.getCurrentWindow(),
            bIsVisible = oCurrWin.isVisible(),
            sErrMsg = `[window onerror] : ${oEvent.error.toString()}`;

        // 포그라운드 모드 이면 오류 내용을 화면에 뿌려준다.
        if (bIsVisible) {
            oAPP.dialog.showErrorBox("window onerror", sErrMsg);
        }

        let oErrMsg = {
            RETCD: "E",
            RTMSG: sErrMsg
        };

        // oAPP.errorlog가 있다면 
        if (!oAPP.errorlog) {
            return;
        }

        // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)
        oAPP.errorlog.writeLog("01", oErrMsg);

    } // end of onError

    /************************************************************************
     * 비동기 오류 (Promise 등..) 감지
     ************************************************************************/
    function onunhandledrejection(event) {

        let oCurrWin = oAPP.remote.getCurrentWindow(),
            bIsVisible = oCurrWin.isVisible(),
            sErrMsg = event.reason.toString();

        // 포그라운드 모드일 경우 오류 내용을 화면에 뿌려준다.
        if (bIsVisible) {
            oAPP.dialog.showErrorBox("unhandledrejection Error:", sErrMsg);
        }

        let oErrMsg = {
            RETCD: "E",
            RTMSG: sErrMsg
        };

        // oAPP.errorlog가 있다면 
        if (!oAPP.errorlog) {
            return;
        }

        // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)
        oAPP.errorlog.writeLog("01", oErrMsg);

    } // end of onunhandledrejection       

})().then(() => {

    // APP 구동 시작
    oAPP.fn.onStart();

});