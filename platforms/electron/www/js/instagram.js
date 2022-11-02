let oInstagram = {};

/************************************************************************
 * Facebook APP 정보 및 인증 토큰
 ************************************************************************/
// const
//     APPID = oAPP.auth.facebook.app_id,
//     PAGEID = oAPP.auth.facebook.page_id,
//     USERTOKEN = oAPP.auth.facebook.user_token,
//     PAGETOKEN = oAPP.auth.facebook.page_token;
const
    APPID = oAPP.auth.facebook.app_id,
    PAGEID = "101385506102675",
    USERTOKEN = oAPP.auth.facebook.user_token,
    PAGETOKEN = "EAAFjhb2eVusBAC7rBo1Ewa7fTO2VMWCbeTvAx94HxLbK8kHbASR7L8H7qp0Ym1GYiOVIZBSZBFZBUCC2R59yVcUCEXUzWP5cPQNuuVothn3U0ZBXO7y1W9q1VaNt8t1xgpC9896LWrUMIVSSXsVKLBJnwQvhZByv4FVqNcBW1zFDkyHFqzzXq";
    
const
    WINDOW = global.document.ws_frame;

let oErrLog = oAPP.errorlog;

oInstagram.send = (oParams, oChoiceInfo, cb) => {

    debugger;

    window.jQuery = WINDOW.jQuery;

    if (!oChoiceInfo || !oChoiceInfo.INSTAGRAM) {

        //Callback 
        cb(oParams);

        return;

    }

    // 동영상 URL 경로가 있을 경우
    if (oParams.VIDEO.URL !== "") {

        // 인스타 계정 정보 구하기
        getAccount(
            (oAccInfo) => { // success

                // 동영상 전송!!
                sendVideo(oParams, oAccInfo, cb);

            }, (oErr) => { // error

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

    // 인스타 계정 정보 구하기
    getAccount(
        (oAccInfo) => { // success

            // 게시물 전송
            sendPost(oParams, oAccInfo, cb);

        }, (oErr) => { // error

            // 공통 에러
            onError(oParams, oErr, cb);

        });

}; // end of oInstagram.send

/************************************************************************
 * 인스타 계정 정보 구하기
 ************************************************************************/
function getAccount(cbSuccess, cbError) {

    let sPath = `${PAGEID}?fields=instagram_business_account&access_token=${PAGETOKEN}`,
        sMethod = "GET",
        sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        type: sMethod,
        success: function (res) {

            if (!res.instagram_business_account) {

                let oErrMsg = {
                    RETCD: "E",
                    RTMSG: "[ INSTAGRAM #1 - getAccount ] 인스타 계정 오류"
                };

                // 오류 수집 
                cbError(oErrMsg);

                return;
            }

            let sInstaAccId = res.instagram_business_account.id,
                oAccInfo = {
                    InstaAccId: sInstaAccId
                };

            cbSuccess(oAccInfo);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ INSTAGRAM #1 - getAccount ] 인스타 계정 정보 오류 :  \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            cbError(oParams, oErrMsg, cb);

        }

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

    let sCaption = getMessage(oParams), // 본문 구성
        sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sPath = `${sInstaAccId}/media`, // 호출 API  
        sMethod = "POST";

    let oFormData = new FormData();
    oFormData.append("access_token", PAGETOKEN);
    oFormData.append("media_type", "VIDEO");
    oFormData.append("video_url", oParams.VIDEO.URL);
    oFormData.append("caption", sCaption);

    let sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        processData: false,
        contentType: false,
        data: oFormData,
        type: sMethod,
        success: function (res) {

            setTimeout(() => {

                sendStatus(oParams, oAccInfo, res, cb);

            }, 3000);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ INSTAGRAM #2 - sendVideo ] 비디오 전송 오류 :  \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            onError(oParams, oErrMsg, cb);

        }

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

    let sCaption = getMessage(oParams), // 본문 구성
        sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sPath = `${sInstaAccId}/media`, // 호출 API
        sMethod = "POST";

    let oFormData = new FormData();
    oFormData.append("access_token", PAGETOKEN);
    oFormData.append("image_url", oParams.IMAGE.URL);
    oFormData.append("caption", sCaption);

    let sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        processData: false,
        contentType: false,
        data: oFormData,
        type: sMethod,
        success: function (res) {

            setTimeout(() => {

                sendStatus(oParams, oAccInfo, res, cb);

            }, 5000);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ INSTAGRAM #3 - sendPost ] 일반 게시물 전송 오류 :  \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            onError(oParams, oErrMsg, cb);

        }

    });

} // end of sendPost

/************************************************************************
 * 게시물 전송 상태 확인
 ************************************************************************/
function sendStatus(oParams, oAccInfo, oRes, cb) {

    let sId = oRes.id,
        sPath = `${sId}?fields=status_code&access_token=${PAGETOKEN}`, // 호출 API
        sMethod = "GET";

    let sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        type: sMethod,
        success: function (res) {

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

                    // 아직 게시 준비가 되어 있지 않다면 5초 뒤에 상태를 다시 확인
                    setTimeout(() => {

                        sendStatus(oParams, oAccInfo, res, cb);

                    }, 5000);

                    return;

            }

            // cb(oParams);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ INSTAGRAM #4 - sendStatus ] 게시물 전송 상태 확인 오류 : \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            onError(oParams, oErrMsg, cb);

        }

    });

} // end end of sendStatus

