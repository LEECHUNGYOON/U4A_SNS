/* ================================================================= */
// 설치 npm 
// npm install mime-types
/* ================================================================= */

let MIME = oAPP.remote.require('mime-types');

let OFRAME = null;

let CONFIG = {
    api_url_upload : "https://kapi.kakao.com/v1/api/story/upload/multi",
    api_url_photo  : "https://kapi.kakao.com/v1/api/story/post/photo",
    api_url_note   : "https://kapi.kakao.com/v1/api/story/post/note",
    api_url_link   : "https://kapi.kakao.com/v1/api/story/post/link",
    auth_service   : "http://u4arnd.iptime.org:9403/sns/kakaoStory.html"

}


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
// var ret = require(oAPP.path.join(__dirname, 'js/kakaoStory.js'));
//     ret.send({});
//                     
// 
/* ================================================================= */



/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */


/*================================================= */
/*  랜덤키 생성  */
/*================================================= */
const _random = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
  
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return str;
  
};

/*================================================= */
/* note 전송                                        */
/*================================================= */
async function _sendNOTE(TOKEN, PARAMS){
    return new Promise(async (resNOTE, rej) => {
        
        //이미지 전송 정보가 존재한다면 하위 수행 금지 !!!
        if((typeof PARAMS.IMAGE.FPATH !== "undefined") && PARAMS.IMAGE.FPATH !== ""){ resNOTE({RETCD:"S", RTMSG:""}); return; }
        if(PARAMS.IMAGE.URL != ""){ resNOTE({RETCD:"S", RTMSG:""}); return; }
        
        //note 전송
        var xhttp = new XMLHttpRequest();
        xhttp.onload  = (e)=>{ 
            debugger;
            var retcd = "S"; 
            var rtmsg = "";
            if(e.target.status != 200){ retcd = "E"; rtmsg = e.target.response; }
            resNOTE({RETCD:retcd, RTMSG:rtmsg}); 
            return; 
        }; 

        xhttp.onerror = (e)=>{ resNOTE({RETCD:"E", RTMSG:e.target.response}); return; };            
        xhttp.open("POST", CONFIG.api_url_note, true);

        //전송시킬 인증 토큰키 값 구성 
        const herderToken = "Bearer " + TOKEN;
        xhttp.setRequestHeader("Authorization", herderToken);
        xhttp.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded;charset=utf-8");

        var LCONTENT = "";
            LCONTENT = "✅ " + PARAMS.TITLE + " \n\n "
                     + PARAMS.TYPE + " \n "
                     + PARAMS.DESC + " \n\n ";

            //SAMPLE URL
            if(PARAMS.SAMPLE_URL !== ""){
                LCONTENT = LCONTENT + "🐾 U4A Sample URL \n" + PARAMS.SAMPLE_URL + " \n ";

            }

            //VIDEO URL
            if(PARAMS.VIDEO.URL !== ""){
                LCONTENT = LCONTENT + " \n ▶ Video \n" + PARAMS.VIDEO.URL + " \n ";

            }

            //추가 이미지 LINK
            if(PARAMS.IMAGE.T_URL.length != 0){
                LCONTENT = LCONTENT + "\n 💚 \n";
                for (var i = 0; i < PARAMS.IMAGE.T_URL.length; i++) {
                    LCONTENT = LCONTENT + PARAMS.IMAGE.T_URL[i] + " \n ";
                    
                }
            }

            //해시태그
            if(PARAMS.HASHTAG.length != 0){
                LCONTENT = LCONTENT + "\n 💛 \n";
                for (var i = 0; i < PARAMS.HASHTAG.length; i++) {
                    LCONTENT = LCONTENT + PARAMS.HASHTAG[i] + " ";
                }

            }



        //QUERY STRING 전송 -  본문 문자열 2048 안으로만 가능
        var sendDATA = "permission=M" 
                    + "&content=" 
                    + encodeURIComponent(LCONTENT);

            xhttp.send(sendDATA);

    });
}

