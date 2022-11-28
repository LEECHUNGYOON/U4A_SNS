((oAPP) => {
    "use strict";

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onunhandledrejection);

    document.addEventListener("error", onError);
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);

    /************************************************************************
     * Server Background 실행 모드
     ************************************************************************/
    oAPP.server.serverOn = () => {

        oAPP.server.createServer(
            oAPP.remote,
            oAPP.server.onReq,
            () => { // success             

                // 서버가 정상적으로 붙으면 Hide 처리
                let oCurrWin = oAPP.remote.getCurrentWindow();
                oCurrWin.hide();

                // 서버가 정상적으로 붙으면 콘솔창 닫기
                let oWebCon = oAPP.remote.getCurrentWebContents();
                if (oWebCon.isDevToolsOpened()) {
                    oWebCon.closeDevTools();
                }

            },
            (error) => { // error

                // 오류 메시지 띄우기
                let sErrMsg = `[http server error] : ${error.toString()}`;

                let oErrMsg = {
                    RETCD: "E",
                    RTMSG: sErrMsg
                };

                // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)
                oAPP.errorlog.writeLog("01", oErrMsg);

                let oCurrWin = oAPP.remote.getCurrentWindow(),
                    bIsVisible = oCurrWin.isVisible();

                // 아직 화면이 떠있다면 오류 메시지 출력
                if (bIsVisible) {
                    oAPP.dialog.showErrorBox("window onerror", sErrMsg);
                }

            });

    }; // end of oAPP.server.serverOn

    /************************************************************************
     * 서버로 요청 받을 경우
     ************************************************************************/
    oAPP.server.onReq = async (oData, oReq, oRes) => {

        let oErrLog = oAPP.errorlog;

        // 기존 오류 로그 다 지운다.
        oAPP.errorlog.clearAll();

        // path 분기
        let sReqPath = oData.PATH;

        switch (sReqPath) {
            case "/restart": // 프로그램 재시작

                oRes.end(JSON.stringify({
                    RETCD: "OK",
                }));

                var oRetData = await oAPP.sendADMINnotice.send(oAPP.remote, "002");

                // 전송 오류일 경우 오류 로그를 남긴다.
                if (oRetData.RETCD == "E") {
                    oAPP.errorlog.writeLog("01", oRetData);
                }

                oAPP.fn.onAppRestart();

                return;

            case "/sampleSNSsend":

                break;

            case "/favicon.ico":
            case "/favicon":
            case "favicon":

                oRes.end("");
                return;

            default:

                oErrLog.writeLog("02", {
                    RETCD: "E",
                    RTMSG: `👿🚨🚨 비인가된 사용자가 접속시도를 하였습니다!!🚨🚨👿 [ ${sReqPath} ]`
                });

                let code = "<html><head><meta charset='utf-8'></head> <body>⛔ 👉🤙🖕👍 어떤 세끼냐? who are you? 👉🤙🖕👍 ⛔</body></html>";
                oRes.end(code);

                return;

        }


        if (!oData.PARAM.length) {
            return;
        }

        let aSnsData;

        // 파라미터가 JSON 구조인지 확인
        try {

            aSnsData = JSON.parse(oData.PARAM[0].VALUE);

        } catch (error) {

            oRes.end(JSON.stringify({
                RETCD: "E",
                RTMSG: "JSON Parse Error!"
            }));

            return;
        }

        // 파라미터 타입이 Array인지 확인
        if (aSnsData instanceof Array == false) {

            oRes.end(JSON.stringify({
                RETCD: "E",
                RTMSG: "Array 형식이 아닙니다!"
            }));

            return;
        }

        let iSnsDataLength = aSnsData.length;

        for (var i = 0; i < iSnsDataLength; i++) {

            var oChoiceInfo = {};

            var oSnsData = aSnsData[i],
                aSnsType = oSnsData.T_SNSTYP,
                iSnsTypeLength = aSnsType.length;

            for (var j = 0; j < iSnsTypeLength; j++) {

                oChoiceInfo[aSnsType[j]] = true;

            }

            var oSnsInfo = oSnsData.APPINFO;

            oSnsInfo.TYPE = oAPP.fn.getModuleDesc(oSnsInfo.TYPE);

            await oAPP.fn.sendSNS(oSnsInfo, oChoiceInfo);

        }

        // SNS 전송시 오류가 있었다면 Log 파일 저장
        oErrLog.writeLog("02", oErrLog.getLog());

        oRes.end(JSON.stringify({
            RETCD: "S",
            RTMSG: "전송 완료!"
        }));

    }; // end of oAPP.server.onReq

    /************************************************************************
     * UI5 Bootstrap Init
     ************************************************************************/
    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(() => {

            oAPP.jQuery = jQuery;

            jQuery.sap.require("sap.m.MessageBox");

            oAPP.fn.initModeling();

            oAPP.fn.initRendering();

        });

    }; // end of oAPP.fn.attachInit    

    /************************************************************************
     * Model 초기 세팅
     ************************************************************************/
    oAPP.fn.initModeling = () => {

        oAPP.mDefaultModel = {
            PRC: {
                BODYTXT: "", // 미리보기 본문 텍스트
                MSGPOP: { // Message Popover 구조
                    BTNICO: "sap-icon://message-popup",
                    BTNTYP: sap.m.ButtonType.Default,
                    MSGCNT: 0,
                    MSGLIST: []
                },
                SUBJECT: oAPP.subject,
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
                    KAKAO_STORY: true,
                    TELEGRAM: true
                },
                BUSYTXD: "잠시만 기다려 주십시오...", // Busy default Text
                BUSYTXT: "",
                TYPEKEY: "999", // 선택한 모듈의 키값  // 모듈 종류
                TYPELIST: oAPP.aModuleCode
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

        let RANDOMKEY = oAPP.randomkey,
            aHashTempData = [];

        for (let i = 0; i < 1; i++) {

            let sRandomKey = RANDOMKEY.generateBase30(10),
                oRowData = {
                    KEY: sRandomKey,
                    TAG: ""
                };

            aHashTempData.push(oRowData);

        }

        oAPP.mDefaultModel.SNS.HASHTAG = aHashTempData;
        // oAPP.mDefaultModel.EMO = oAPP.fn.getEmogiIcons(); // 유니코드 이모티콘
        oAPP.mDefaultModel.EMOGILIST = oAPP.fn.getEmogiGroupList();

        let oModelData = jQuery.extend(true, {}, oAPP.mDefaultModel);

        oModelData.PREV = jQuery.extend(true, {}, oModelData.SNS); // 미리보기쪽 구조
        oModelData.PRC.BUSYTXT = oModelData.PRC.BUSYTXD;

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setSizeLimit(100000);
        oJsonModel.setData(oModelData);

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {

            sap.ui.getCore().setModel(oJsonModel);
            return;
        }

        oCoreModel.setSizeLimit(100000);
        oCoreModel.setModel(oJsonModel);

    }; // end of oAPP.fn.initModeling

    /************************************************************************
     * 초기 화면 그리기
     ************************************************************************/
    oAPP.fn.initRendering = () => {

        let oApp = new sap.m.App(),
            aPageContent = oAPP.fn.getPageContent(),
            oPage = new sap.m.Page({

                // title: "U4A SNS Manager",
                titleAlignment: sap.m.TitleAlignment.Center,
                enableScrolling: false,

                customHeader: new sap.m.Bar({
                    contentMiddle: [
                        new sap.m.Title({
                            text: "U4A SNS Manager"
                        })
                    ],
                    contentRight: [
                        new sap.m.Button({
                            type: sap.m.ButtonType.Negative,
                            icon: "sap-icon://restart",
                            text: "Restart",
                            press: () => {

                                let sMsg = "프로그램을 재시작 하시겠습니까?";
                                sap.m.MessageBox.confirm(sMsg, {
                                    onClose: (oAction) => {

                                        if (oAction != "OK") {
                                            return;
                                        }

                                        // 프로그램 재시작
                                        oAPP.fn.onAppRestart();

                                    }

                                });

                            }
                        })
                    ]
                }),

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
                                            new sap.m.Button("msgpop_btn", {
                                                icon: "{/PRC/MSGPOP/BTNICO}",
                                                text: "{/PRC/MSGPOP/MSGCNT}",
                                                press: (oEvent) => {

                                                    oAPP.fn.openMsgPopover(oEvent);

                                                }
                                            }).bindProperty("type", {
                                                parts: [
                                                    "/PRC/MSGPOP/MSGCNT",
                                                ],
                                                formatter: (MSGCNT) => {

                                                    let sDefType = sap.m.ButtonType.Default;

                                                    if (MSGCNT == null) {
                                                        return sDefType;
                                                    }

                                                    // sap.m.ButtonType.Negative
                                                    if (MSGCNT == 0) {
                                                        return sDefType;
                                                    }

                                                    return sap.m.ButtonType.Negative;

                                                }
                                            })
                                        ],

                                        contentRight: [
                                            new sap.m.CheckBox({
                                                text: "Youtube",
                                                selected: "{/PRC/CHOICE/YOUTUBE}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Telegram",
                                                selected: "{/PRC/CHOICE/TELEGRAM}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Facebook",
                                                selected: "{/PRC/CHOICE/FACEBOOK}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Instagram",
                                                selected: "{/PRC/CHOICE/INSTAGRAM}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Kakao Story",
                                                selected: "{/PRC/CHOICE/KAKAO_STORY}"
                                            }),
                                            new sap.m.Button({
                                                icon: "sap-icon://paper-plane",
                                                text: "Send Post",
                                                type: sap.m.ButtonType.Emphasized,
                                                press: () => {

                                                    sap.m.MessageBox.confirm("해당 게시글을 SNS에 전송하시겠습니까?", {
                                                        title: "Confirm", // default                                                        
                                                        styleClass: "", // default
                                                        actions: [sap.m.MessageBox.Action.OK,
                                                            sap.m.MessageBox.Action.CANCEL
                                                        ], // default
                                                        emphasizedAction: sap.m.MessageBox.Action.OK, // default
                                                        initialFocus: null, // default
                                                        textDirection: sap.ui.core.TextDirection.Inherit, // default
                                                        onClose: (sAction) => {

                                                            if (sAction !== sap.m.MessageBox.Action.OK) {
                                                                return;
                                                            }

                                                            // 게시글 SNS에 전송
                                                            oAPP.fn.sendPost();

                                                        }, // default

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
                                    footer: new sap.m.Bar({
                                        visible: false,
                                        contentLeft: [

                                            new sap.m.Button({
                                                text: "업데이트 팝업",
                                                press: () => {
                                                    oAPP.fn.testPopup();
                                                }
                                            })

                                        ]
                                    })

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



    oAPP.fn.testPopup = () => {

        const BrowserWindow = oAPP.remote.require('electron').BrowserWindow;

        let oCurrWin = oAPP.remote.getCurrentWindow();
       

        let loadUrl = oAPP.path.join(oAPP.apppath, "update.html"),
            appIcon = oAPP.path.join(oAPP.apppath, "/img/logo.png");

        let browserWindowOpts = {
            "icon": appIcon,
            "height": 150,
            "width": 400,
            "frame": false,
            "alwaysOnTop": true,
            // "transparent": true,
            "autoHideMenuBar": true,
            "backgroundColor": "#030303",
            "webPreferences": {
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false,
                "backgroundThrottling": false,
                "nativeWindowOpen": true,
                "webSecurity": false
            }
        };

        let oBrowserWindow = new BrowserWindow(browserWindowOpts);
        oAPP.remoteMain.enable(oBrowserWindow.webContents);

        oBrowserWindow.loadURL(loadUrl, browserWindowOpts);

        oBrowserWindow.webContents.on('did-finish-load', function () {

            oCurrWin.hide();
            
            let intValue = 10;

            let Interval = setInterval(() => {                

                // 메타 정보를 보낸다.
                oBrowserWindow.webContents.send('if-update-info', intValue);

                intValue += 10;


            }, 1000);

            setTimeout(() => {

                clearInterval(Interval);
                Interval = null;

                oBrowserWindow.close();

            }, 10000);


        });


        // Open the DevTools.
        oBrowserWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        oBrowserWindow.on('closed', () => {

            oCurrWin.show();

            oBrowserWindow = null;

        });

    };

    /************************************************************************
     * SNS 입력 부분 페이지 Content 영역 UI 그리기
     ************************************************************************/
    oAPP.fn.getSnsPageContent = () => {


        oAPP.oEditor = new sap.ui.codeeditor.CodeEditor({
            type: "plain_text",
            lineNumbers: false,
            syntaxHints: false,
            height: "500px",
            value: "{/SNS/DESC}",
            change: () => {

                // 미리보기 갱신
                oAPP.fn.prevText();

            }
        }).addStyleClass("sapUiTinyMarginTop");

        oAPP.oCodeEditor = oAPP.oEditor._oEditor;

        oAPP.oCodeEditor.setFontSize("20px");

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
                                    text: "{/PRC/SUBJECT/TITLE}" // "제목"
                                }),
                                fields: [
                                    new sap.m.Input({
                                        value: "{/SNS/TITLE}",
                                        change: () => {

                                            // 미리보기 갱신
                                            oAPP.fn.prevText();
                                        }
                                    }),

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "{/PRC/SUBJECT/TYPE}" // "모듈(업무)"
                                }),
                                fields: [

                                    new sap.m.Select("typeSelect", {
                                        // selectedKey: "{/PRC/TYPEKEY}",
                                        change: (oEvent) => {

                                            let oSelect = oEvent.getSource(),
                                                oSelectModel = oSelect.getModel(),
                                                oSelectedItem = oEvent.getParameter("selectedItem"),
                                                sSelectedText = oSelectedItem.getText();

                                            oSelectModel.setProperty("/SNS/TYPE", sSelectedText);

                                            // 미리보기 갱신
                                            oAPP.fn.prevText();

                                        },
                                        items: {
                                            path: "/PRC/TYPELIST",
                                            template: new sap.ui.core.ListItem({
                                                // key: "{KEY}",
                                                // text: "{TEXT}",
                                                key: "{MODCD}",
                                                text: "{MODNM}"
                                            })
                                        }
                                    }).bindProperty("selectedKey", "/PRC/TYPEKEY", function (TYPEKEY) {

                                        let oModel = this.getModel(),
                                            aTypeList = oModel.getProperty("/PRC/TYPELIST");

                                        let oFind = aTypeList.find(elem => elem.MODCD == TYPEKEY);
                                        if (oFind) {
                                            oModel.setProperty("/SNS/TYPE", oFind.MODNM);
                                            oModel.refresh();
                                        }

                                        return TYPEKEY;

                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "{/PRC/SUBJECT/DESC}" // "상세설명"
                                }),
                                fields: [
                                    new sap.m.VBox({
                                        renderType: sap.m.FlexRendertype.Bare,
                                        items: [

                                            oAPP.oEditor,
                                            // new sap.m.TextArea({
                                            //     width: "100%",
                                            //     rows: 20,
                                            //     value: "{/SNS/DESC}",
                                            //     change: () => {

                                            //         // 미리보기 갱신
                                            //         oAPP.fn.prevText();

                                            //     }
                                            // }),
                                            new sap.m.Bar({
                                                contentRight: [
                                                    new sap.m.Button({
                                                        icon: "sap-icon://feedback",
                                                        press: (oEvent) => {

                                                            oAPP.fn.openEmogiPopup(oEvent);
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "{/PRC/SUBJECT/SAMPLE_URL}" // "Sample URL"
                                }),
                                fields: [
                                    new sap.m.Input({
                                        value: "{/SNS/SAMPLE_URL}",
                                        change: () => {

                                            // 미리보기 갱신
                                            oAPP.fn.prevText();

                                        }

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

                                ]

                            }).bindProperty("visible", "/PRC/VIDEO/RDBIDX", function (iIndex) {

                                if (iIndex !== 0) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setModelProperty("/SNS/VIDEO/URL", "");

                                    return false;
                                }

                                return true;

                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "Local File"
                                }),
                                fields: [

                                    new sap.m.Input({
                                        value: "{/SNS/VIDEO/FPATH}",
                                        showValueHelp: true,
                                        valueHelpIconSrc: "sap-icon://attachment",
                                        valueHelpOnly: true,
                                        valueHelpRequest: () => {
                                            oAPP.fn.videoFileSelect();
                                        }
                                    })

                                ]
                            }).bindProperty("visible", "/PRC/VIDEO/RDBIDX", function (iIndex) {

                                if (iIndex !== 1) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setModelProperty("/SNS/VIDEO/FPATH", "");

                                    return false;
                                }

                                return true;

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
                            text: "2. 동영상 첨부"
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
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://sys-help",
                            type: sap.m.ButtonType.Emphasized,
                            press: (oEvent) => {

                                oAPP.fn.helpVideo(oEvent);

                            }
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

                                ]
                            }).bindProperty("visible", "/PRC/IMAGE/RDBIDX", function (iIndex) {

                                if (iIndex !== 0) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setModelProperty("/SNS/IMAGE/URL", "");

                                    // 미리보기쪽 이미지를 지운다.
                                    sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", "");

                                    return false;
                                }

                                return true;

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

                                ]

                            }).bindProperty("visible", "/PRC/IMAGE/RDBIDX", function (iIndex) {

                                if (iIndex !== 1) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setModelProperty("/SNS/IMAGE/LURL", "");

                                    // Blob 파일 정보를 지운다.
                                    oAPP.setModelProperty("/SNS/IMAGE/DATA", "");

                                    // 이미지 로컬 경로 데이터를 지운다
                                    oAPP.setModelProperty("/SNS/IMAGE/FPATH", "");

                                    // 미리보기쪽 이미지를 지운다.
                                    oAPP.setModelProperty("/PREV/IMAGE/URL", "");

                                    return false;
                                }

                                return true;

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
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://sys-help",
                            type: sap.m.ButtonType.Emphasized,
                            press: (oEvent) => {

                                oAPP.fn.helpImage(oEvent);

                            }
                        })

                    ]
                }),

                content: [

                    oForm3

                ]

            }),

            oHashTable = new sap.ui.table.Table("hashTable", {

                // properties
                alternateRowColors: true,
                visibleRowCount: 5,

                // aggregations
                columns: [
                    new sap.ui.table.Column({
                        // hAlign: sap.ui.core.HorizontalAlign.Center,
                        label: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: `Hash Tag       ex) #U4A #UI5`
                        }),
                        template: new sap.m.Input({
                            value: "{TAG}",
                            change: () => {

                                // 미리보기 갱신
                                oAPP.fn.prevText();

                            }
                        })
                    })
                ],

                extension: new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Button({
                            icon: "sap-icon://add",
                            type: sap.m.ButtonType.Emphasized,
                            press: oAPP.fn.addHashTag
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://less",
                            type: sap.m.ButtonType.Negative,
                            press: oAPP.fn.delHashTag
                        }),
                    ]
                }),

                rows: {
                    path: "HASHTAG"
                }

            }).bindElement("/SNS"),

            oPanel4 = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "4. Hash Tag"
                        }),
                    ]
                }),

                content: [

                    oHashTable

                ]

            });

        return [

            oPanel1, // 본문

            oPanel2, // Youtube 동영상 첨부

            oPanel3, // 대표 이미지 첨부

            oPanel4, // Hash Tag

        ];

    }; // end of oAPP.fn.getSnsPageContent

    /************************************************************************
     * Hash Tag 추가하기
     ************************************************************************/
    oAPP.fn.addHashTag = () => {

        let oHashTable = sap.ui.getCore().byId("hashTable");
        if (!oHashTable) {
            return;
        }

        let RANDOMKEY = oAPP.randomkey,
            sRandomKey = RANDOMKEY.generateBase30(10),
            oNewRow = {
                KEY: sRandomKey,
                TAG: ""
            };

        let oTableModel = oHashTable.getModel(),
            aTableData = oTableModel.getProperty("/SNS/HASHTAG");

        if (!aTableData || aTableData.length <= 0) {
            oTableModel.setProperty("/SNS/HASHTAG", [oNewRow]);
            return;
        }

        aTableData.push(oNewRow);

        oTableModel.refresh();

    }; // end of oAPP.fn.addHashTag

    /************************************************************************
     * Hash Tag 삭제하기
     ************************************************************************/
    oAPP.fn.delHashTag = () => {

        let oHashTable = sap.ui.getCore().byId("hashTable");
        if (!oHashTable) {
            return;
        }

        let aSelIdx = oHashTable.getSelectedIndices(),
            iSelLenth = aSelIdx.length;

        if (iSelLenth <= 0) {
            return;
        }

        let oTableModel = oHashTable.getModel(),
            aTableData = jQuery.extend(true, [], oTableModel.getProperty("/SNS/HASHTAG"));

        for (var i = 0; i < iSelLenth; i++) {

            var iSelIdx = aSelIdx[i],
                oCtx = oHashTable.getContextByIndex(iSelIdx),
                sKey = oCtx.getObject("KEY"),
                iFindIndex = aTableData.findIndex((DATA) => DATA.KEY == sKey);

            if (iFindIndex < 0) {
                continue;
            }

            aTableData.splice(iFindIndex, 1);

        }

        oTableModel.setProperty("/SNS/HASHTAG", aTableData);

        oHashTable.clearSelection();

    }; // end of oAPP.fn.delHashTag

    /************************************************************************
     * SNS 미리보기 부분 페이지 Content 영역 UI 그리기
     ************************************************************************/
    oAPP.fn.getSnsPrevPageContent = () => {

        let oBoxContainer = new sap.m.VBox({
            renderType: sap.m.FlexRendertype.Bare,
            items: [

                new sap.m.Text({
                    text: "{/PRC/BODYTXT}"
                }).addStyleClass("sapUiTinyMarginBottom"),

                new sap.m.VBox({
                    width: "100%",
                    renderType: sap.m.FlexRendertype.Bare,

                    layoutData: new sap.m.FlexItemData({
                        maxHeight: "500px",
                        maxWidth: "500px"
                    }),
                    items: [
                        new sap.m.Image({
                            src: "{/PREV/IMAGE/URL}"
                        })
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

            fnCallback({
                RETCD: "E",
                RTMSG: "파일이 존재하지 않습니다."
            });

            return;
        }

        let sMimeType = oAPP.mimetype.lookup(sImgPath);

        let oImgBuffer = oAPP.fs.readFileSync(sImgPath),
            oImgFileBlob = new Blob([oImgBuffer], {
                type: sMimeType
            });

        // 파일 용량 체크
        if (oAPP.fn.fnCheckFileSizeLimit(oImgFileBlob.size, 8)) {

            fnCallback({
                RETCD: "E",
                RTMSG: "이미지 파일은 8MB 이하만 첨부 가능합니다."
            });

            return;

        }

        var reader = new FileReader();
        reader.readAsDataURL(oImgFileBlob);
        reader.onloadend = function () {

            var base64data = reader.result;

            if (typeof fnCallback === "function") {
                fnCallback({
                    RETCD: "S",
                    base64data: base64data,
                    blob: oImgFileBlob
                });
            }

        }

    }; // end of oAPP.fn.readImageLocalDir

    /************************************************************************
     * 로컬 경로에 있는 비디오 파일 선택 Dialog
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

            sap.ui.getCore().getModel().setProperty("/SNS/VIDEO/FPATH", sFilePath);

        });

    }; // end of oAPP.fn.videoFileSelect

    /************************************************************************
     * 로컬 경로에 있는 이미지 파일 선택 Dialog
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
                extensions: ["jpg", "jpeg", "png", "bmp"]
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

            // 파일을 읽어본다.
            oAPP.fn.readImageLocalDir(sFilePath, (oResult) => {

                if (oResult.RETCD && oResult.RETCD == "E") {

                    sap.m.MessageBox.error(oResult.RTMSG, {
                        title: "Error", // default
                        onClose: null, // default
                        styleClass: "", // default
                        actions: sap.m.MessageBox.Action.CLOSE, // default
                        emphasizedAction: null, // default
                        initialFocus: null, // default
                        textDirection: sap.ui.core.TextDirection.Inherit // default
                    });

                    oAPP.setBusy(false);

                    return;

                }

                oAPP.setModelProperty("/SNS/IMAGE/FPATH", sFilePath);

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/LURL", sFilePath);

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/DATA", oResult.blob);

                sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", oResult.base64data);

                oAPP.setBusy(false);

            });

        });

    }; // end of oAPP.fn.imageFileSelect

    /************************************************************************
     * 파일 용량 체크
     ************************************************************************
     * @param {Blob} size 
     * - Blob 파일의 size
     * 
     * @param {Integer} iLimit 
     * - 체크할 파일 사이즈 [단위: MB]
     * 
     * @return {Boolean}
     ************************************************************************/
    oAPP.fn.fnCheckFileSizeLimit = (size, iLimit) => {

        var limitSize = iLimit * 1024 * 1024;

        if (size > limitSize) {
            return true;
        }

        return false;

    }; // end of oAPP.fn.fnCheckFileSizeLimit

    /************************************************************************
     * 테이블에 추가한 해시태그 정보 구하기
     ************************************************************************/
    oAPP.fn.getHashTagList = () => {

        let oHashTable = sap.ui.getCore().byId("hashTable");
        if (!oHashTable) {
            return;
        }

        let oTableModel = oHashTable.getModel(),
            aHashTags = oTableModel.getObject("/SNS/HASHTAG"),
            aHash = [];

        for (var i = 0; i < aHashTags.length; i++) {

            var oHashInfo = aHashTags[i];

            if (!oHashInfo.TAG) {
                continue;
            }

            aHash.push(oHashInfo.TAG);

        }

        return aHash;

    }; // end of oAPP.fn.getHashTagList

    /************************************************************************
     * 해시태그 테이블에 있는 텍스트를 읽어서 '#' 이 없는 텍스트에 '#' 를 붙인다
     ************************************************************************/
    oAPP.fn.getHashText = (aHashTag) => {

        if (!Array.isArray(aHashTag)) {
            return "";
        }

        var iHashLength = aHashTag.length;
        if (iHashLength <= 0) {
            return "";
        }

        let sHashTag = "";

        for (let index = 0; index < iHashLength; index++) {

            let hash = aHashTag[index];
            if (hash == "") {
                continue;
            }

            let aHashLine = hash.split(" "),
                iHashLineLength = aHashLine.length;

            if (iHashLineLength <= 0) {
                continue;
            }

            for (var j = 0; j < iHashLineLength; j++) {

                let sTag = aHashLine[j];
                if (!sTag) {
                    continue;
                }

                if (!sTag.startsWith("#")) {
                    sHashTag += "#" + sTag + " ";
                    continue;
                }

                sHashTag += sTag + " ";

            }

            sHashTag += " \n ";

        }

        return sHashTag;

    }; // end of oAPP.fn.getHashText

    /************************************************************************
     * 게시글 SNS에 전송
     ************************************************************************/
    oAPP.fn.sendPost = () => {

        // 전송할 SNS 선택 구조
        let oChoice = sap.ui.getCore().getModel().getProperty("/PRC/CHOICE");

        // 체크박스가 하나도 선택 되어 있지 않다면 오류 메시지 출력

        var TY_IFDATA = {

            "TITLE": "", //제목 
            "TYPE": "", // 문서 유형
            "DESC": "", // 내역 
            "SAMPLE_URL": "", // 샘플 URL
            "IMAGE": {
                "URL": "", // 대표 이미지 URL
                "T_URL": [], // 서브 이미지 URL 
                "DATA": "", // 대표 이미지 Data (Base64)
                "FPATH": "" // 이미지 path(PC 디렉토리 경로)
            },
            "VIDEO": {
                "URL": "", // 동영상 URL 
                "FPATH": "" // 동영상 path(PC 디렉토리 경로)
            },
            "HASHTAG": [] // 해시태그

        };

        // SNS 전송할 구조
        let oSns = sap.ui.getCore().getModel().getProperty("/SNS");

        TY_IFDATA.TITLE = oSns.TITLE;
        TY_IFDATA.TYPE = oSns.TYPE;
        TY_IFDATA.DESC = oSns.DESC;
        TY_IFDATA.SAMPLE_URL = oSns.SAMPLE_URL;
        TY_IFDATA.IMAGE.URL = oSns.IMAGE.URL;
        TY_IFDATA.IMAGE.DATA = oSns.IMAGE.DATA;
        TY_IFDATA.IMAGE.FPATH = oSns.IMAGE.FPATH;
        TY_IFDATA.VIDEO.URL = oSns.VIDEO.URL;
        TY_IFDATA.VIDEO.FPATH = oSns.VIDEO.FPATH;
        TY_IFDATA.HASHTAG = oAPP.fn.getHashTagList() || [];

        oAPP.setBusy(true);

        // 기존 오류 로그 다 지운다.
        oAPP.errorlog.clearAll();

        // SNS 일괄 전송!!
        oAPP.fn.sendSNS(TY_IFDATA, oChoice)
            .then(() => {

                // SNS 전송시 오류가 있을 경우 오류에 대한 정보 기록하기
                oAPP.fn.setErrorLogSNS();

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

    /************************************************************************
     * 오류가 있을 경우 오류에 대한 정보 기록하기
     ************************************************************************/
    oAPP.fn.setErrorLogSNS = () => {

        let oDefMsgPopData = jQuery.extend(true, {}, oAPP.getModelProperty("/PRC/MSGPOP"));

        let oErrLog = oAPP.errorlog,
            aLog = oErrLog.getLog(),
            iLoglength = aLog.length;

        oDefMsgPopData.MSGCNT = iLoglength; // 오류 갯수
        oDefMsgPopData.MSGLIST = aLog; // 오류 리스트

        oAPP.setModelProperty("/PRC/MSGPOP", oDefMsgPopData);

        if (iLoglength == 0) {
            return;
        }

        // SNS 전송시 오류가 있었다면 Log 파일 저장
        oErrLog.writeLog("02", aLog);

    }; // end of oAPP.fn.setErrorLogSNS

    /************************************************************************
     * SNS 일괄 전송
     ************************************************************************/
    oAPP.fn.sendSNS = (TY_IFDATA, oChoiceInfo) => {

        return new Promise(async (resolve) => {

            debugger;

            let oErrLog = oAPP.errorlog;

            oAPP.setBusyMsg("NAS 전송중...");

            console.log("NAS 전송 시작");

            var oReturn = await oAPP.oSnsAttachFile.put(TY_IFDATA);

            // 오류 일 경우 올 스톱!!
            if (oReturn.RETCD == "E") {

                console.log("NAS 전송 오류!!");

                //오류                              
                oErrLog.addLog({
                    RETCD: oReturn.RETCD,
                    RTMSG: `[ NAS 전송 오류 ] : ${oReturn.RTMSG}`
                });

                resolve();

                return;

            }

            console.log("NAS 전송 완료!!");

            oAPP.setBusyMsg("Youtube 전송중...");

            console.log("Youtube 시작");

            oAPP.youtube.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                oAPP.setBusyMsg("telegram 전송중...");

                console.log("Youtube 종료");

                console.log("텔레그램 시작");

                oAPP.telegram.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                    oAPP.setBusyMsg("Facebook 전송중...");

                    console.log("텔레그램 종료");

                    console.log("페이스북 시작");

                    oAPP.facebook.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                        oAPP.setBusyMsg("Instagram 전송중...");

                        console.log("페이스북 종료");

                        console.log("인스타그램 시작");

                        oAPP.instagram.send(TY_IFDATA, oChoiceInfo, async (TY_IFDATA) => {

                            oAPP.setBusyMsg("Kakao Story 전송중...");

                            console.log("인스타그램 종료");

                            console.log("카카오 시작");

                            let oErrLog = oAPP.errorlog;

                            // 카카오 전송
                            let aResult = await oAPP.kakaoStory.send(TY_IFDATA, oChoiceInfo);

                            // 카카오 전송 결과가 하나도 없다면
                            if (aResult.length !== 0) {

                                //오류                              
                                oErrLog.addLog({
                                    RETCD: "E",
                                    RTMSG: `[ kakaoStory 전송 오류] : 전송 결과가 하나도 없습니다. `
                                });

                            }

                            // 카카오 전송 결과 Array 중 Error가 있을 경우 Log 수집
                            let iKakaoResultLength = aResult.length;
                            for (let index = 0; index < iKakaoResultLength; index++) {

                                const oRes = aResult[index];

                                if (!oRes.RETCD) {
                                    continue;
                                }

                                if (oRes.RETCD && oRes.RETCD == "E") {

                                    oErrLog.addLog({
                                        RETCD: "E",
                                        RTMSG: oRes.RTMSG || ""
                                    });

                                }

                            }

                            console.log("카카오 종료");

                            resolve();

                            return;

                            // await oAPP.kakaoStory.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                            //     console.log("카카오 종료");

                            //     resolve();

                            //     return;

                            // });

                        });

                    });

                });

            });

        });

    }; // end of oAPP.fn.sendSNS

    /************************************************************************
     * Busy Dialog의 텍스트 내용 변경
     ************************************************************************/
    oAPP.setBusyMsg = (sMsg) => {

        oAPP.setModelProperty("/PRC/BUSYTXT", sMsg);

    }; // end of oAPP.setBusyMsg

    /************************************************************************
     * Model 정보 갱신
     ************************************************************************/
    oAPP.setModelProperty = (sBindPath, oData, bIsRefresh = true) => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return;
        }

        oCoreModel.setProperty(sBindPath, oData, bIsRefresh);

    }; // end of  oAPP.setModelProperty

    /************************************************************************
     * Model 정보 가져오기
     ************************************************************************/
    oAPP.getModelProperty = (sBindPath) => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return;
        }

        return oCoreModel.getProperty(sBindPath);

    }; // end of oAPP.getModelProperty

    /************************************************************************
     * Busy Dialog 실행
     ************************************************************************/
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
    oAPP.fn.openMsgPopover = (oEvent) => {

        let sMsgPopId = "msgpop",
            oMsgPopBtn = oEvent.getSource();

        var oMsgPop = sap.ui.getCore().byId(sMsgPopId);
        if (oMsgPop) {
            oMsgPop.toggle(oMsgPopBtn);
            return;
        }

        var oMessagePopover = new sap.m.MessagePopover(sMsgPopId, {

            items: {
                path: "/PRC/MSGPOP/MSGLIST",
                template: new sap.m.MessageItem({
                    title: "{RTMSG}",
                    description: "{RTMSG}",
                }).bindProperty("type", "RETCD", function (RETCD) {

                    switch (RETCD) {
                        case "S":
                            return sap.ui.core.MessageType.Success;

                        case "E":
                            return sap.ui.core.MessageType.Error;

                        case "W":
                            return sap.ui.core.MessageType.Warning;

                        case "I":
                            return sap.ui.core.MessageType.Information;

                        default:
                            return sap.ui.core.MessageType.None;

                    }

                })
            } // end of item

        });

        oMsgPopBtn.addDependent(oMessagePopover);

        oMessagePopover.toggle(oMsgPopBtn);

    }; // end of oAPP.fn.openMsgPopover

    /************************************************************************
     *  이모티콘 팝업
     ************************************************************************/
    oAPP.fn.openEmogiPopup = (oEvent) => {

        let sPopId = "EmogiPopup",
            oBtn = oEvent.getSource();

        var oPopup = sap.ui.getCore().byId(sPopId);
        if (oPopup) {
            oPopup.openBy(oBtn);
            return;
        }

        var oSplitApp = oAPP.fn.emogiSplitApp();

        var oPopup = new sap.m.Popover(sPopId, {
            title: "이모티콘",
            contentMinWidth: "500px",
            contentHeight: "500px",
            contentWidth: "800px",
            horizontalScrolling: true,
            resizable: true,
            placement: sap.m.PlacementType.Auto,
            content: [

                oSplitApp

            ],
            afterClose: () => {

                oAPP.setModelProperty("/EMO", []);

            }

        });

        oPopup.openBy(oBtn);

    }; // end of oAPP.fn.openEmogiPopup

    oAPP.fn.emogiSplitApp = () => {

        let oSplitApp = new sap.m.SplitApp({
            // mode: sap.m.SplitAppMode.StretchCompressMode,
            mode: sap.m.SplitAppMode.ShowHideMode,
            masterPages: [
                new sap.m.Page({
                    showHeader: false,
                    content: [

                        new sap.m.List({
                            mode: sap.m.ListMode.SingleSelectMaster,
                            selectionChange: (oEvent) => {
                                oAPP.fn.onEmogiListItemPress(oEvent);
                            },
                            items: {
                                path: "/EMOGILIST",
                                template: new sap.m.StandardListItem({
                                    title: "{NAME}"

                                })
                            }

                        })

                    ]

                })
            ], // end of masterPages

            detailPages: [
                new sap.m.Page({
                    showHeader: false,

                    content: [

                        new sap.m.HBox({
                            renderType: sap.m.FlexRendertype.Bare,
                            wrap: sap.m.FlexWrap.Wrap,
                            items: {
                                path: "/EMO",
                                template:

                                    new sap.m.Button({
                                        text: "{emoji}",
                                        type: sap.m.ButtonType.Ghost,
                                        press: (oEvent) => {
                                            oAPP.fn.onPressEmoIcon(oEvent);
                                        }
                                    }).addStyleClass("emogiButtons")

                            }
                        })

                    ]

                }).addStyleClass("sapUiContentPadding emogiPage")

            ] // end of detailPages

        });

        return oSplitApp;

    };

    oAPP.fn.onEmogiListItemPress = (oEvent) => {

        let oSelectItem = oEvent.getParameter("listItem"),
            oCtx = oSelectItem.getBindingContext();

        if (!oCtx) {
            return;
        }

        let oIconData = oCtx.getObject();

        oAPP.setModelProperty("/EMO", oIconData.ICONS);

    };

    oAPP.fn.onPressEmoIcon = (oEvent) => {

        let oBtn = oEvent.getSource(),
            icon = oBtn.getText();

        oAPP.oCodeEditor.insert(icon);

    }; // end of oAPP.fn.onPressEmoIcon

    /************************************************************************
     *  이모티콘 정보 리턴
     ************************************************************************/
    oAPP.fn.getEmogiIcons = () => {

        let aEmogi = [];

        if (!oAPP.aEmogiIcons) {
            return [];
        }

        let iEmogiLength = oAPP.aEmogiIcons.length;
        for (let i = 0; i < iEmogiLength; i++) {
            aEmogi.push({
                ICON: oAPP.aEmogiIcons[i]
            });
        }

        return aEmogi;

    } // end of oAPP.fn.getEmogiIcons

    oAPP.fn.getEmogiGroupList = () => {

        let aGroups = [];

        for (var i in oAPP.emogiGroupIcons) {
            aGroups.push({
                NAME: i,
                ICONS: oAPP.emogiGroupIcons[i]
            });
        }

        return aGroups;

    };

    /************************************************************************
     *  앱 재부팅
     ************************************************************************/
    oAPP.fn.onAppRestart = () => {

        oAPP.remote.app.relaunch();
        oAPP.remote.app.exit();

    }; // end of oAPP.fn.onAppRestart

    /************************************************************************
     *  미리보기 본문 설정
     ************************************************************************/
    oAPP.fn.prevText = () => {

        var oParams = {

            "TITLE": "", //제목 
            "TYPE": "", // 문서 유형
            "DESC": "", // 내역 
            "SAMPLE_URL": "", // 샘플 URL
            "IMAGE": {
                "URL": "", // 대표 이미지 URL
                "T_URL": [], // 서브 이미지 URL 
                "DATA": "" // 대표 이미지 Data (Base64)
            },
            "VIDEO": {
                "URL": "", // 동영상 URL 
                "FPATH": "" // 동영상 path(PC 디렉토리 경로)
            },
            "HASHTAG": [] // 해시태그

        };

        // SNS 전송할 구조
        let oSnsData = sap.ui.getCore().getModel().getProperty("/SNS"),
            oSns = jQuery.extend(true, {}, oSnsData);

        oParams.TITLE = oSns.TITLE;
        oParams.TYPE = oSns.TYPE;
        oParams.DESC = oSns.DESC;
        oParams.SAMPLE_URL = oSns.SAMPLE_URL;
        oParams.IMAGE.URL = oSns.IMAGE.URL;
        oParams.IMAGE.DATA = oSns.IMAGE.DATA;
        oParams.VIDEO.URL = oSns.VIDEO.URL;
        oParams.VIDEO.FPATH = oSns.VIDEO.FPATH;
        oParams.HASHTAG = oAPP.fn.getHashTagList() || [];

        let oSubJect = oAPP.subject;

        let sMsg = `[ ${oSubJect.TITLE} ] \n\n`;
        sMsg += oParams.TITLE + " \n\n\n ";

        sMsg += `[ ${oSubJect.TYPE} ] \n\n`;
        sMsg += oParams.TYPE + " \n\n\n ";

        sMsg += `[ ${oSubJect.DESC} ] \n\n`;
        sMsg += oParams.DESC + " \n\n\n ";

        if (oParams.SAMPLE_URL) {
            sMsg += `[ ${oSubJect.SAMPLE_URL} ] \n\n`;
            sMsg += oParams.SAMPLE_URL + " \n\n\n\n\n\n ";
        }

        if (oParams.IMAGE.T_URL &&
            oParams.IMAGE.T_URL.length !== 0) {

            sMsg += `[ ${oSubJect.REF_IMG} ] \n\n `;

            let iSubImageLength = oParams.IMAGE.T_URL.length;

            for (var i = 0; i < iSubImageLength; i++) {

                let oSubImgUrl = oParams.IMAGE.T_URL[i];

                sMsg += oSubImgUrl.URL + " \n\n ";

            }

        }

        sMsg += " \n\n\n ";

        let iHashLength = oParams.HASHTAG.length;
        if (iHashLength !== 0) {

            for (var i = 0; i < iHashLength; i++) {

                let sHash = oParams.HASHTAG[i];

                sMsg += sHash + " \n ";

            }

        }

        oAPP.setModelProperty("/PRC/BODYTXT", sMsg);

    }; // end of oAPP.fn.prevText

    /************************************************************************
     *  모듈 코드에 따른 Description
     ************************************************************************/
    oAPP.fn.getModuleDesc = (sCode) => {

        if (sCode === null || typeof sCode === "undefined" || typeof sCode !== "string") {
            return "";
        }

        if (!oAPP.aModuleCode) {
            return "";
        }

        let sModuleName = oAPP.aModuleCode.find(elem => elem.MODCD == sCode);
        if (!sModuleName) {
            return "";
        }


        return sModuleName.MODNM || "";

    }; // end of oAPP.fn.getModuleDesc

    /************************************************************************
     * Tray Icon 생성
     ************************************************************************/
    oAPP.fn.createTrayIcon = () => {

        let sTrayIconPath = oAPP.path.join(oAPP.apppath, "img", "logo.png");

        oAPP.oTray = new oAPP.remote.Tray(sTrayIconPath);

        let aMenu = [{
            key: "exit",
            label: "종료",
            click: oAPP.fn.TrayMenu01
        }];

        oAPP.oTrayMenu = oAPP.trayMenu.buildFromTemplate(aMenu);
        oAPP.oTray.setToolTip("U4A SNS");
        oAPP.oTray.setContextMenu(oAPP.oTrayMenu);

        oAPP.oTray.on("double-click", () => {

            let oCurrWin = oAPP.remote.getCurrentWindow(),
                bIsVisible = oCurrWin.isVisible(),
                bIsFocus = oCurrWin.isFocused();

            if (!bIsVisible) {
                oCurrWin.show();
            }

            if (!bIsFocus) {
                oCurrWin.focus();
            }

        });

    }; // end of oAPP.fn.createTrayIcon

    /************************************************************************
     * 동영상 전송 Help Popover
     ************************************************************************/
    oAPP.fn.helpVideo = (oEvent) => {

        let sPopId = "helpVideo",
            oBtn = oEvent.getSource();

        var oPopup = sap.ui.getCore().byId(sPopId);
        if (oPopup) {
            oPopup.openBy(oBtn);
            return;
        }

        var oPopup = new sap.m.Popover({
            title: "Video Help",
            horizontalScrolling: true,
            resizable: true,
            placement: sap.m.PlacementType.Auto,
            content: [

                new sap.ui.layout.form.Form({
                    editable: true,
                    layout: new sap.ui.layout.form.ResponsiveGridLayout({
                        labelSpanL: 12,
                        labelSpanM: 12,
                        labelSpanS: 12,
                        labelSpanXL: 12,
                        columnsL: 2,
                        columnsM: 2,
                        columnsXL: 2
                    }),
                    formContainers: {
                        path: "/video",
                        template: new sap.ui.layout.form.FormContainer({
                            toolbar: new sap.m.Toolbar({
                                content: [
                                    new sap.m.Title({
                                        text: "{title}",
                                        level: sap.ui.core.TitleLevel.H4,
                                        titleStyle: sap.ui.core.TitleLevel.H4
                                    })
                                ]
                            }),
                            formElements: {
                                path: "items",
                                templateShareable: true,
                                template: new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: "{name}"
                                    }),
                                    fields: new sap.m.Text({
                                        text: "{value}"
                                    })
                                })
                            }
                        })
                    }
                })
            ]

        }).addStyleClass("u4aSnsHelpPopover");

        let oHelpdata = oAPP.snsHelp.video,
            oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData({
            video: oHelpdata
        });
        oPopup.setModel(oJsonModel);

        oPopup.openBy(oBtn);

    }; // end of oAPP.fn.helpVideo

    /************************************************************************
     * 이미지 전송 Help Popover
     ************************************************************************/
    oAPP.fn.helpImage = (oEvent) => {

        let sPopId = "helpImage",
            oBtn = oEvent.getSource();

        var oPopup = sap.ui.getCore().byId(sPopId);
        if (oPopup) {
            oPopup.openBy(oBtn);
            return;
        }

        var oPopup = new sap.m.Popover({
            title: "Image Help",
            horizontalScrolling: true,
            resizable: true,
            placement: sap.m.PlacementType.Auto,
            content: [

                new sap.ui.layout.form.Form({
                    editable: true,
                    layout: new sap.ui.layout.form.ResponsiveGridLayout({
                        labelSpanL: 12,
                        labelSpanM: 12,
                        labelSpanS: 12,
                        labelSpanXL: 12,
                        columnsL: 2,
                        columnsM: 2,
                        columnsXL: 2
                    }),
                    formContainers: {
                        path: "/",
                        template: new sap.ui.layout.form.FormContainer({
                            toolbar: new sap.m.Toolbar({
                                content: [
                                    new sap.m.Title({
                                        text: "{title}",
                                        level: sap.ui.core.TitleLevel.H4,
                                        titleStyle: sap.ui.core.TitleLevel.H4
                                    })
                                ]
                            }),
                            formElements: {
                                path: "items",
                                templateShareable: true,
                                template: new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: "{name}"
                                    }),
                                    fields: new sap.m.Text({
                                        text: "{value}"
                                    })
                                })
                            }
                        })
                    }
                })
            ]

        }).addStyleClass("u4aSnsHelpPopover");

        let oHelpdata = oAPP.snsHelp.image,
            oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData(oHelpdata);
        oPopup.setModel(oJsonModel);

        oPopup.openBy(oBtn);

    }; // end of oAPP.fn.helpVideo    

    /************************************************************************
     * Tray Icon의 종료 이벤트
     ************************************************************************/
    oAPP.fn.TrayMenu01 = () => {

        oAPP.remote.app.exit();

    }; // end of oAPP.fn.TrayMenu01

    /************************************************************************
     * html dom이 로드가 완료된 후 타는 이벤트
     ************************************************************************/
    function onDOMContentLoaded() {

        // 화면 그리기
        oAPP.fn.attachInit();

        // Tray 아이콘 만들기
        oAPP.fn.createTrayIcon();

        // pc 이름을 읽어서 백그라운드 모드로 할지 포그라운드로 할지 분기        
        let bIsBackgroundMode = oAPP.isBackgroundMode();
        if (!bIsBackgroundMode) {
            return;
        }

        // 백그라운드 일 경우
        // 서버 가동!!
        oAPP.server.serverOn();

        // // Tray 아이콘 만들고
        // oAPP.fn.createTrayIcon();

    } // end of onDOMContentLoaded

    /************************************************************************
     * 스크립트 오류 감지
     ************************************************************************/
    function onError(oEvent) {

        let oCurrWin = oAPP.remote.getCurrentWindow(),
            bIsVisible = oCurrWin.isVisible(),
            sErrMsg = `[window onerror] : ${oEvent.error.toString()}`;

        // 아직 화면이 떠있다면 오류 메시지 출력
        if (bIsVisible) {
            oAPP.dialog.showErrorBox("window onerror", sErrMsg);
        }

        let oErrMsg = {
            RETCD: "E",
            RTMSG: sErrMsg
        };

        // oAPP.errorlog가 있다면 
        if (oAPP.errorlog) {

            // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)
            oAPP.errorlog.writeLog("01", oErrMsg);

        }

    } // end of onError

    /************************************************************************
     * 비동기 오류 (Promise 등..) 감지
     ************************************************************************/
    function onunhandledrejection(event) {

        let oCurrWin = oAPP.remote.getCurrentWindow(),
            bIsVisible = oCurrWin.isVisible(),
            sErrMsg = event.reason.toString();

        // 아직 화면이 떠있다면 오류 메시지 출력
        if (bIsVisible) {
            oAPP.dialog.showErrorBox("unhandledrejection Error:", sErrMsg);
        }

        let oErrMsg = {
            RETCD: "E",
            RTMSG: sErrMsg
        };

        // oAPP.errorlog가 있다면 
        if (oAPP.errorlog) {

            // 로그 폴더에 타임스탬프 찍어서 파일로 저장한다. (JSON 형태로..)
            oAPP.errorlog.writeLog("01", oErrMsg);

        }

    } // end of onunhandledrejection 

    window.onbeforeunload = () => {

        let oCurrWin = oAPP.remote.getCurrentWindow();

        oCurrWin.hide();

        return "";

    };

})(parent.oAPP);