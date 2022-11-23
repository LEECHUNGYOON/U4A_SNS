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
oFaceBook.send = async (oParams, oChoiceInfo, cb) => {

    window.jQuery = WINDOW.jQuery;

    console.log("페이스북 진입");

    if (!oChoiceInfo || !oChoiceInfo.FACEBOOK) {

        //Callback 
        cb(oParams);
        return;

    }

    // 동영상 또는 이미지 전송 여부 flag
    let bSend = false;

    // 유투브 전송한 동영상 링크 정보가 있을 경우
    if (oParams.VIDEO.YOUTUBE_URL) {

        await sendFeed(oParams);

        bSend = true;

    }

    // 이미지가 URL로 있거나 Blob로 있을 경우
    if ((oParams.IMAGE.URL && oParams.IMAGE.URL !== "") || (oParams.IMAGE.DATA && oParams.IMAGE.DATA !== "")) {

        await sendPhoto(oParams);

        bSend = true;
    }

    // 동영상 또는 이미지 둘중 하나라도 전송했다면 빠져나간다.
    if (bSend) {

        //Callback 
        cb(oParams);

        return;

    }

    // 나머지는 본문만 전송
    await sendFeed(oParams);

    //Callback 
    cb(oParams);

}; // end of oFaceBook.send

/************************************************************************
 * 게시글 올리기
 ************************************************************************/
function sendFeed(oParams) {

    return new Promise((resolve) => {

        let sPath = `${PAGEID}/feed`,
            sMethod = "POST",
            sMessage = getMessage(oParams);

        let oFormData = new FormData();
        oFormData.append("access_token", PAGETOKEN);
        oFormData.append("message", sMessage);

        // 유투브 URL이 있을 경우에만 Link 파라미터에 Url 값을 넣는다.
        if (oParams.VIDEO.YOUTUBE_URL && oParams.VIDEO.YOUTUBE_URL != "") {
            oFormData.append("link", oParams.VIDEO.YOUTUBE_URL);
        }

        let sUrl = oAPP.fbApi + "/" + sPath;

        jQuery.ajax({
            url: sUrl,
            processData: false, // 데이터 객체를 문자열로 바꿀지에 대한 값이다. true면 일반문자...
            contentType: false, // 해당 타입을 true로 하면 일반 text로 구분되어 진다.
            data: oFormData, // 위에서 선언한 fromdata
            type: sMethod,
            success: function (result) {

                resolve();

                // cb(oParams);

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
                onError(oErrMsg, resolve);

            }

        });

    });

} // end of sendPost

/*****************************************
 * 이미지와 게시글을 올리기
 *****************************************/
function sendPhoto(oParams) {

    return new Promise((resolve) => {

        let sPath = `${PAGEID}/photos`,
            sMethod = "POST",
            sMessage = getMessage(oParams);

        let oFormData = new FormData();
        oFormData.append("access_token", PAGETOKEN);
        oFormData.append("message", sMessage);
        oFormData.append("published", true);

        let sUrl = oAPP.fbApi + "/" + sPath;

        // 이미지 URL이 존재하는 경우
        if (oParams.IMAGE.URL && oParams.IMAGE.URL !== "") {

            oFormData.append("url", oParams.IMAGE.URL);

            jQuery.ajax({
                url: sUrl,
                processData: false,
                contentType: false,
                data: oFormData,
                type: sMethod,
                success: function (result) {

                    resolve();
                    // cb(oParams);

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
                    onError(oErrMsg, resolve);

                }

            });

            return;

        }

        // 이미지가 Blob로 존재하는 경우
        if (oParams.IMAGE.DATA && oParams.IMAGE.DATA !== "") {

            oFormData.append("source", oParams.IMAGE.DATA);

            jQuery.ajax({
                url: sUrl,
                processData: false, // 데이터 객체를 문자열로 바꿀지에 대한 값이다. true면 일반문자...
                contentType: false, // 해당 타입을 true로 하면 일반 text로 구분되어 진다.
                data: oFormData, // 위에서 선언한 fromdata
                type: sMethod,
                success: function (result) {

                    resolve();
                    // cb(oParams);

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
                    onError(oErrMsg, resolve);

                }

            });

            return;

        }

    });

} // end of sendPhoto

/************************************************************************
 * 게시글 본문 구성하기
 ************************************************************************/
