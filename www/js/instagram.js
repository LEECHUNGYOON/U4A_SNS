let oInstagram = {};

const
    APPID = oAPP.auth.facebook.app_id,
    PAGEID = oAPP.auth.facebook.page_id,
    USERTOKEN = oAPP.auth.facebook.user_token,
    PAGETOKEN = oAPP.auth.facebook.page_token;

oInstagram.send = (oParams, cb) => {

    const FB = oAPP.FB;

    if (!oAPP.oChoiceInfo || !oAPP.oChoiceInfo.INSTAGRAM) {

        //Callback 
        cb(oParams);
        return;

    }

    // 페이스북 토큰 키로 인스타 계정 정보를 구한다.
    _fnGetAccount().then(_fnGetAccountThen).catch(_fnError);


    function _fnGetAccount() {

        return new Promise((resolve, reject) => {

            let sUrl = `${PAGEID}?fields=instagram_business_account&access_token=${PAGETOKEN}`;

            FB.api(sUrl, "GET",
                (res) => {

                    if (res && res.error) {

                        reject(res.error);

                        return;
                    }

                    resolve(res);

                });

        });

    } // end of _fnGetAccount

    function _fnGetAccountThen(oRes) {

        let sInstaAccId = oRes.instagram_business_account.id,
            oParam = {
                InstaAccId: sInstaAccId
            };

        _fnSetInstaMedia(sInstaAccId).then(_fnSetInstaMediaThen.bind(oParam)).catch(fnError);

    }

    function _fnSetInstaMedia(sInstaAccId) {

        return new Promise((resolve, reject) => {

            let sUrl = `${sInstaAccId}/media`;
            FB.api(sUrl, "POST", {
                    access_token: PAGETOKEN,
                    image_url: oParams.IMAGE.URL,
                    caption: oParams.DESC
                },
                (res) => {

                    if (res && res.error) {

                        reject(res.error);

                        return;
                    }

                    resolve(res);

                });

        });

    } // end of _fnSetInstaMedia

    function _fnSetInstaMediaThen(res) {

        let oParam = this,
            sCreationId = res.id;

        oParam.CreationId = sCreationId;

        _fnSetInstaMediaPublish(oParam).then(_fnSetInstaMediaPublishThen.bind(oParam)).catch(_fnError);


    } // end of _fnSetInstaMediaThen

    function _fnSetInstaMediaPublish(oParam) {

        return new Promise((resolve, reject) => {


            let sCreationId = oParam.CreationId,
                sInstaAccId = oParam.InstaAccId,
                sUrl = sInstaAccId + "/media_publish";

            FB.api(sUrl,
                "POST", {
                    access_token: PAGETOKEN,
                    creation_id: sCreationId
                },
                (res) => {

                    if (res && res.error) {

                        reject(res.error);

                        return;
                    }

                    resolve(res);

                });

        });

    } // end of _fnSetInstaMediaPublish


    function _fnSetInstaMediaPublishThen() {

        //Callback 
        cb(oParams);

    } // end of _fnSetInstaMediaPublishThen

    function _fnError() {


        // 오류 메시지



        //Callback 
        cb(oParams);

    }

};




module.exports = oInstagram;