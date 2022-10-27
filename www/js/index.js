window.oAPP = {};

(async (oAPP) => {
    "use strict";

    oAPP.fn = {};
    oAPP.auth = {};
    oAPP.conf = {};

    /************************************************************************
     * Electron & NPM Library
     ************************************************************************/
    oAPP.remote = require('@electron/remote');
    oAPP.app = oAPP.remote.app;
    oAPP.apppath = oAPP.app.getAppPath();
    oAPP.path = oAPP.remote.require('path');
    oAPP.fs = oAPP.remote.require('fs');
    oAPP.mimetype = require('mime-types');
    oAPP.randomkey = require("random-key");
    oAPP.ip = require('ip');

    /************************************************************************
     * Mongdb & Telegram Info
     ************************************************************************/
    oAPP.MongClinet = oAPP.remote.require('mongodb').MongoClient;
    oAPP.telegramBotAPI = oAPP.remote.require("node-telegram-bot-api");

    let Lpw = "%U4aIde&";
    Lpw = encodeURIComponent(Lpw);

    oAPP.MongDB_HOST = "mongodb://u4arnd:" + Lpw + "@118.34.215.175:9102/admin";

    let sJsPath = oAPP.path.join(oAPP.apppath, "js");

    // 몽고 디비 연결 및 SNS별 Token Key 정보 구하기
    oAPP.mongdb = require(oAPP.path.join(sJsPath, "mongdb.js"));

    let oResult = await oAPP.mongdb.onGET();
    if (oResult.RETCD == "E") {
        console.error(oResult.RTMSG);
        return;
    }

    oAPP.telegramBOT = new oAPP.telegramBotAPI(oAPP.auth.telegram, {
        polling: false
    });

    /************************************************************************
     * SNS
     ************************************************************************/
    oAPP.facebook = require(oAPP.path.join(sJsPath, "facebook.js"));
    oAPP.youtube = require(oAPP.path.join(sJsPath, "youtube.js"));
    oAPP.instagram = require(oAPP.path.join(sJsPath, "instagram.js"));
    oAPP.kakao = require(oAPP.path.join(sJsPath, "kakao.js"));
    oAPP.telegram = require(oAPP.path.join(sJsPath, "telegram.js"));

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
        SAMPLE_URL: "Sample URL"
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
    oAPP.server = require(oAPP.path.join(sJsPath, "CreateServer.js"));

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

})(oAPP);