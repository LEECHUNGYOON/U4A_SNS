/* ================================================================= */
// 설치 npm 
// npm install youtube-api
// npm install open
// npm install http
/* ================================================================= */

/* ================================================================= */
// I/F 필드 정의 
/* ================================================================= */
/*
var TY_IFDATA = {

    "TITLE": "",      //제목 
    "TYPE" : "",      //문서 유형
    "DESC" : "",      //내역 
    "SAMPLE_URL": "", //샘플 URL
    "IMAGE": {
       "URL" :"",     //대표 이미지 URL
       "T_URL":[],    //서브 이미지 URL 
       "DATA": ""     //대표 이미지 Data (Base64)
    },
    "VIDEO": {
       "URL"  : "",   //동영상 URL 
       "FPATH": ""    //동영상 path(PC 디렉토리 경로)
    },
    "HASHTAG" : []    //해시태그
};
*/
/* ================================================================= */


/* ================================================================= */
// 사용 예시 
// var ret = require(oAPP.path.join(__dirname, 'js/youtube.js'));
//     ret.send(PARAM, CB);
//                     
// 
/* ================================================================= */

let oServer = null;
let CREDENTIALS_PATH = "F:\\cordova_u4a\\electron\\U4A_HTTP_CLIENT_SERVER\\www\\json\\data.json";

/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

// 원하는 문자열 길이만큼 자르기
function cutByMaxStr(str, maxLength) {

    if (str == undefined || str == null) {
        return '';
    }

    if (str.length > maxLength) {
        str = str.substring(0, maxLength);
        // str을 maxLength 길이만큼 자른다
    }

    return str;

}

// 원하는 bytes 만큼 텍스트 자르기 
function cutByLen(str, maxByte) {

    if (str == undefined || str == null) {
        return '';
    }

    for (b = i = 0; c = str.charCodeAt(i);) {

        b += c >> 7 ? 2 : 1;

        if (b > maxByte)

            break;

        i++;

    }

    return str.substring(0, i);

}

//전송 내역 정보 구성 
function Lfn_setSendBody(sParams) {

    var Lbody = "";
    var Lsub_img = "";
    var Lsample_url = "";
    var LHASHTAG = "";

    //해시 태그
    for (var i = 0; i < sParams.HASHTAG.length; i++) {
        var Lhash = sParams.HASHTAG[i];
        LHASHTAG += " \n " + Lhash;
    }

    //추가 이미지가 존재한다면 ..
    for (var i = 0; i < sParams.IMAGE.T_URL.length; i++) {
        var Lurl = sParams.IMAGE.T_URL[i];
        Lsub_img = Lsub_img + encodeURI(Lurl) + " \n ";

    }

    //SAMPLE URL 정보가 존재한다면..
    if (sParams.SAMPLE_URL && sParams.SAMPLE_URL !== "") {
        Lsample_url = "Sample GO => " + encodeURI(sParams.SAMPLE_URL) + " \n\n ";

    }

    /**
     * 타이틀 구성
     * - 특수기호 "<", ">" 제거하기
     * - maxLength = 100 
     */
    sParams.TITLE = sParams.TITLE.replaceAll("<", "");
    sParams.TITLE = sParams.TITLE.replaceAll(">", "");
    sParams.TITLE = cutByMaxStr(sParams.TITLE, 100);

    //출력 내역 구성
    Lbody = sParams.TITLE + " \n\n " +
        sParams.DESC + " \n\n " +
        "[reference image]" + " \n " +
        encodeURI(sParams.IMAGE.URL) + " \n\n" +
        Lsub_img +
        Lsample_url +
        "home : https://www.u4ainfo.com" + " \n\n " +
        LHASHTAG;

    /**
     * 본문 구성
     * - 특수기호 "<", ">" 제거하기
     * - maximum byte = 5000 bytes
     */
    Lbody = Lbody.replaceAll("<", "");
    Lbody = Lbody.replaceAll(">", "");
    Lbody = cutByLen(Lbody, 5000);

    return Lbody;

}

//HTTP 클라이언트 서버 종료 
function Lfn_serverClose() {

    try {
        oServer.close();
        oServer = null;
    } catch (e) {}

}

let oErrLog = oAPP.errorlog;

