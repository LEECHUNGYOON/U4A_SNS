let oAPP = parent.oAPP;

((oAPP) => {
    "use strict";

    /************************************************************************
     * UI5 Bootstrap Init
     ************************************************************************/
    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(() => {

            jQuery.sap.require("sap.m.MessageBox");

            oAPP.fn.initModeling();

            oAPP.fn.initRendering();

        });

    }; // end of oAPP.fn.attachInit    

    oAPP.fn.setMsg = (oMsg) => {




    };

    /************************************************************************
     * Model 초기 세팅
     ************************************************************************/
    oAPP.fn.initModeling = () => {

        oAPP.mDefaultModel = {
            PRC: {
                MSGPOP: { // Message Popover 구조
                    BTNICO: "sap-icon://message-popup",
                    MSGCNT: "0",
                    MSGLIST: [{
                        TYPE: "", // SNS 유형
                        RETCD: "", // return code
                        RTMSG: "" // msg
                    }]
                },
                VIDEO: {
                    RDBIDX: 0,
                },
                IMAGE: {
                    RDBIDX: 0,
                },
                CHOICE: {
                    YOUTUBE: true,
                    FACEBOOK: true,
                    INSTAGRAM: true,
                },
                BUSYTXD: "잠시만 기다려 주십시오...", // Busy default Text
                BUSYTXT: "",
            },
            SNS: {
                TITLE: "",
                TYPE: "",
                DESC: "",
                SAMPLE_URL: "", //샘플 URL                
                IMAGE: {
                    URL: "",
                    LURL: "",
                    DATA: ""
                },
                VIDEO: {
                    URL: "",
                    LURL: "",
                    DATA: ""
                },
                HASHTAG: []
            }
        };

        let oModelData = jQuery.extend(true, {}, oAPP.mDefaultModel);

        oModelData.PREV = jQuery.extend(true, {}, oModelData.SNS); // 미리보기쪽 구조
        oModelData.PRC.BUSYTXT = oModelData.PRC.BUSYTXD;

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oModelData);

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {

            sap.ui.getCore().setModel(oJsonModel);
            return;
        }

        oCoreModel.setModel(oJsonModel);

    }; // end of oAPP.fn.initModeling

    /************************************************************************
     * 초기 화면 그리기
     ************************************************************************/
    oAPP.fn.initRendering = () => {

        let oApp = new sap.m.App(),
            aPageContent = oAPP.fn.getPageContent(),
            oPage = new sap.m.Page({

                title: "U4A SNS Manager",
                titleAlignment: sap.m.TitleAlignment.Center,
                enableScrolling: false,

                // customHeader: new sap.m.Bar({                 
                //     contentMiddle: [
                //         new sap.m.Title({
                //             text: "U4A SNS Manager"
                //         })
                //     ],
                //     // contentRight: [
                //     //     new sap.m.Title({
                //     //         text: "U4A SNS Manager"
                //     //     })
                //     // ]
                // }),

                content: aPageContent

            });

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.initRendering

    /************************************************************************
     * 메인 페이지 Content 영역 UI 그리기
     ************************************************************************/
    oAPP.fn.getPageContent = () => {

        let aSNSContent = oAPP.fn.getSnsPageContent(),
            aSNSPrevContent = oAPP.fn.getSnsPrevPageContent();

        let oPage = new sap.m.Page({

            showHeader: false,

            content: [

                new sap.ui.layout.ResponsiveSplitter({

                    rootPaneContainer: new sap.ui.layout.PaneContainer({
                        panes: [

                            new sap.ui.layout.SplitPane({

                                content: new sap.m.Page({

                                    title: "SNS Post",

                                    footer: new sap.m.Bar({

                                        contentLeft: [
                                            new sap.m.Button({
                                                icon: "{/PRC/MSGPOP/BTNICO}",
                                                text: "{/PRC/MSGPOP/MSGCNT}",
                                                press: () => {

                                                    oAPP.fn.openMsgPopover();

                                                }
                                            })
                                        ],

                                        contentRight: [
                                            new sap.m.CheckBox({
                                                text: "Youtube",
                                                selected: "{/PRC/CHOICE/YOUTUBE}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Facebook",
                                                selected: "{/PRC/CHOICE/FACEBOOK}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Instagram",
                                                selected: "{/PRC/CHOICE/INSTAGRAM}"
                                            }),
                                            new sap.m.Button({
                                                icon: "sap-icon://paper-plane",
                                                text: "Send Post",
                                                type: sap.m.ButtonType.Emphasized,
                                                press: () => {

                                                    sap.m.MessageBox.confirm("해당 게시글을 SNS에 전송하시겠습니까?", {
                                                        title: "Confirm", // default
                                                        onClose: (sAction) => {

                                                            if (sAction !== sap.m.MessageBox.Action.OK) {
                                                                return;
                                                            }

                                                            // 게시글 SNS에 전송
                                                            oAPP.fn.sendPost();

                                                        }, // default
                                                        styleClass: "", // default
                                                        actions: [sap.m.MessageBox.Action.OK,
                                                            sap.m.MessageBox.Action.CANCEL
                                                        ], // default
                                                        emphasizedAction: sap.m.MessageBox.Action.OK, // default
                                                        initialFocus: null, // default
                                                        textDirection: sap.ui.core.TextDirection.Inherit // default
                                                    });

                                                } // end of press

                                            }).addStyleClass("sapUiSmallMarginBegin")
                                        ]

                                    }),

                                    content: aSNSContent

                                }).addStyleClass("sapUiContentPadding"),

                            }),

                            new sap.ui.layout.SplitPane({

                                content: new sap.m.Page({

                                    title: "SNS Preview",

                                    content: aSNSPrevContent,
                                    footer: new sap.m.Bar()

                                }).addStyleClass("sapUiContentPadding"),

                            }),

                        ]
                    })

                })

            ] // end of content
        });

        return [

            oPage


        ];

    }; // end of oAPP.fn.getPageContent

    /************************************************************************
     * SNS 입력 부분 페이지 Content 영역 UI 그리기
     ************************************************************************/
    oAPP.fn.getSnsPageContent = () => {

        let oForm1 = new sap.ui.layout.form.Form({
                editable: true,
                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    labelSpanL: 12,
                    labelSpanM: 12,
                    labelSpanS: 12
                }),

                formContainers: [
                    new sap.ui.layout.form.FormContainer({
                        formElements: [

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "제목"
                                }),
                                fields: [
                                    new sap.m.Input({
                                        value: "{/SNS/TITLE}",
                                    })
                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "모듈(업무)"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/TYPE}",
                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "상세설명"
                                }),
                                fields: [
                                    new sap.m.TextArea({
                                        width: "100%",
                                        rows: 20,
                                        value: "{/SNS/DESC}"
                                    })
                                ]
                            }),
                        ]
                    })

                ] // end of formContainers

            }),

            oPanel1 = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "1. 본문 작성하기"
                        })
                    ]
                }),

                content: [
                    oForm1
                ]
            }),

            oForm2 = new sap.ui.layout.form.Form({
                editable: true,

                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    labelSpanL: 12,
                    labelSpanM: 12,
                    labelSpanS: 12
                }),

                formContainers: [

                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "URL Path"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/VIDEO/URL}",
                                    })
                                    .bindProperty("enabled", "/PRC/VIDEO/RDBIDX", function (iIndex) {

                                        if (iIndex !== 0) {

                                            // 입력된 값 초기화
                                            this.setValue("");

                                            return false;
                                        }

                                        return true;

                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "Local File"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/VIDEO/LURL}",
                                        showValueHelp: true,
                                        valueHelpIconSrc: "sap-icon://attachment",
                                        valueHelpOnly: true,
                                        valueHelpRequest: () => {
                                            oAPP.fn.videoFileSelect();
                                        }
                                    })
                                    .bindProperty("enabled", "/PRC/VIDEO/RDBIDX", function (iIndex) {

                                        if (iIndex !== 1) {

                                            // 입력된 값 초기화
                                            this.setValue("");

                                            return false;
                                        }

                                        return true;

                                    })

                                ]
                            }),
                        ]
                    })

                ]

            }),

            oPanel2 = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "2. Youtube 동영상 첨부"
                        }),

                        new sap.m.RadioButtonGroup({
                            columns: 2,
                            selectedIndex: "{/PRC/VIDEO/RDBIDX}",
                            buttons: [
                                new sap.m.RadioButton({
                                    text: "URL Path",
                                }),
                                new sap.m.RadioButton({
                                    text: "Local File",
                                }),
                            ]
                        })

                    ]
                }),

                content: [

                    oForm2

                ]

            }),

            oForm3 = new sap.ui.layout.form.Form({
                editable: true,

                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    labelSpanL: 12,
                    labelSpanM: 12,
                    labelSpanS: 12
                }),

                formContainers: [

                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "URL Path"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/IMAGE/URL}",
                                    })
                                    .bindProperty("enabled", "/PRC/IMAGE/RDBIDX", function (iIndex) {

                                        if (iIndex !== 0) {

                                            // 입력된 값 초기화
                                            this.setValue("");

                                            // 미리보기쪽 이미지를 지운다.
                                            sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", "");

                                            return false;
                                        }

                                        return true;

                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "Local File"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/IMAGE/LURL}",
                                        showValueHelp: true,
                                        valueHelpIconSrc: "sap-icon://attachment",
                                        valueHelpOnly: true,
                                        valueHelpRequest: () => {
                                            oAPP.fn.imageFileSelect();
                                        }
                                    })
                                    .bindProperty("enabled", "/PRC/IMAGE/RDBIDX", function (iIndex) {

                                        if (iIndex !== 1) {

                                            // 입력된 값 초기화
                                            this.setValue("");

                                            // 미리보기쪽 이미지를 지운다.
                                            sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", "");

                                            return false;
                                        }

                                        return true;

                                    })

                                ]
                            }),
                        ]
                    })

                ]

            }),

            oPanel3 = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "3. 대표 이미지 첨부"
                        }),

                        new sap.m.RadioButtonGroup({
                            columns: 2,
                            selectedIndex: "{/PRC/IMAGE/RDBIDX}",
                            buttons: [
                                new sap.m.RadioButton({
                                    text: "URL Path",
                                }),
                                new sap.m.RadioButton({
                                    text: "Local File",
                                }),
                            ]
                        })

                    ]
                }),

                content: [

                    oForm3

                ]

            });

        return [

            oPanel1,

            oPanel2,

            oPanel3

        ];

    }; // end of oAPP.fn.getSnsPageContent

    /************************************************************************
     * SNS 미리보기 부분 페이지 Content 영역 UI 그리기
     ************************************************************************/
    oAPP.fn.getSnsPrevPageContent = () => {

        let oBoxContainer = new sap.m.VBox({
            renderType: sap.m.FlexRendertype.Bare,
            items: [

                new sap.m.Text({
                    text: "[제목]"
                }).addStyleClass("sapUiTinyMarginBottom"),

                new sap.m.Text({
                    // text: "{/PREV/TITLE}"
                    text: "{/SNS/TITLE}"
                }).addStyleClass("sapUiSmallMarginBottom"),

                new sap.m.Text({
                    text: "[모듈(업무)]"
                }).addStyleClass("sapUiTinyMarginBottom"),

                new sap.m.Text({
                    // text: "{/PREV/TYPE}"
                    text: "{/SNS/TYPE}"
                }).addStyleClass("sapUiSmallMarginBottom"),

                new sap.m.Text({
                    text: "[상세설명]"
                }).addStyleClass("sapUiTinyMarginBottom"),

                new sap.m.Text({
                    // text: "{/PREV/DESC}"
                    text: "{/SNS/DESC}"
                }).addStyleClass("sapUiSmallMarginBottom"),

                new sap.m.VBox({
                    renderType: sap.m.FlexRendertype.Bare,
                    layoutData: new sap.m.FlexItemData({
                        maxHeight: "500px",
                        maxWidth: "500px"
                    }),
                    width: "100%",
                    items: [

                        new sap.m.Image({
                            src: "{/PREV/IMAGE/URL}"
                        })

                        // new sap.m.Image({

                        // }).bindProperty("src", {
                        //     parts: [
                        //         "/SNS/IMAGE/URL",
                        //         "/SNS/IMAGE/DATA",
                        //     ],
                        //     formatter: (URL, DATA) => {

                        //         // 둘다 없으면 빠져나감
                        //         if (!URL && !DATA) {
                        //             return;
                        //         }

                        //         // URL이 있을 경우
                        //         if (URL) {

                        //             console.log("URL 있다");

                        //             return;

                        //         }

                        //         // Local PC 경로가 있을 경우
                        //         if (DATA) {

                        //             console.log("DATA 있다");

                        //             oAPP.fn.readImageLocalDir(DATA, (oImgData) => {

                        //                 debugger;

                        //                 return oImgData;

                        //             });

                        //         }

                        //     } // end of formatter

                        // }), // end of bindProperty(src)

                    ]

                }),

            ]

        }).addStyleClass("sapUiSmallMargin");

        return [
            oBoxContainer
        ];

    }; // end of oAPP.fn.getSnsPrevPageContent

    /************************************************************************
     * Local PC에 있는 이미지를 읽는다.
     ************************************************************************/
    oAPP.fn.readImageLocalDir = (sImgPath, fnCallback) => {

        if (!sImgPath) {
            return;
        }

        // 파일이 진짜로 있는지 확인
        let bIsExists = oAPP.fs.existsSync(sImgPath);
        if (!bIsExists) {
            return;
        }

        let sMimeType = oAPP.mimetype.lookup(sImgPath);

        let oImgBuffer = oAPP.fs.readFileSync(sImgPath),
            oImgFileBlob = new Blob([oImgBuffer], {
                type: sMimeType
            });

        var reader = new FileReader();
        reader.readAsDataURL(oImgFileBlob);
        reader.onloadend = function () {

            var base64data = reader.result;

            if (typeof fnCallback === "function") {
                fnCallback(base64data);
            }

        }

    }; // end of oAPP.fn.readImageLocalDir

    /************************************************************************
     * Video Local File Select Dialog
     ************************************************************************/
    oAPP.fn.videoFileSelect = () => {

        let defaultDownPath = oAPP.app.getPath("downloads");

        // 이전에 지정한 파일 다운 폴더 경로가 있을 경우 해당 경로 띄우기.
        if (!!oAPP._filedownFolderPath) {
            defaultDownPath = oAPP._filedownPath;
        }

        // 다운받을 폴더 지정하는 팝업에 대한 Option
        var options = {
            // See place holder 1 in above image
            title: "Attach Video File",

            // See place holder 2 in above image            
            defaultPath: defaultDownPath,
            filters: [{
                name: "video",
                extensions: ["mov", "mp4"]
            }],

            properties: ['openFile', 'dontAddToRecent']

        };

        var oFilePathPromise = oAPP.remote.dialog.showOpenDialog(oAPP.remote.getCurrentWindow(), options);
        oFilePathPromise.then((oPathInfo) => {

            // 취소 했을 경우 빠져나간다.
            if (oPathInfo.canceled) {
                return;
            }

            let sFilePath = oPathInfo.filePaths[0];

            // 현재 선택한 경로 저장
            oAPP._filedownPath = sFilePath;

            sap.ui.getCore().getModel().setProperty("/SNS/VIDEO/LURL", sFilePath);

        });

    }; // end of oAPP.fn.videoFileSelect

    /************************************************************************
     * Image Local File Select Dialog
     ************************************************************************/
    oAPP.fn.imageFileSelect = () => {

        let defaultDownPath = oAPP.app.getPath("downloads");

        // 이전에 지정한 파일 경로가 있을 경우 해당 경로 띄우기.
        if (!!oAPP._filedownFolderPath) {
            defaultDownPath = oAPP._filedownPath;
        }

        // 다운받을 폴더 지정하는 팝업에 대한 Option
        var options = {
            // See place holder 1 in above image
            title: "Attach Image File",

            // See place holder 2 in above image            
            defaultPath: defaultDownPath,
            filters: [{
                name: "Image",
                extensions: ["jpg", "jpeg", "png", "gif", "bmp"]
            }],

            properties: ['openFile', 'dontAddToRecent']

        };

        // busy 실행
        oAPP.setBusy(true);

        var oFilePathPromise = oAPP.remote.dialog.showOpenDialog(oAPP.remote.getCurrentWindow(), options);
        oFilePathPromise.then((oPathInfo) => {

            // 취소 했을 경우 빠져나간다.
            if (oPathInfo.canceled) {

                // busy 끄기
                oAPP.setBusy(false);

                return;
            }

            let sFilePath = oPathInfo.filePaths[0];

            // 현재 선택한 경로 저장
            oAPP._filedownPath = sFilePath;

            oAPP.fn.readImageLocalDir(sFilePath, (sImgSrc) => {

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/LURL", sFilePath);

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/DATA", sImgSrc);

                sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", sImgSrc);

                oAPP.setBusy(false);

            });

        });

    }; // end of oAPP.fn.imageFileSelect

    /************************************************************************
     * 게시글 SNS에 전송
     ************************************************************************/
    oAPP.fn.sendPost = () => {

        var TY_IFDATA = {

            "TITLE": "", //제목 
            "TYPE": "", //문서 유형
            "DESC": "", //내역 
            "SAMPLE_URL": "", //샘플 URL
            "IMAGE": {
                "URL": "", //대표 이미지 URL
                "T_URL": [], //서브 이미지 URL 
                "DATA": "" //대표 이미지 Data (Base64)
            },
            "VIDEO": {
                "URL": "", //동영상 URL 
                "FPATH": "" //동영상 path(PC 디렉토리 경로)
            },
            "HASHTAG": [] //해시태그

        };

        debugger;

        let oChoice = sap.ui.getCore().getModel().getProperty("/PRC/CHOICE");

        // SNS 전송 대상 선택 정보가 있으면 지우고 모델 기준으로 다시 설정
        if (oAPP.oChoiceInfo) {
            delete oAPP.oChoiceInfo;
        }

        oAPP.oChoiceInfo = oChoice;

        // 파라미터 구조 매핑
        let oSns = sap.ui.getCore().getModel().getProperty("/SNS");

        TY_IFDATA.TITLE = oSns.TITLE;
        TY_IFDATA.TYPE = oSns.TYPE;
        TY_IFDATA.DESC = oSns.DESC;
        TY_IFDATA.IMAGE.URL = oSns.IMAGE.URL;
        TY_IFDATA.IMAGE.DATA = oSns.IMAGE.DATA;
        TY_IFDATA.VIDEO.URL = oSns.VIDEO.URL;
        TY_IFDATA.VIDEO.FPATH = oSns.VIDEO.LURL;

        oAPP.setBusy(true);

        oAPP.fn.sendSNS(TY_IFDATA).then((oResult) => {

            oAPP.setBusyMsg("완료!");

            oAPP.setBusy(false);

            sap.m.MessageBox.success("전송 완료!!!!!!!!", {
                title: "Success", // default
                onClose: null, // default
                styleClass: "", // default
                actions: sap.m.MessageBox.Action.OK, // default
                emphasizedAction: sap.m.MessageBox.Action.OK, // default
                initialFocus: null, // default
                textDirection: sap.ui.core.TextDirection.Inherit // default
            });

        });

    }; // end of oAPP.fn.sendPost

    oAPP.fn.sendSNS = (TY_IFDATA) => {

        // 순서
        // 1. 텔레그램
        // 2. youtube
        // 3. facebook
        // 4. instagram
        // 5. telegram
        // 6. kakao

        return new Promise((resolve, reject) => {
            debugger;

            oAPP.setBusyMsg("Youtube 전송중...");

            oAPP.youtube.send(TY_IFDATA, (TY_IFDATA) => {

                debugger;

                oAPP.setBusyMsg("Facebook 전송중...");

                oAPP.facebook.send(TY_IFDATA, (TY_IFDATA) => {

                    debugger;

                    oAPP.setBusyMsg("Instagram 전송중...");

                    oAPP.instagram.send(TY_IFDATA, (TY_IFDATA) => {

                        oAPP.setBusyMsg("telegram 전송중...");

                        oAPP.telegram.send(TY_IFDATA, () => {

                            resolve();

                        });


                    });

                });

            });

        });

    }; // end of oAPP.fn.sendSNS


    oAPP.setBusyMsg = (sMsg) => {

        oAPP.setProperty("/PRC/BUSYTXT", sMsg);

    }; // end of oAPP.setBusyMsg

    oAPP.setProperty = (sBindPath, oData, bIsRefresh = true) => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return;
        }

        oCoreModel.setProperty(sBindPath, oData, bIsRefresh);

    }; // end of  oAPP.setProperty

    oAPP.setBusy = (bIsBusy) => {

        let oBusyDialog = sap.ui.getCore().byId("busyDlg"),
            oPrc = sap.ui.getCore().getModel().getProperty("/PRC");

        // 메시지 기본값으로 설정하고 시작한다.
        oPrc.BUSYTXT = oPrc.BUSYTXD;

        sap.ui.getCore().getModel().setProperty("/PRC", oPrc);

        if (oBusyDialog) {

            if (bIsBusy) {
                oBusyDialog.open();
            } else {
                oBusyDialog.close();
            }

            return;
        }

        oBusyDialog = new sap.m.Dialog("busyDlg", {
            showHeader: false,
            content: new sap.m.VBox({
                alignContent: sap.m.FlexAlignContent.Center,
                renderType: sap.m.FlexRendertype.Bare,
                width: "100%",
                items: [

                    new sap.m.BusyIndicator({
                        text: "{/PRC/BUSYTXT}"
                    }).addStyleClass("u4aBusyIndicator sapUiSmallMarginTopBottom")

                ]
            }),

            escapeHandler: () => {}

        }).addStyleClass("sapUiContentPadding");

        if (bIsBusy) {
            oBusyDialog.open();
        } else {
            oBusyDialog.close();
        }

    }; // end of oAPP.setBusy

    /************************************************************************
     * 메시지 Popover 실행
     ************************************************************************/
    oAPP.fn.openMsgPopover = () => {





    }; // end of oAPP.fn.openMsgPopover

})(oAPP);

document.addEventListener("DOMContentLoaded", () => {

    oAPP.fn.attachInit();

});