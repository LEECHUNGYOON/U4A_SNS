const {
    promises
} = require("stream");

let oInstagram = {};

/************************************************************************
 * Facebook APP 정보 및 인증 토큰
 ************************************************************************/
const
    APPID = oAPP.auth.facebook.app_id,
    PAGEID = oAPP.auth.facebook.page_id,
    USERTOKEN = atob(oAPP.auth.facebook.user_token),
    PAGETOKEN = atob(oAPP.auth.facebook.page_token);

oInstagram.send = (oParams, oChoiceInfo, cb) => {

    if (!oChoiceInfo || !oChoiceInfo.INSTAGRAM) {

        //Callback 
        cb(oParams);
        return;

    }

    // 동영상 URL 경로가 있을 경우
    if (oParams.VIDEO.URL !== "") {

        getAccount().then((oAccInfo) => {

            sendVideo(oParams, oAccInfo, cb);

        }).catch((oErr) => {

            // 공통 에러
            onError(oParams, oErr, cb);

        });

        return;

    }

    // 이미지가 없다면 오류찍고 빠져나간다.
    if (!oParams.IMAGE.URL) {

        // 오류메시지 수집

        var oErr = {
            RETCD: "E",
            ETMSG: "[INSTAGRAM] 이미지 URL은 필수 입니다!!"
        }

        // 공통 에러
        onError(oParams, oErr, cb);

        return;

    }

    // [일반 본문 전송]
    // - 이미지는 필수 및 URL Path 방식만 가능함.    
    getAccount().then((oAccInfo) => {

        sendPost(oParams, oAccInfo, cb);

    }).catch((oErr) => {

        // 공통 에러
        onError(oParams, oErr, cb);

    });

}; // end of oInstagram.send

/************************************************************************
 * Instagram Account 정보 구하기
 ************************************************************************/
function getAccount() {

    return new Promise((resolve, reject) => {

        let sUrl = `${PAGEID}?fields=instagram_business_account&access_token=${PAGETOKEN}`;

        const FB = oAPP.jQuery.extend(true, {}, oAPP.FB);
        // const FB = oAPP.FB;
        // const FB = oAPP.FB;

        FB.api(sUrl, "GET",
            (res) => {

                if (res && res.error) {

                    reject(res.error);

                    return;
                }

                let sInstaAccId = res.instagram_business_account.id,
                    oAccInfo = {
                        InstaAccId: sInstaAccId
                    };

                resolve(oAccInfo);

            });

    });

} // end of getAccount

/************************************************************************
 * 비디오 전송
 ************************************************************************
 * @param {Object} oParams 
 * - SNS 공통 구조
 *
 * @param {Object} oAccInfo
 * - Instagram Account 정보
 * 
 * @param {function} cb
 * - callback function
 ************************************************************************/
function sendVideo(oParams, oAccInfo, cb) {

    // const FB = oAPP.FB;
    const FB = oAPP.jQuery.extend(true, {}, oAPP.FB);
    
    let sCaption = getMessage(oParams), // 본문 구성
        sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sUrl = `${sInstaAccId}/media`; // 호출 API

    FB.api(sUrl, "POST", {
            access_token: PAGETOKEN,
            media_type: "VIDEO",
            video_url: oParams.VIDEO.URL,
            caption: sCaption
        },
        (res) => {

            if (res && res.error) {

                // 오류 수집
                onError(oParams, res.error, cb);

                return;
            }

            sendStatus(oParams, oAccInfo, res, cb);

        });

} // end of sendVideo

/************************************************************************
 * 일반 게시물 전송 [이미지 URL 필수!!]
 ************************************************************************
 * @param {Object} oParams 
 * - SNS 공통 구조
 *
 * @param {Object} oAccInfo
 * - Instagram Account 정보
 * 
 * @param {function} cb
 * - callback function
 ************************************************************************/

