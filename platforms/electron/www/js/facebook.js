let oFaceBook = {};

/*****************************************
 * Facebook APP 정보 및 인증 토큰
 *****************************************/
const
    APPID = oAPP.auth.facebook.app_id,
    PAGEID = oAPP.auth.facebook.page_id,
    USERTOKEN = oAPP.auth.facebook.user_token,
    PAGETOKEN = oAPP.auth.facebook.page_token;

oFaceBook.send = (oParams, cb) => {

    const FB = oAPP.FB;

    if (!oAPP.oChoiceInfo || !oAPP.oChoiceInfo.FACEBOOK) {

        //Callback 
        cb(oParams);
        return;

    }

    // oParams.VIDEO.URL = "https://youtu.be/S1j3i3Wxh7M";
    
    debugger;

    let sMessage = oFaceBook.getMessage(oParams);

    

    return;


    let sPath = `${PAGEID}/feed`,
        sMethod = "POST",
        oOptions = {
            access_token: `${PAGETOKEN}`,
            message: oParams.DESC
        };

    // oParams.VIDEO.URL <-- 있으면 이미지 무시하고 동영상 링크로 전송하기.
    if (oParams.VIDEO.URL !== "") {
        oOptions.link = oParams.VIDEO.URL;
    }

    _send(sPath, sMethod, oOptions).then(() => {

        debugger;

        cb(oParams);

    }).catch(_fnError);

    function _send(sPath, sMethod, oOptions) {

        return new Promise((resolve, reject) => {

            debugger;

            FB.api(
                sPath,
                sMethod,
                oOptions,
                function (res) {

                    debugger;

                    if (res && res.error) {

                        console.error(res.error.message);

                        reject(res.error.message);

                        return;
                    }

                    resolve();

                }
            );

        });

    } // end of _send

    function _fnError(oRes) {

        // 오류 메시지 수집






        cb(oParams);

    } // end of _fnError

    /*****************************************
     * 게시글 본문 구성하기
     *****************************************/
    function fnGetBodyText() {

        debugger;

        let ppp = oParams;

        let sBody = "";



        return sBody;

    } // end of fnGetBodyText

};

oFaceBook.getMessage = (oParams) => {

    debugger;


};

module.exports = oFaceBook;