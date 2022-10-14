let oAPP = {};

((oAPP) => {

    "use strict";

    oAPP.remote = require('@electron/remote');
    oAPP.app = oAPP.remote.app;
    oAPP.fs = oAPP.remote.require('fs');
    oAPP.path = oAPP.remote.require('path');
    oAPP.apppath = oAPP.app.getAppPath();
    oAPP.youtubeAuthJson = oAPP.path.join(oAPP.apppath, "auth", "youtube-auth.json");

    const
        Youtube = oAPP.remote.require("youtube-api"),
        opn = require("open"),
        http = require('http');

    oAPP.onStart = () => {

        http.createServer(function (req, res) {

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            //요청받은 파라메터 얻기  

            var querystring = require('querystring');

            var cc = querystring.parse(req.url, "/?");

            if (typeof cc.code === "undefined") {
                return;
            }

            //요청받은 받은 인증key 로 아래에 넣어주면 토큰 callback 펑션이 호출됨  

            //인증키는 재사용이 가능한지 테스트 해바야함!!!!!!! 

            var Lcode = cc.code;

            oauth.getToken(Lcode, (err, tokens) => {

                if (typeof tokens === "undefined") {
                    return;
                }

                if (tokens === "") {
                    return;
                }

                //요청받은 토큰키로 인증해줌  
                oauth.setCredentials(tokens);
                //pc에 잇는 동영상 파일을 YOUTUBE 전송 API  

                var req = Youtube.videos.insert({

                        resource: {

                            // Video title and description 

                            snippet: {

                                title: "test",
                                tags: ["yoon", "yoon-test"],
                                description: "test vi"

                            },

                            // I don't want to spam my subscribers 

                            status: {

                                privacyStatus: "private"

                            }

                        },

                        // This is for the callback function 

                        part: "snippet,status",

                        // Create the readable stream to upload the video 
                        media: {

                            body: oAPP.fs.createReadStream('C:\\Tmp\\emart_video1.mp4', {
                                flags: 'r'
                            })

                        }

                    },

                    (err, data) => {

                        debugger;

                        if (err) {

                            res.end('The API returned an error: ' + err);

                            return;

                        }

                        res.end('Hello World');



                    });

            });





        }).listen(1977);

        debugger;

        //2번항목에서 다운로드 받은 인증 JSON 을 로드 한다  

        var CREDENTIALS = require(oAPP.youtubeAuthJson);

        // var CREDENTIALS = require("C:\\Tmp\\client_secret_895403760937-2plbc38sdk53nnpbusb1sec89q93s2vs.apps.googleusercontent.com.json");
        // var CREDENTIALS = require("C:\\Tmp\\client_secret_612729415454-4veredg7mf64opmoqclenphp42o71on4.apps.googleusercontent.com.json");
        //인증정보 설정  

        let oauth = Youtube.authenticate({

            type: "oauth",

            client_id: CREDENTIALS.web.client_id,

            client_secret: CREDENTIALS.web.client_secret,

            redirect_url: CREDENTIALS.web.redirect_uris[0],

        });





        //상위 인증정보 기준으로 아래 항목을 수행하면 인증 URL 을 준다  

        var Lurl = oauth.generateAuthUrl({

            access_type: "offline",

            scope: ["https://www.googleapis.com/auth/youtube.upload"]

        });





        //상위 인증 URL 을 브라우져 통해 수행한다  

        opn(Lurl);


    };




})(oAPP);

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    debugger;

    oAPP.onStart();

}