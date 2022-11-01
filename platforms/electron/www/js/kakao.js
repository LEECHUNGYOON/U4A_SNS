let oKakao = {};

oKakao.send = (oParams, oChoiceInfo, cb) => {
    
    if (!oChoiceInfo || !oChoiceInfo.KAKAO_STORY) {

        //Callback 
        cb(oParams);
        return;

    }

    //Callback 
    cb(oParams);
    
    return;

};

module.exports = oKakao;