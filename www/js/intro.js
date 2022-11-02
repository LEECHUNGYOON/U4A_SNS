(async () => {
    "use strict";

    let oAPP = {};
    
    oAPP.remote = require('@electron/remote');
    oAPP.app = oAPP.remote.app;
    oAPP.path = oAPP.remote.require('path');
    oAPP.apppath = oAPP.app.getAppPath();

    oAPP.JsPath = oAPP.path.join(oAPP.apppath, "js");
    oAPP.autoUpdater = oAPP.remote.require("electron-updater").autoUpdater;

    oAPP.errorlog = require(oAPP.path.join(oAPP.JsPath, "errlog.js")); // 에러 로그 관련 util

    oAPP.onStart = async () => {

        oAPP.fnDisplayCurrentVersion();

        await oAPP.onAutoUpdate();


    };

    oAPP.onAutoUpdate = () => {

        return new Promise((resolve) => {




        });

    };


    oAPP.fnDisplayCurrentVersion = () => {

        let oVerTxt = document.getElementById("versionTxt");
        if (oVerTxt == null) {
            return;
        }

        let sVersion = oAPP.app.getVersion();

        oVerTxt.innerHTML = `version ${sVersion}`;

    };

    window.addEventListener("DOMContentLoaded", () => {

        oAPP.onStart();

    });

    window.oAPP = oAPP;
    
})();