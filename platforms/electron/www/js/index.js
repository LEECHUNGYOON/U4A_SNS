window.oAPP = {};

((oAPP) => {
    "use strict";

    oAPP.fn = {};

    /************************************************************************
     * Electron & npm Library
     ************************************************************************/
    oAPP.remote = require('@electron/remote');
    oAPP.app = oAPP.remote.app;
    oAPP.apppath = oAPP.app.getAppPath();
    oAPP.path = oAPP.remote.require('path');

    /************************************************************************
     * SNS
     ************************************************************************/
    let sJsPath = oAPP.path.join(oAPP.apppath, "js");

    oAPP.facebook = require(oAPP.path.join(sJsPath, "facebook.js"));
    oAPP.youtube = require(oAPP.path.join(sJsPath, "youtube.js"));
    oAPP.instagram = require(oAPP.path.join(sJsPath, "instagram.js"));
    oAPP.kakao = require(oAPP.path.join(sJsPath, "kakao.js"));


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