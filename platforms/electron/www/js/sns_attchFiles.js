/* ================================================================= */
// 설치 npm 
// npm install mime-types
// npm install node-ssh
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
       "FPATH": "",   //대표 이미지 local path
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
/* 사용 예시 
    this.NodeSSH = require('node-ssh').NodeSSH; <<-- 이부분은 반드시 index.js 에서 호출!!!
    var ret = require(oAPP.path.join(__dirname, 'js/sns_attchFiles.js'));
     var retern = await ret.put(TY_IFDATA);
    retern.RETCD,  <==== 'E' 면 올스톱
    retern.RTMSG


    sParams.ATTCH.IMG_URL
    sParams.ATTCH.VIDEO_URL                   
*/
/* ================================================================= */

/* ================================================================= */
/* 내부 전역 변수 
/* ================================================================= */
let SSH  = null;
let MIME = require('mime-types');



/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */

/*================================================= */
/* [펑션] 랜덤키 생성  */
/*================================================= */
const _random = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
  
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return str;
  
};

//================================================= //
// [펑션] 현재 날짜 시간 
//================================================= //
const _DateTime = () => {

    let today = new Date();   
    let year  = today.getFullYear();    // 년도
    let month = today.getMonth() + 1;  // 월
    let date  = today.getDate();        // 날짜

    let hours = today.getHours();      // 시
    let minutes = today.getMinutes();  // 분
    let seconds = today.getSeconds();  // 초

    return year.toString() + month.toString() + date.toString() +  "_" + hours.toString() + minutes.toString() + seconds.toString();

};


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.put = async function(sParams){
    return new Promise( async (resolve, reject) => {

        debugger;

        if(!oAPP.remote.app.isPackaged){
            debugger;
        }

        let isfile = false;

        //IF 구조에 필드 확장 
        sParams.ATTCH = {
            "IMG_URL"       : "",
            "IMG_ORG_URL"   : "",
            "VIDEO_URL"     : "",
            "VIDEO_ORG_URL" : ""
        };


        //이미지 첨부 확장자 점검 
        if(sParams.IMAGE.FPATH !== ""){

            isfile = true;

            var mimeIMG = MIME.lookup(sParams.IMAGE.FPATH);
            if(typeof mimeIMG === "boolean"){  
                resolve({"RETCD":"E", "RTMSG": "첨부대상 이미지 파일 형식이 잘못되었습니다"});
                return;
            }

        }

        //동영상 첨부 확장자 점검
        if(sParams.VIDEO.FPATH !== ""){

            isfile = true;

            var mimeVIDEO = MIME.lookup(sParams.VIDEO.FPATH);
            if(typeof mimeVIDEO === "boolean"){  
                resolve({"RETCD":"E", "RTMSG": "첨부대상 동영상 파일 형식이 잘못되었습니다"});
                return;
            }

        }

        //처리 대상 파일이 존재하지않다면 .
        if(!isfile){
            resolve({"RETCD":"S", "RTMSG": ""});   
            return;
        }


        let isConect  = false;
        let Lpassword = 'u4arnd00';

        if(SSH === null){
            var ssh = new oAPP.NodeSSH();
            SSH = await ssh.connect({
                host: 'u4arnd.iptime.org',
                username: 'u4adwn',
                port: 9541,
                password : Lpassword,
                tryKeyboard: true,
    
            });

        }

        //10회 정보 연결정보를 확인한다 
        for (var i = 0; i < 10; i++) {
                
            //연결이 종료상태일경우 
            if(!SSH.isConnected()){
                var ssh = new oAPP.NodeSSH();
                    SSH = await ssh.connect({
                        host: 'u4arnd.iptime.org',
                        username: 'u4adwn',
                        port: 9541,
                        password : Lpassword,
                        tryKeyboard: true,
            
                    });

                continue;

            }

            //연결중일 경우 
            isConect = true;
            break;

        }

        //만일 상위에서 점검 결과 
        //연결상태가 아닐 경우 
        if(!isConect){
            resolve({"RETCD":"E", "RTMSG": "NAS 서버에 연결 실패 하였습니다 담당자에게 반드시 요청!!!"});
            return;
        }

        //빌드상태가 아닐경우만 대상
        if(!oAPP.remote.app.isPackaged){
            SSH.execCommand('ls -R /mnt/Data/pub/u4adwn/contents/sns_con', { }).then(function(result) {
                console.log('STDOUT: ' + result.stdout)
                console.log('STDERR: ' + result.stderr)
            });
        }

        let NAS_PATH = "/mnt/Data/pub/u4adwn/" + "contents/sns_con"; //NAS SNS 첨부파일 경로 
        let T_ATTCH  = [];
     
        //이미지 
        if(sParams.IMAGE.FPATH !== ""){
            
            //NAS 첨부 처리 값 구성 
            var FileName    = _DateTime() + _random(50) + oAPP.path.extname(sParams.IMAGE.FPATH);
            var REMOTE_PATH = NAS_PATH + "/" + FileName;
            T_ATTCH.push({ local:sParams.IMAGE.FPATH, remote:REMOTE_PATH });

            sParams.ATTCH.IMG_URL     = "http://www.u4ainfo.com/u4a_sns/coproxy.html?file_id=" + encodeURIComponent(FileName);
            sParams.ATTCH.IMG_ORG_URL = "http://u4arnd.iptime.org:9403/u4apub/sns_con/" + FileName;

        }
   
        //비디오 
        if(sParams.VIDEO.FPATH !== ""){

            //NAS 첨부 처리 값 구성 
            var FileName    = _DateTime() + _random(50) + oAPP.path.extname(sParams.VIDEO.FPATH);
            var REMOTE_PATH = NAS_PATH + "/" + FileName;
            T_ATTCH.push({ local:sParams.VIDEO.FPATH, remote:REMOTE_PATH });

            sParams.ATTCH.VIDEO_URL     = "http://www.u4ainfo.com/u4a_sns/coproxy.html?file_id=" + encodeURIComponent(FileName);
            sParams.ATTCH.VIDEO_ORG_URL = "http://u4arnd.iptime.org:9403/u4apub/sns_con/" + FileName;
            
        }


        try {
            var retnNAS = await SSH.putFiles(T_ATTCH);
        } catch (e) {
            resolve({"RETCD":"E", "RTMSG": "NAS 첨부오류 : " + e.toString()});
            return;
        }

        resolve({"RETCD":"S", "RTMSG": ""});


    });

};