/*================================================= */
/* 카카오스토리 사진 전송  */
/*================================================= */
async function _sendPHOTO(TOKEN, PARAMS){
    return new Promise(async (resPHOTO, rej) => {
        //임시 
        resPHOTO({RETCD:"S", RTMSG:""}); 
        return;

        var xhttp = new XMLHttpRequest();
        xhttp.onload = (e)=>{ 

            //오류 발생
            if(e.target.status != 200){ resPHOTO({RETCD:"E", RTMSG:e.target.response}); return; }
            
            //정상적으로 kakao 전송일 경우 
            //카카오측에서 응답으로 파일path를 준다 (e.target.response)

            //리턴받은 파일path 정보로 카카오 photo API로 글을 게시한다!
            var xhttp2 = new XMLHttpRequest();
                xhttp2.onload  = (e)=>{ 
                    var retcd = "S"; 
                    var rtmsg = "";
                    if(e.target.status != 200){ retcd = "E"; rtmsg = e.target.response; }
                    resPHOTO({RETCD:retcd, RTMSG:rtmsg}); 
                    return; 
                }; 
                xhttp2.onerror = (e)=>{ resPHOTO({RETCD:"E", RTMSG:e.target.response}); return; };            
                xhttp2.open("POST", CONFIG.api_url_photo, true);
                xhttp2.setRequestHeader("Authorization", herderToken);
                xhttp2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

                //QUERY STRING 전송 -  본문 문자열 2048 안으로만 가능
                var sendDATA = "permission=M" 
                             + "&image_url_list=" + encodeURIComponent(e.target.response) 
                             + "&content="        + "aaaaa";

                xhttp2.send(sendDATA);

        };

        xhttp.onerror = (e)=>{ resPHOTO({RETCD:"E", RTMSG:e.target.response}); return; };            
        xhttp.open("POST", CONFIG.api_url_upload, true);

        //전송시킬 인증 토큰키 값 구성 
        const herderToken = "Bearer " + TOKEN;
        xhttp.setRequestHeader("Authorization", herderToken);

        //전송 form 객체 생성 
        let oformData = new FormData();

        var url_path = PARAMS.IMAGE.URL;

        //웹서버 OR URL 방식 
        debugger;
        try {
            let resData   = await fetch(url_path);
            let byteArray = await resData.arrayBuffer();
    
            let mimeTyp = MIME.lookup(url_path);
            if(!mimeTyp){mimeTyp = "";};
    
            let oBin = new Blob([byteArray], {type:mimeTyp});

            let ext  = oAPP.path.extname(url_path);
            if(ext == ""){ext = ".png";}

            let fname = _random(20) + ext;
            oformData.append('file', oBin, fname);
    
            xhttp.send(oformData);

        } catch (err) {
            resPHOTO({RETCD:"E", RTMSG:"PHOTO : " + err.toString()}); 
            return;
            
        }

    });
}