function sendPost(oParams, oAccInfo, cb) {

    const FB = oAPP.jQuery.extend(true, {}, oAPP.FB);

    let sCaption = getMessage(oParams), // 본문 구성
        sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sUrl = `${sInstaAccId}/media`; // 호출 API

    FB.api(sUrl, "POST", {
            access_token: PAGETOKEN,
            image_url: oParams.IMAGE.URL,
            caption: sCaption
        },
        (res) => {

            if (res && res.error) {

                // 오류 수집
                onError(oParams, res.error, cb);

                return;
            }

            sendStatus(oParams, oAccInfo, res, cb);

        });

} // end of sendPost

/************************************************************************
 * 게시물 전송 상태 확인
 ************************************************************************/
function sendStatus(oParams, oAccInfo, oRes, cb) {

    const FB = oAPP.jQuery.extend(true, {}, oAPP.FB);
    // const FB = oAPP.FB;

    let sId = oRes.id,
        sUrl = `${sId}?fields=status_code&access_token=${PAGETOKEN}`; // 호출 API

    FB.api(sUrl, "GET", (res) => {

        if (res && res.error) {

            // 오류 수집
            onError(oParams, res.error, cb);

            return;
        }

        let oErr = {
            RETCD: "",
            RTMSG: ""
        };

        // 상태코드를 확인한다.
        switch (res.status_code) {
            case "EXPIRED":

                oErr.RETCD = "E";
                oErr.RTMSG = "The container was not published within 24 hours and has expired.";

                // 오류 수집
                onError(oParams, oErr, cb);

                return;

            case "ERROR":

                oErr.RETCD = "E";
                oErr.RTMSG = "The container failed to complete the publishing process.";

                // 오류 수집
                onError(oParams, oErr, cb);

                return;

            case "FINISHED":

                sendPublish(oParams, oAccInfo, res, cb);

                return;

            default:

                // 아직 게시 준비가 되어 있지 않다면 3초 뒤에 상태를 다시 확인
                setTimeout(() => {

                    sendStatus(oParams, oAccInfo, res, cb);

                }, 3000);

                return;

        }


    });


} // end end of sendStatus

/************************************************************************
 * 실제 인스타 그램에 게시 하기 (Commit work 개념)
 ************************************************************************/
function sendPublish(oParams, oAccInfo, oRes, cb) {

    const FB = oAPP.jQuery.extend(true, {}, oAPP.FB);
    // const FB = oAPP.FB;

    let sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sUrl = `${sInstaAccId}/media_publish`; // 호출 API

    FB.api(sUrl, "POST", {
            access_token: PAGETOKEN,
            creation_id: oRes.id
        },
        (res) => {

            if (res && res.error) {

                // 오류 수집
                onError(oParams, res.error, cb);

                return;
            }

            cb(oParams);

        });

} // end of sendPublish

/************************************************************************
 * Promise 공통 에러
 ************************************************************************/
function onError(oParams, oErr, cb) {

    // 공통 에러 수집..



    cb(oParams);

} // end of onError

/************************************************************************
 * 게시글 본문 구성하기
 ************************************************************************/
function getMessage(oParams) {

    let oSubJect = oAPP.subject;

    let sMsg = `.. \n\n [ ${oSubJect.TITLE} ] \n\n`;
    sMsg += oParams.TITLE + "\n\n\n";

    sMsg += `[ ${oSubJect.TYPE} ] \n\n`;
    sMsg += oParams.TYPE + "\n\n\n";

    sMsg += `[ ${oSubJect.DESC} ] \n\n`;
    sMsg += oParams.DESC + "\n\n\n";

    if (oParams.SAMPLE_URL) {
        sMsg += `[ ${oSubJect.SAMPLE_URL} ] \n\n`;
        sMsg += oParams.SAMPLE_URL + "\n\n\n\n\n\n";
    }

    let iHashLength = oParams.HASHTAG.length;
    if (iHashLength !== 0) {

        for (var i = 0; i < iHashLength; i++) {

            let oHashItem = oParams.HASHTAG[i];
            if (!oHashItem.TAG) {
                continue;
            }

            sMsg += oHashItem.TAG + "\n";

        }

    }

    return sMsg;

}; // end of getMessage

module.exports = oInstagram;