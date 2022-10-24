window.oAPP = {};

((oAPP) => {
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

    /************************************************************************
     * Authentication Info
     ************************************************************************/
    let sAuthPath = oAPP.path.join(oAPP.apppath, "auth");

    oAPP.auth.facebook = require(oAPP.path.join(sAuthPath, "facebook-auth.json"));
    oAPP.auth.youtube = require(oAPP.path.join(sAuthPath, "youtube-auth.json"));   

    /************************************************************************
     * SNS
     ************************************************************************/
    let sJsPath = oAPP.path.join(oAPP.apppath, "js");

    oAPP.facebook = require(oAPP.path.join(sJsPath, "facebook.js"));
    oAPP.youtube = require(oAPP.path.join(sJsPath, "youtube.js"));
    oAPP.instagram = require(oAPP.path.join(sJsPath, "instagram.js"));
    oAPP.kakao = require(oAPP.path.join(sJsPath, "kakao.js"));
    oAPP.telegram = require(oAPP.path.join(sJsPath, "telegram.js"));

    /************************************************************************
     * Config Info
     ************************************************************************/
    oAPP.conf.server_port = 1977; // node server port





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

})(oAPP);

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    // APP 구동 시작
    oAPP.fn.onStart();

}