function getMessage(oParams) {

    let oSubJect = oAPP.subject;

    // 제목
    let sMsg = `[ ${oSubJect.TITLE} ] \n\n`;
    sMsg += oParams.TITLE + " \n\n\n ";

    // 유형
    sMsg += `[ ${oSubJect.TYPE} ] \n\n`;
    sMsg += oParams.TYPE + " \n\n\n ";

    // 본문
    sMsg += `[ ${oSubJect.DESC} ] \n\n`;
    sMsg += oParams.DESC + " \n\n\n ";

    // Sample Url
    if (oParams.SAMPLE_URL) {
        sMsg += `[ ${oSubJect.SAMPLE_URL} ] \n\n`;
        sMsg += encodeURI(oParams.SAMPLE_URL) + " \n\n\n\n\n\n ";
    }

    // 참고이미지 
    if (oParams.IMAGE.T_URL &&
        oParams.IMAGE.T_URL.length !== 0) {

        sMsg += `[ ${oSubJect.REF_IMG} ] \n\n `;

        let iSubImageLength = oParams.IMAGE.T_URL.length;

        for (var i = 0; i < iSubImageLength; i++) {

            let oSubImgUrl = oParams.IMAGE.T_URL[i];

            sMsg += encodeURI(oSubImgUrl.URL) + " \n\n ";

        }

    }

    sMsg += " \n\n\n ";

    // 이미지 URL이 있다면 해당 url을 본문에 내용 추가
    var LIMG_URL = oParams.IMAGE.URL;
    if (LIMG_URL === "") {
        LIMG_URL = oParams.ATTCH.IMG_URL;
    }

    if (LIMG_URL != "") {
        sMsg += `[${oSubJect.REF_IMG_URL}] ⬇️⬇️ \n\n`; // [참고이미지 URL Link]
        sMsg += LIMG_URL + "\n\n";
    }


    // 동영상 URL이 있다면 해당 url을 본문에 내용 추가
    var LVDO_URL = oParams.VIDEO.URL;
    if (LVDO_URL === "") {
        LVDO_URL = oParams.ATTCH.VIDEO_URL;
    }
    if (LVDO_URL !== "") {
        sMsg += `[${oSubJect.REF_VDO_URL}] ⬇️⬇️ \n\n`; // [참고동영상 URL Link]
        sMsg += LVDO_URL + "\n\n";
    }

    // let sPrefixUrl = "http://www.u4ainfo.com/u4a_sns/coproxy.html?file_id=",
    //     sImageFileId = oParams.IMAGE.FILE_ID,
    //     sVideoFileId = oParams.VIDEO.FILE_ID;

    // // 텔레그램에 이미지 파일 아이디가 있을 경우 해당 url을 본문에 내용 추가
    // if (sImageFileId && sImageFileId !== "") {
    //     sMsg += `[${oSubJect.REF_IMG_URL}] ⬇️⬇️ \n\n`; // [참고이미지 URL Link]
    //     sMsg += encodeURI(sPrefixUrl + sImageFileId) + "\n\n";
    // }

    // // 텔레그램에 동영상 파일 아이디가 있을 경우 해당 url을 본문에 내용 추가
    // if (sVideoFileId && sVideoFileId !== "") {
    //     sMsg += `[${oSubJect.REF_VDO_URL}] ⬇️⬇️ \n\n`; // [참고동영상 URL Link]
    //     sMsg += encodeURI(sPrefixUrl + sVideoFileId) + "\n\n";
    // }

    // // 이미지 URL이 있다면 해당 url을 본문에 내용 추가
    // if (oParams.IMAGE.URL && oParams.IMAGE.URL !== "") {
    //     sMsg += `[${oSubJect.REF_IMG_URL}] ⬇️⬇️ \n\n`; // [참고이미지 URL Link]
    //     sMsg += encodeURI(oParams.IMAGE.URL) + "\n\n";
    // }

    // // 동영상 URL이 있다면 해당 url을 본문에 내용 추가
    // if (oParams.VIDEO.URL && oParams.VIDEO.URL !== "") {
    //     sMsg += `[${oSubJect.REF_VDO_URL}] ⬇️⬇️ \n\n`; // [참고동영상 URL Link]
    //     sMsg += encodeURI(oParams.VIDEO.URL) + "\n\n";
    // }

    // // 해시태그
    // let iHashLength = oParams.HASHTAG.length;
    // if (iHashLength !== 0) {

    //     for (var i = 0; i < iHashLength; i++) {

    //         let sHash = oParams.HASHTAG[i];

    //         sMsg += sHash + " \n ";

    //     }

    // }

    // 해시태그 말기
    sMsg += oAPP.fn.getHashText(oParams.HASHTAG);

    return sMsg;

}; // end of getMessage

/************************************************************************
 * 공통 에러
 ************************************************************************/
function onError(oErr, cb) {

    let oErrLog = oAPP.errorlog;

    // 공통 에러 수집..
    oErrLog.addLog(oErr);

    cb();

} // end of onError

module.exports = oFaceBook;