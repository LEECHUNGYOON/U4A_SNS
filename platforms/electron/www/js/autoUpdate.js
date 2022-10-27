let oAutoUpdate = {};

oAutoUpdate.checkUpdate = (autoUpdater) => {

    debugger;

    return new Promise((resolve, reject) => {       

        autoUpdater.on('checking-for-update', () => {

            console.log("업데이트 확인 중...");

        });

        autoUpdater.on('update-available', (info) => {

            console.log("업데이트가 가능합니다.");

        });

        autoUpdater.on('update-not-available', (info) => {

            resolve();

            console.log("현재 최신버전입니다.");

        });

        autoUpdater.on('error', (err) => {

            resolve();

            console.log('에러가 발생하였습니다. 에러내용 : ' + err);

        });

        autoUpdater.on('download-progress', (progressObj) => {


            var iPer = parseFloat(progressObj.percent).toFixed(2);

            console.log("Downloading..." + iPer);


            // oModel.setProperty("/BUSYPOP/TITLE", "Downloading...", true);

            // oModel.setProperty("/BUSYPOP/PERVALUE", iPer, true);

        });

        autoUpdater.on('update-downloaded', (info) => {

            console.log('업데이트가 완료되었습니다.');

            setTimeout(() => {

                autoUpdater.quitAndInstall(); //<--- 자동 인스톨 

            }, 3000);

        });

        autoUpdater.checkForUpdates();

    });

}; // end of oAutoUpdate.checkUpdate

module.exports = oAutoUpdate;