let oAutoUpdate = {};

const
    remote = require('@electron/remote'),
    remoteMain = require('@electron/remote/main'),
    app = remote.app,
    path = remote.require('path'),
    apppath = app.getAppPath(),
    dialog = remote.dialog,
    JsPath = path.join(apppath, "js"),
    errorlog = require(path.join(JsPath, "errlog.js")), // 에러 로그 관련 util

    autoUpdater = remote.require("electron-updater").autoUpdater;

function fnShowUpdatePopup(fnCallback) {

    const BrowserWindow = remote.require('electron').BrowserWindow;

    let loadUrl = path.join(apppath, "update.html"),
        appIcon = path.join(apppath, "/img/logo.png");

    let browserWindowOpts = {
        "icon": appIcon,
        "height": 150,
        "width": 400,
        "frame": false,
        "alwaysOnTop": true,
        "autoHideMenuBar": true,
        "backgroundColor": "#030303",
        "webPreferences": {
            "devTools": true,
            "nodeIntegration": true,
            "enableRemoteModule": true,
            "contextIsolation": false,
            "backgroundThrottling": false,
            "nativeWindowOpen": true,
            "webSecurity": false
        }
    };

    let oBrowserWindow = new BrowserWindow(browserWindowOpts);
    remoteMain.enable(oBrowserWindow.webContents);

    oBrowserWindow.loadURL(loadUrl, browserWindowOpts);

    oBrowserWindow.webContents.on('did-finish-load', function () {

        fnCallback(oBrowserWindow);

    });

    // // Open the DevTools.
    // oBrowserWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    oBrowserWindow.on('closed', () => {

        let oCurrWin = remote.getCurrentWindow();
        oCurrWin.show();

        oBrowserWindow = null;

    });

} // end of fnShowUpdatePopup

oAutoUpdate.checkUpdate = () => {

    return new Promise((resolve, reject) => {

        let oCurrWin = remote.getCurrentWindow();
        oCurrWin.hide();

        fnShowUpdatePopup((oBrowserWindow) => {

            autoUpdater.on('checking-for-update', () => {

                oBrowserWindow.webContents.send('if-update-info', {
                    status: "업데이트 확인 중..."
                });

                console.log("업데이트 확인 중...");

            });

            autoUpdater.on('update-available', (info) => {

                oBrowserWindow.webContents.send('if-update-info', {
                    status: "업데이트 확인 중..."
                });

                console.log("업데이트가 가능합니다.");

            });

            autoUpdater.on('update-not-available', (info) => {

                oBrowserWindow.close();

                resolve();

                console.log("현재 최신버전입니다.");

            });

            autoUpdater.on('error', (err) => {

                let oCurrWin = remote.getCurrentWindow(),
                    bIsVisible = oCurrWin.isVisible(),
                    sErrMsg = `[update Error] : ${err.toString()}`;

                // 포그라운드 모드 이면 오류 내용을 화면에 뿌려준다.
                if (bIsVisible) {
                    dialog.showErrorBox("update Error", sErrMsg);
                }

                // 오류 로그 남기기            
                errorlog.writeLog("01", {
                    RETCD: "E",
                    RTMSG: err.toString()
                });

                // update Progress Popup 닫기
                oBrowserWindow.close();

                console.log('에러가 발생하였습니다. 에러내용 : ' + err);

                resolve();

            });

            autoUpdater.on('download-progress', (progressObj) => {

                var iPer = parseFloat(progressObj.percent).toFixed(2);

                oBrowserWindow.webContents.send('if-update-info', {
                    status: "Downloading...",
                    per: iPer
                });

                console.log("Downloading..." + iPer);

            });

            autoUpdater.on('update-downloaded', (info) => {

                oBrowserWindow.webContents.send('if-update-info', {
                    status: "업데이트가 완료되었습니다. 앱을 재시작 합니다."
                });

                console.log('업데이트가 완료되었습니다.');

                setTimeout(() => {

                    oBrowserWindow.close();

                    autoUpdater.quitAndInstall(); //<--- 자동 인스톨 

                }, 3000);

            });

            autoUpdater.checkForUpdates();

        });

    });

}; // end of oAutoUpdate.checkUpdate

module.exports = oAutoUpdate;