/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = function(sParams, oChoiceInfo, CB) {

    // Youtube Url이 있다면 지우고 시작한다.
    if (sParams.VIDEO.YOUTUBE_URL) {
        delete sParams.VIDEO.YOUTUBE_URL;
    }

    if (!oChoiceInfo || !oChoiceInfo.YOUTUBE) {

        //Callback 
        CB(sParams);
        return;

    }

    const FPATH = sParams.VIDEO.FPATH;
    //sParams.VIDEO.FPATH = "";

    // 첨부 동영상 경로 가 존재하지않다면 현재 프로세스를 종료한다 
    if (typeof FPATH == "undefined" || FPATH == null || FPATH == "") {

        //Callback 
        CB(sParams);
        return;

    }

    // Link 동영상 URL 존재하는 경우는 현재 프로세스를 종료한다 
    if (sParams.VIDEO.URL && sParams.VIDEO.URL !== "") {

        //Callback 
        CB(sParams);
        return;

    }

    const
        remote = oAPP.remote,
        Youtube = remote.require("youtube-api"),
        opn = remote.require("open"),
        http = remote.require('http'),
        FS = remote.require('fs');

    //동영상 경로 존재 여부  
    if (!FS.existsSync(FPATH)) {

        //존재하지않다면!!!
        //오류 메시지 - 처리 현재 프로세스에서 종료 해야하므로 CallBack 처리는 않함!!

        //오류 메시지 수집
        oErrLog.addLog({
            RETCD: "E",
            RTMSG: `[ YOUTUBE #1 ] 동영상 파일이 존재하지 않음 ==> ${FPATH} `
        });

        return;

    }

    //HTTP 서버 생성
    oServer = http.createServer(function(req, res) {

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        //요청받은 파라메터 얻기 
        let querystring = remote.require('querystring');
        let sData = querystring.parse(req.url, "/?");

        if (typeof sData.code === "undefined") {
            return;
        }

        //요청받은 받은 인증key 로 아래에 넣어주면 토큰 callback 펑션이 호출됨 
        oauth.getToken(sData.code, (err, tokens) => {

            if (err) {
                res.end(err.toString());
            }

            //인증키 누락시..
            if (typeof tokens === "undefined" || tokens == null) {

                //오류 메시지 처리
                oErrLog.addLog({
                    RETCD: "E",
                    RTMSG: "[ YOUTUBE #2 ] 인증키 누락!"
                });

                //서버 종료
                Lfn_serverClose();

                //Callback 
                CB(sParams);

                return;
            }

            //인증키 누락시
            if (tokens === "") {

                //오류 메시지 수집
                oErrLog.addLog({
                    RETCD: "E",
                    RTMSG: "[ YOUTUBE #3 ] 인증키 누락!"
                });

                //서버 종료
                Lfn_serverClose();

                //Callback 
                CB(sParams);

                console.log("유투브 3");

                return;

            }

            //내역 정보 구성 
            let BodyDesc = Lfn_setSendBody(sParams);

            //요청받은 토큰키로 인증해줌 
            oauth.setCredentials(tokens);

            //pc에 잇는 동영상 파일을 YOUTUBE 전송 API 
            var req = Youtube.videos.insert({
                    resource: {
                        // Video title and description
                        snippet: {
                            title: sParams.TITLE,
                            description: BodyDesc
                        },
                        // I don't want to spam my subscribers
                        status: {
                            privacyStatus: "public"
                        }
                    },
                    // This is for the callback function
                    part: "snippet,status",

                    // Create the readable stream to upload the video
                    media: {
                        body: oAPP.fs.createReadStream(FPATH, {
                            flags: 'r'
                        })

                    }
                },
                (err, data) => {

                    debugger;

                    if (err) {
                        res.end('The API returned an error: ' + err);

                        //오류 메시지 처리
                        oErrLog.addLog({
                            RETCD: "E",
                            RTMSG: `[ YOUTUBE #4 ] The API returned an error! ==> ${err}`
                        });

                        //서버 종료
                        Lfn_serverClose();

                        // //callback 
                        // CB(sParams);

                        // youtube 인증 팝업이 닫혀있지 않을 경우에만 윈도우 클로즈를 실행
                        if (oAPP.authWIN) {

                            // 브라우저를 닫는다.
                            oAPP.authWIN.close();

                        }

                        return;

                    }

                    //인증 절차 브라우져 종료 처리

                    // res.end('<script>window.close();</script>');

                    //정상일 경우 I/F 파라메터 변경
                    // sParams.VIDEO.URL = "https://youtube.com/shorts/" + data.data.id;                    

                    sParams.VIDEO.YOUTUBE_URL = "https://youtube.com/shorts/" + data.data.id;

                    //서버 종료
                    Lfn_serverClose();

                    // //callback 
                    // CB(sParams);

                    // youtube 인증 팝업이 닫혀있지 않을 경우에만 윈도우 클로즈를 실행
                    if (oAPP.authWIN) {

                        // 브라우저를 닫는다.
                        oAPP.authWIN.close();

                    }

                    return;

                });
        });

    }).listen(oAPP.conf.youtube_server_port);

    //인증 JSON 정보     
    var CREDENTIALS = oAPP.auth.youtube;

    let oauth = Youtube.authenticate({
        type: "oauth",
        client_id: CREDENTIALS.web.client_id,
        client_secret: CREDENTIALS.web.client_secret,
        redirect_url: CREDENTIALS.web.redirect_uris[0],
    });

    var Lurl = oauth.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.upload"]
    });


    //로그인 인증 화면 호출
    oAPP.onAuthCall(Lurl, CB, sParams, oServer);

    // opn(Lurl);

};