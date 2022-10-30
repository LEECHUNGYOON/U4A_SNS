let oMongdb = {};

//DATA 추출 
oMongdb.onGET = async () => {

    return new Promise(function(res, rej) {

        oAPP.MongClinet.connect(oAPP.MongDB_HOST, function(err, db) {

            // if (err) throw err;
            if (err) {

                res({
                    "RETCD": "E",
                    "RTMSG": "[Mongodb] Connection Error : " + err.toString()
                });

                return;

            }

            var dbo = db.db("U4A_ADMIN");

            dbo.collection("SNS_AUTHORITY").find({}).limit(0).toArray(function(err, T_AUTH) {
                db.close(); //db 종료

                if (err) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "[Mongodb] 몽고 DB 연결 실패"
                    });
                    return;
                } //오류
                if (T_AUTH.length === 0) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "[Mongodb] API 권한 Key정보 누락"
                    });
                    return;
                }

                //유투브 
                var T_DATA = T_AUTH.filter(e => e.COMPANY == "GOOGLE" && e.API_NAME == "YOUTUBE");
                if (T_DATA.length === 0) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "[Mongodb] 유투브 Key정보 누락"
                    });
                    return;
                }

                oAPP.auth.youtube = T_DATA[0].AUTH_DATA; //<---

                //페이스북 
                var T_DATA = T_AUTH.filter(e => e.COMPANY == "FACEBOOK" && e.API_NAME == "SNS");
                if (T_DATA.length === 0) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "페이스북 Key정보 누락"
                    });
                    return;
                }

                oAPP.auth.facebook = T_DATA[0].AUTH_DATA; //<---

                //인스타 
                var T_DATA = T_AUTH.filter(e => e.COMPANY == "INSTARRAM" && e.API_NAME == "SNS");
                if (T_DATA.length === 0) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "[Mongodb] 인스타그램 Key정보 누락"
                    });
                    return;
                }

                oAPP.auth.instagram = T_DATA[0].AUTH_DATA; //<---

                //텔레그램 
                var T_DATA = T_AUTH.filter(e => e.COMPANY == "TELEGRAM" && e.API_NAME == "BOT");
                if (T_DATA.length === 0) {
                    res({
                        "RETCD": "E",
                        "RTMSG": "[Mongodb] 텔레그램 Key정보 누락"
                    });
                    return;
                }

                oAPP.auth.telegram = T_DATA[0].AUTH_DATA.TOKEN; //<---

                res({
                    "RETCD": "S",
                    "RTMSG": ""
                });

            });

        });

    });

} // end of oMongdb.onGET

module.exports = oMongdb;