/************************************************************************
 * 실제 인스타 그램에 게시 하기 (Commit work 개념)
 ************************************************************************/
function sendPublish(oParams, oAccInfo, oRes, cb) {

    let sInstaAccId = oAccInfo.InstaAccId, // insta 계정 Id
        sPath = `${sInstaAccId}/media_publish`, // 호출 API
        sMethod = "POST";

    let oFormData = new FormData();
    oFormData.append("access_token", PAGETOKEN);
    oFormData.append("creation_id", oRes.id);

    let sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        processData: false,
        contentType: false,
        data: oFormData,
        type: sMethod,
        success: function (res) {

            cb(oParams);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ INSTAGRAM #5 - sendPublish ] : \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            onError(oParams, oErrMsg, cb);

        }

    });

} // end of sendPublish

/************************************************************************
 * 게시글 본문 구성하기
 ************************************************************************/
function getMessage(oParams) {

    let oSubJect = oAPP.subject;

    let sMsg = `[ ${oSubJect.TITLE} ] \n\n`;
    sMsg += oParams.TITLE + " \n\n\n ";

    sMsg += `[ ${oSubJect.TYPE} ] \n\n`;
    sMsg += oParams.TYPE + " \n\n\n ";

    sMsg += `[ ${oSubJect.DESC} ] \n\n`;
    sMsg += oParams.DESC + " \n\n\n ";

    if (oParams.SAMPLE_URL) {
        sMsg += `[ ${oSubJect.SAMPLE_URL} ] \n\n`;
        sMsg += oParams.SAMPLE_URL + " \n\n\n\n\n\n ";
    }

    if (oParams.IMAGE.T_URL &&
        oParams.IMAGE.T_URL.length !== 0) {

        sMsg += `[ ${oSubJect.REF_IMG} ] \n\n `;

        let iSubImageLength = oParams.IMAGE.T_URL.length;

        for (var i = 0; i < iSubImageLength; i++) {

            let oSubImgUrl = oParams.IMAGE.T_URL[i];

            sMsg += oSubImgUrl.URL + " \n\n ";

        }

    }

    sMsg += " \n\n\n ";

    let iHashLength = oParams.HASHTAG.length;
    if (iHashLength !== 0) {

        for (var i = 0; i < iHashLength; i++) {

            let oHashItem = oParams.HASHTAG[i];
            if (!oHashItem.TAG) {
                continue;
            }

            sMsg += oHashItem.TAG + " \n ";

        }

    }

    return sMsg;

}; // end of getMessage

/************************************************************************
 * 공통 에러
 ************************************************************************/
function onError(oParams, oErr, cb) {

    // 공통 에러 수집..
    oErrLog.addLog(oErr);

    cb(oParams);

} // end of onError

module.exports = oInstagram;