/*================================================= */
/* 카카오 스토리 링크  */
/*================================================= */
async function _sendLINKINFO(TOKEN, PARAMS){
    return new Promise(async (resLINKINFO, rej) => {
      
        //이미지 전송 정보가 존재여부 점검 
        var isIMG = false;
        if((typeof PARAMS.IMAGE.FPATH !== "undefined") && PARAMS.IMAGE.FPATH !== ""){ isIMG = true; }
        if(PARAMS.IMAGE.URL !== ""){  isIMG = true; }

        //만일 이미지 전송 정보가 미존재시 종료
        if(!isIMG){
            resLINKINFO({RETCD:"S", RTMSG:""});
            return;
        }
        
        var xhttp = new XMLHttpRequest();
        xhttp.onload = async (e)=>{ 
            
            //오류 발생
            if(e.target.status != 200){ resLINKINFO({RETCD:"E", RTMSG:e.target.response}); return; }

            //정상적으로 kakao 전송일 경우 
            //카카오측에서 응답으로 파일path를 준다 (e.target.response)

            //리턴받은 파일path 정보로 카카오 photo API로 글을 게시한다!
            var xhttp2 = new XMLHttpRequest();
                xhttp2.onload  = (e)=>{ 
                   
                    var retcd = "S"; 
                    var rtmsg = "";
                    if(e.target.status != 200){ retcd = "E"; rtmsg = e.target.response; }
                    resLINKINFO({RETCD:retcd, RTMSG:rtmsg}); 
                    return; 
                }; 
                xhttp2.onerror = (e)=>{ resLINKINFO({RETCD:"E", RTMSG:e.target.response}); return; };            
                xhttp2.open("POST", CONFIG.api_url_link, true);
                xhttp2.setRequestHeader("Authorization", herderToken);
                xhttp2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                
                //카카오스토링 링크 전송 값 구성 
                var link_data = {};

                    //샘플 URL 
                    link_data.url = PARAMS.SAMPLE_URL;
                    if(link_data.url === ""){  link_data.url = "https://www.u4ainfo.com"; }

                    link_data.host          = "www.u4ainfo.com";
                    link_data.requested_url = "";

                    //타이틀
                    link_data.title         = "✅ " + PARAMS.TITLE;

                    //링크 이미지 URL 전송
                    link_data.image = [];
                    var T_IMGS = JSON.parse(e.target.response);
                    for (var i = 0; i < T_IMGS.length; i++) {
                        link_data.image.push("http://dn-l1-story.kakao.co.kr/dn" + T_IMGS[i]);
                    }

                    //내역 = 문서유형 + 해시태그
                    link_data.description = PARAMS.TYPE;
                    if(PARAMS.HASHTAG.length != 0){
                        for (var i = 0; i < PARAMS.HASHTAG.length; i++) {
                            link_data.description = link_data.description + PARAMS.HASHTAG + " ";
                        }
                          
                    }

                    link_data.type = "website";
                    link_data.section = "";

                    //content = 본문 + 추가 이미지 LINK 
                    var LCONTENT = "";
                    if(PARAMS.DESC !== ""){ LCONTENT = PARAMS.DESC + " \n "; }

                    //추가 이미지 LINK 
                    if(PARAMS.IMAGE.T_URL.length != 0){
                        LCONTENT = LCONTENT + " \n "
                        for (var i = 0; i < PARAMS.IMAGE.T_URL.length; i++) {
                            LCONTENT = LCONTENT + PARAMS.IMAGE.T_URL[i] + " \n ";
                        
                        }
                    }
                    
                    //동영상 LINK
                    if(PARAMS.VIDEO.URL !== ""){
                        LCONTENT = LCONTENT + " \n " + PARAMS.VIDEO.URL + " \n ";
                    }
                
                    if(PARAMS.HASHTAG.length != 0){
                        LCONTENT = LCONTENT + " \n "
                        for (var i = 0; i < PARAMS.HASHTAG.length; i++) {
                            LCONTENT = LCONTENT + PARAMS.HASHTAG[i] + " ";
                        }
                    }

                var sendLinkData = JSON.stringify(link_data);
                    sendLinkData = "link_info=" + encodeURIComponent(sendLinkData)
                                 + "&content=" + encodeURIComponent(LCONTENT);
               
                xhttp2.send(sendLinkData);

        };

        xhttp.onerror = (e)=>{ resLINKINFO({RETCD:"E", RTMSG:e.target.response}); return; };            
        xhttp.open("POST", CONFIG.api_url_upload, true);

        //전송시킬 인증 토큰키 값 구성 
        const herderToken = "Bearer " + TOKEN;
        xhttp.setRequestHeader("Authorization", herderToken);

        //전송 form 객체 생성 
        let oformData = new FormData();

        debugger;

        //이미지 정보가 웹서버 URL 방식일 경우 
        if(PARAMS.IMAGE.URL !== ""){

            try {
                var resData   = await fetch(PARAMS.IMAGE.URL);
                var byteArray = await resData.arrayBuffer();
        
                let mimeTyp = MIME.lookup(PARAMS.IMAGE.URL);
                if(!mimeTyp){mimeTyp = "";};
        
                let oBin = new Blob([byteArray], {type:mimeTyp});

                let ext  = oAPP.path.extname(PARAMS.IMAGE.URL);
                if(ext == ""){ext = ".png";}

                let fname = _random(20) + ext;
                oformData.append('file', oBin, fname);
        
                xhttp.send(oformData);

            } catch (err) {
                resLINKINFO({RETCD:"E", RTMSG:"링크방식 : " + err.toString()}); 
                return;
                
            }

            return;

        } //if(PARAMS.IMAGE.URL !== ""){


        //로컬 파일 일 경우 
        if(PARAMS.IMAGE.FPATH !== ""){

            try {
                var resData   = oAPP.fs.readFileSync(PARAMS.IMAGE.FPATH , null).buffer;
                var byteArray = new Uint8Array(resData);
        
                let mimeTyp = MIME.lookup(PARAMS.IMAGE.FPATH);
                if(!mimeTyp){mimeTyp = "";};
        
                let oBin = new Blob([byteArray], {type:mimeTyp});

                let ext  = oAPP.path.extname(PARAMS.IMAGE.FPATH);
                if(ext == ""){ext = ".png";}

                let fname = _random(20) + ext;
                oformData.append('file', oBin, fname);
        
                xhttp.send(oformData);

            } catch (err) {
                resLINKINFO({RETCD:"E", RTMSG:"링크방식 : " + err.toString()}); 
                return;
                
            }

            return;

        } //if(PARAMS.IMAGE.FPATH !== ""){


    });
}


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.send = async function(sParams){

    return new Promise((resolve, reject) => {

        debugger;
        
        //[펑션]자식 frame 통신 callback 함수
        async function onMsgCB(params){
            
            //frame 통신 이벤트 제거 
            window.removeEventListener('message', onMsgCB);

            //로그인 인증 오류시
            if(typeof params.data == "undefined"){ resolve([{RETCD:"E", RTMSG:"카카오 로그인 인증실패"}]);  return; }
            if(typeof params.data.RETCD == "undefined"){ resolve([{RETCD:"E", RTMSG:"카카오 로그인 인증실패"}]);  return; }
            if(params.data.RETCD == "E"){ resolve([params.data]); return; }

            var T_MSG = [];

            debugger;

            /* note 전송 */
            var S_RET = await _sendNOTE(params.data.TOKEN, sParams);
                T_MSG.push(S_RET);

            /* note + 사진 전송 */
            /*
            var S_RET = await _sendPHOTO(params.data.TOKEN, sParams);
                T_MSG.push(S_RET);
            */

            /* 카카오스토리 링크  */
            var S_RET = await _sendLINKINFO(params.data.TOKEN, sParams);
                T_MSG.push(S_RET);

                //오류건만 리턴
                resolve(T_MSG.filter(e=> e.RETCD === "E"));

        }

 
        //자식 frame 통신 이벤트 설정 
        window.addEventListener('message', onMsgCB);
  

        //카카오 스토리 처리 URL 호출
        OFRAME = document.getElementById("kakaologin");

        //frame 로딩 정상 수행시 
        OFRAME.onload = function(e){

            //자식 영역 접근 
            var contentWin = e.currentTarget.contentWindow;

            //frame 로딩 실패
            if(typeof contentWin === "undefined"){
                resolve([{RETCD:"E", RTMSG:"카카오 로그인 서비스 URL 로드 실패"}]); 
                return;
            }
            
            //frame 로딩 실패
            if(typeof contentWin.gfn_Auth === "undefined"){
                resolve([{RETCD:"E", RTMSG:"카카오 로그인 서비스 URL 로드 실패"}]); 
                return;
            }

            var PARAMS = {"TOKEN":"10a4b0e1b6ceadaf8718cb812440a915"};
            contentWin.gfn_Auth(PARAMS);
           
        };

        //frame 로딩 실패 
        OFRAME.onerror = function(e){
            resolve([{RETCD:"E", RTMSG:"카카오 로그인 서비스 URL 로드 실패"}]); 
            return;
           
        };
        
        OFRAME.src = CONFIG.auth_service;


    });//return new Promise((resolve, reject) => {

}; //exports.send = async function(sParams){