let oAutoUpdate = {};

const autoUpdater = oAPP.autoUpdater;

oAutoUpdate.checkUpdate = () => {

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

            // 오류 로그 남기기            
            oAPP.errorlog.writeLog("01",{
                RETCD: "E",
                RTMSG: err.toString()
            });

            console.log('에러가 발생하였습니다. 에러내용 : ' + err);

            resolve();            

        });

        autoUpdater.on('download-progress', (progressObj) => {

            var iPer = parseFloat(progressObj.percent).toFixed(2);

            console.log("Downloading..." + iPer);

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