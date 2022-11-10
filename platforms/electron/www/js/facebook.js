let oFaceBook = {};

/************************************************************************
 * Facebook APP 정보 및 인증 토큰
 ************************************************************************/
const
    APPID = oAPP.auth.facebook.app_id,
    PAGEID = oAPP.auth.facebook.page_id,
    USERTOKEN = oAPP.auth.facebook.user_token,
    PAGETOKEN = oAPP.auth.facebook.page_token;

const
    WINDOW = global.document.ws_frame;

/************************************************************************
 * Facebook 전송
 ************************************************************************
 * @param {Object} oParams
 * - SNS 본문 공통 구조
 * 
 * @param {Object} oChoiceInfo
 * - 전송할 SNS 종류
 * 
 ************************************************************************/
oFaceBook.send = (oParams, oChoiceInfo, cb) => {

    debugger;

    window.jQuery = WINDOW.jQuery;

    console.log("페이스북 진입");

    if (!oChoiceInfo || !oChoiceInfo.FACEBOOK) {

        //Callback 
        cb(oParams);

        return;

    }

    // oParams.VIDEO.URL = "https://youtu.be/S1j3i3Wxh7M";

    // oParams.VIDEO.URL <-- 있으면 이미지 무시하고 동영상 링크로 전송하기.

    // if (oParams.VIDEO.URL !== "") {

    //     sendFeed(oParams, cb);

    //     return;

    // }

    // 동영상 또는 이미지 전송 여부 flag
    let bSend = false;

    // 유투브 전송한 동영상 링크 정보가 있을 경우
    if (oParams.VIDEO.YOUTUBE_URL) {

        sendFeed(oParams, cb);

        bSend = true;

    }

    // 이미지가 URL로 있거나 Blob로 있을 경우
    if (oParams.IMAGE.URL !== "" || oParams.IMAGE.DATA !== "") {

        sendPhoto(oParams, cb);

        bSend = true;

    }

    // 동영상 또는 이미지 둘중 하나라도 전송했다면 빠져나간다.
    if (bSend) {

        //Callback 
        cb(oParams);

        return;

    }

    // 나머지는 본문만 전송
    sendFeed(oParams, cb);

}; // end of oFaceBook.send

/************************************************************************
 * 게시글 올리기
 ************************************************************************/
function sendFeed(oParams, cb) {

    let sPath = `${PAGEID}/feed`,
        sMethod = "POST",
        sMessage = getMessage(oParams);

    let oFormData = new FormData();
    oFormData.append("access_token", PAGETOKEN);
    oFormData.append("message", sMessage);

    // // oParams.VIDEO.URL <-- 있으면 이미지 무시하고 동영상 링크로 전송하기.
    if (oParams.VIDEO.URL !== "") {
        oFormData.append("link", oParams.VIDEO.URL);
    }

    let sUrl = oAPP.fbApi + "/" + sPath;

    jQuery.ajax({
        url: sUrl,
        processData: false, // 데이터 객체를 문자열로 바꿀지에 대한 값이다. true면 일반문자...
        contentType: false, // 해당 타입을 true로 하면 일반 text로 구분되어 진다.
        data: oFormData, // 위에서 선언한 fromdata
        type: sMethod,
        success: function (result) {

            cb(oParams);

        },
        error: function (e) {

            let oRes = e.responseJSON,
                oErr = oRes.error;

            let oErrMsg = {
                RETCD: "E",
                RTMSG: "[ FACEBOOK #1 - sendFeed ] 게시글 올리기 오류 : \n\n" + oErr.message
            };

            console.error(oErr.message);

            // 오류 수집 
            onError(oParams, oErrMsg, cb);

        }

    });

} // end of sendPost

/*****************************************
 * 이미지와 게시글을 올리기
 *****************************************/
function sendPhoto(oParams, cb) {

    let sPath = `${PAGEID}/photos`,
        sMethod = "POST",
        sMessage = getMessage(oParams);

    let oFormData = new FormData();
    oFormData.append("access_token", PAGETOKEN);
    oFormData.append("message", sMessage);
    oFormData.append("published", true);

    let sUrl = oAPP.fbApi + "/" + sPath;

    // 이미지 URL이 존재하는 경우
    if (oParams.IMAGE.URL !== "") {

        oFormData.append("url", oParams.IMAGE.URL);

        jQuery.ajax({
            url: sUrl,
            processData: false,
            contentType: false,
            data: oFormData,
            type: sMethod,
            success: function (result) {

                cb(oParams);

            },
            error: function (e) {

                let oRes = e.responseJSON,
                    oErr = oRes.error;

                let oErrMsg = {
                    RETCD: "E",
                    RTMSG: "[ FACEBOOK #2 - sendPhoto(URL) ] 게시글 올리기 오류 :  \n\n" + oErr.message
                };

                console.error(oErr.message);

                // 오류 수집 
                onError(oParams, oErrMsg, cb);

            }

        });

        return;

    }

    // 이미지가 Blob로 존재하는 경우
    if (oParams.IMAGE.DATA !== "") {

        oFormData.append("source", oParams.IMAGE.DATA);

        jQuery.ajax({
            url: sUrl,
            processData: false, // 데이터 객체를 문자열로 바꿀지에 대한 값이다. true면 일반문자...
            contentType: false, // 해당 타입을 true로 하면 일반 text로 구분되어 진다.
            data: oFormData, // 위에서 선언한 fromdata
            type: sMethod,
            success: function (result) {

                cb(oParams);

            },
            error: function (e) {

                let oRes = e.responseJSON,
                    oErr = oRes.error;

                let oErrMsg = {
                    RETCD: "E",
                    RTMSG: "[ FACEBOOK #3 - sendPhoto(blob) ] 게시글 올리기 오류 :  \n\n" + oErr.message
                };

                console.error(oErr.message);

                // 오류 수집 
                onError(oParams, oErrMsg, cb);

            }

        });

        return;

    }

} // end of sendPhoto

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

            let sHash = oParams.HASHTAG[i];

            sMsg += sHash + " \n ";

        }

    }

    return sMsg;

}; // end of getMessage

/************************************************************************
 * 공통 에러
 ************************************************************************/
function onError(oParams, oErr, cb) {

    let oErrLog = oAPP.errorlog;

    // 공통 에러 수집..
    oErrLog.addLog(oErr);

    cb(oParams);

} // end of onError

module.exports = oFaceBook;