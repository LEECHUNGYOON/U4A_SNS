/* ================================================================= */
// 설치 npm 
// npm install querystring
// npm install multiparty
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
// var ret = require(oAPP.path.join(__dirname, 'js/CreateServer.js'));
//     ret.createServer( oAPP.remote, 
//                       (info, req, res)=>{ console.log(info);  res.end('aaa'); },  //클라이언트에서 요청시 callback 
//                       (e)=>{ console.log(1); },                                   //HTTP서버 정상 생성시 callback
//                       (e)=>{ console.log(2); }                                    //서버 응답 처리 오류 발생 callback
//                     );
// 
/* ================================================================= */

var http = null,
    qs = null,
    Multiparty = null;

// var IP = "192.168.0.7",
//     PORT = 1333;

var IP = oAPP.conf.localServerIP,
    PORT = oAPP.conf.localServerPort;

//http 서버 생성 
//파라메터 => remote       : electron 리모트 오브젝트 
//           cb_req       : 요청 이벤트 발생시 callBack 함수 
//           cb_success   : 서버 정상 생성시 callBack 함수 
//           cb_error     : 오류 발생시 callBack 함수
exports.createServer = function (remote, cb_req, cb_success, cb_error) {

    http = remote.require('http');
    qs = remote.require('querystring');
    Multiparty = remote.require('multiparty');

    try {

        //서버 생성 
        const server = http.createServer(async function (req, res) {

            //서비스 점검
            if (!onChkService(req, res)) {
                cb_error();
                return;
            }


            //요청 서비스 정보 추출 - 서비스 PATH , 파라메터
            var sINFO = await onServiceInfo(req, res);


            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*'
            });

            //요청 Call back 
            //파라메터 => sINFO : 요청 서비스 정보 
            //           req   : 요청 객체 
            //           res   : response 객체  
            cb_req(sINFO, req, res);

            //res.end('aaa');

        });

        server.on("error", (err) => {

            cb_error(err);

        });

        server.on("clientError", (err) => {

            cb_error(err);

        });

        server.listen(PORT, IP, cb_success);

    } catch (error) {

        cb_error(error);

    }

};


/*=================================================*/
/* 내부 사용 기능 펑션 
/*=================================================*/

//서비스 점검
function onChkService(req, res) {

    var T_path = req.url.split("?");
    var Lurl = T_path[0].replace("/", "");

    if (Lurl === "") {

        //요청 유형이 ajax(비동기통신) 여부 점검
        if (onChkAjax(req)) {
            res.writeHead(500, {
                'Access-Control-Allow-Origin': '*',
                'Error': 'X'
            });
            res.end("page not found");

        } else {
            res.writeHead(500, {
                'Access-Control-Allow-Origin': '*',
                'Error': 'X'
            });
            res.end("page not found");

        }

        return false;

    }

    return true;

}


//요청 유형이 ajax(비동기통신) 여부 점검
function onChkAjax(req, res) {

    if (typeof req.headers["access-control-request-headers"] !== "undefined") {
        return true;
    }

    var isAJAX = false;
    for (var i = 0; i < req.rawHeaders.length; i++) {
        var LVal = req.rawHeaders[i];
        if (LVal === "Access-Control-Request-Headers") {
            isAJAX = true;
            break;
        }

    }

    return isAJAX;

}


//요청 서비스 정보 추출 - 서비스 PATH , 파라메터
function onServiceInfo(req, res) {

    var T_path = req.url.split("?");
    var retData = {};
    retData.PATH = T_path[0];
    retData.PARAM = [];

    switch (onGetMethod(req)) {
        case "GET": //GET 방식 파라메터 정보 얻기
            if (typeof T_path[1] === "undefined") {
                return retData;
            }

            var Params = qs.parse(T_path[1]);

            for (var prop in Params) {

                var sLine = {};
                sLine.NAME = prop;
                sLine.VALUE = Params[prop];
                retData.PARAM.push(sLine);

            }

            return retData;

        case "POST": //POST 방식 파라메터 정보 얻기

            //만일 POST 방식일 경우라도 URL 뒤 파라메터 정보 존재여부 확인
            if (typeof T_path[1] !== "undefined") {
                var Params = qs.parse(T_path[1]);

                for (var prop in Params) {

                    var sLine = {};
                    sLine.NAME = prop;
                    sLine.VALUE = Params[prop];
                    retData.PARAM.push(sLine);

                }
            }

            return new Promise(function (resolve, reject) {

                var oForm = new Multiparty.Form();
                oForm.parse(req, (err, fields, files) => {

                    if (err) {
                        resolve(retData);
                    }

                    for (var prop in fields) {

                        var sLine = {};
                        sLine.NAME = prop;
                        sLine.VALUE = fields[prop][0];
                        retData.PARAM.push(sLine);

                    }

                    resolve(retData);

                });

            });

        default:

            //요청 유형이 ajax(비동기통신) 여부 점검
            if (onChkAjax(req)) {
                res.writeHead(500, {
                    'Access-Control-Allow-Origin': '*',
                    'Error': 'X'
                });
                res.end("bad request");

            } else {
                res.writeHead(500, {
                    'Access-Control-Allow-Origin': '*',
                    'Error': 'X'
                });
                res.end("bad request");

            }

            return;
    }

}


//요청 Method 정보 추출
function onGetMethod(req) {

    var Lmethod = req.method;

    if (req.method === "GET") {
        return Lmethod = "GET";
    }
    if (req.method === "POST") {
        return Lmethod = "POST";
    }

    for (var i = 0; i < req.rawHeaders.length; i++) {
        var LVal = req.rawHeaders[i];
        if (LVal === "POST") {
            Lmethod = "POST";
            break;
        }

    }

    if (Lmethod !== "GET" && Lmethod !== "POST") {

        if (typeof req.headers['access-control-request-method'] !== "undefined") {
            Lmethod = req.headers['access-control-request-method'];

        }

    }

    return Lmethod;

}