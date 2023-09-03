(() => {
    "use strict";

    const IPCRENDERER = require('electron').ipcRenderer;

    IPCRENDERER.on('if-update-info', (events, oInfo) => {

        let oProgress = document.getElementById("progressBar_dynamic"),
            oStatus = document.getElementById("statusText"),
            oVer = document.getElementById("versionTxt");

        if (oInfo.status) {
            oStatus.innerHTML = oInfo.status;
        }

        if(oInfo.ver){
            oVer.innerHTML = oInfo.ver;
        }

        if (oInfo.per) {
            oProgress.style.width = `${oInfo.per}%`;
        }

    });

})();