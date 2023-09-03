/* ================================================================= */
// 설치 npm 
// npm install mongodb
/* ================================================================= */


/* ================================================================= */
/* 사용 예시 
 var ret = require(oAPP.path.join(__dirname, 'js/getModuleCode.js'));
 var LS_DATA = await ret.getDataALL(oAPP.remote);
*/                   
/* ================================================================= */


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */
exports.getDataALL = async function(remote){

    return new Promise(function(resolve, reject) {

        let MongClinet = remote.require('mongodb').MongoClient;

        //MongoDB 접속 HOST 구성 
        var Lpw = "%U4aIde&";
            Lpw = encodeURIComponent(Lpw);
        var MongDB_HOST = "mongodb://u4arnd:" + Lpw + "@118.34.215.175:9102/admin";

        MongClinet.connect(MongDB_HOST, function(err, db) {
            if (err) { resolve({"RETCD":"E", "RTMSG": "MongDB 연결 실패"}); return; }

            var dbo = db.db("U4A_MASTER");

            dbo.collection("MODULE_CODE").find({}).limit(0).toArray(function(err, T_DATA) {
                db.close();
                if (err) { resolve({"RETCD":"E", "RTMSG": "MongDB 연결 실패"}); return; }

                var LS_RET = {"RETCD":"S",
                              "RTMSG":"",
                              "T_DATA": T_DATA
                             };

                resolve(LS_RET);

            });

        }); 

    });

};