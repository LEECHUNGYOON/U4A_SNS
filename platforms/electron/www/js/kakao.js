let oKakao = {};

oKakao.send = (oParams, cb) => {

    if (!oAPP.oChoiceInfo || !oAPP.oChoiceInfo.KAKAO) {

        //Callback 
        cb(oParams);
        return;

    }



};

module.exports = oKakao;