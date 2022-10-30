let oAPP = parent.oAPP;

((oAPP) => {
    "use strict";

    /************************************************************************
     * Server Background 실행 모드
     ************************************************************************/
    oAPP.server.serverOn = () => {

        oAPP.server.createServer(
            oAPP.remote,
            oAPP.server.onReq,
            () => { // success

                // 서버가 정상적으로 붙으면 Hide 처리
                // // 백그라운드 모드일 경우에만 브라우저 창 Hide 처리
                // let oCurrWin = oAPP.remote.getCurrentWindow();
                // oCurrWin.hide();

            },
            () => { // error

                // error log 남기기

                // 메시지 팝업 띄우기               

            });

    }; // end of oAPP.server.serverOn

    /************************************************************************
     * 서버로 요청 받을 경우
     ************************************************************************/
    oAPP.server.onReq = async (oData, oReq, oRes) => {

        // path 분기




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

            await oAPP.fn.sendSNS(oSnsInfo, oChoiceInfo);

        }

        let oErrLog = oAPP.errorlog;

        // SNS 전송시 오류가 있었다면 Log 파일 저장
        oErrLog.writeLog(oErrLog.getLog());

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
                    MSGCNT: 0,
                    MSGLIST: [{
                        RETCD: "", // return code
                        RTMSG: "" // msg
                    }]
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
                TYPEKEY: "ETC", // 선택한 모듈의 키값  // 모듈 종류
                TYPELIST: [{
                        KEY: "ETC",
                        TEXT: "기타(공통)"
                    }, {
                        KEY: "FI",
                        TEXT: "FI"
                    },
                    {
                        KEY: "CO",
                        TEXT: "CO"
                    },
                    {
                        KEY: "SD",
                        TEXT: "SD"
                    },
                    {
                        KEY: "MM",
                        TEXT: "MM"
                    },
                    {
                        KEY: "PP",
                        TEXT: "PP"
                    },
                    {
                        KEY: "PM",
                        TEXT: "PM"
                    },
                    {
                        KEY: "QM",
                        TEXT: "QM"
                    },
                    {
                        KEY: "PS",
                        TEXT: "PS"
                    },
                    {
                        KEY: "HR",
                        TEXT: "HR"
                    },
                ],
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
                            icon: "sap-icon://settings"
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
                                            new sap.m.CheckBox({
                                                text: "Kakao Story",
                                                selected: "{/PRC/CHOICE/KAKAO_STORY}"
                                            }),
                                            new sap.m.CheckBox({
                                                text: "Telegram",
                                                selected: "{/PRC/CHOICE/TELEGRAM}"
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
                                    text: "{/PRC/SUBJECT/TITLE}" // "제목"
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

                                        },
                                        items: {
                                            path: "/PRC/TYPELIST",
                                            template: new sap.ui.core.ListItem({
                                                key: "{KEY}",
                                                text: "{TEXT}"
                                            })
                                        }
                                    }).bindProperty("selectedKey", "/PRC/TYPEKEY", function(TYPEKEY) {

                                        let oModel = this.getModel(),
                                            aTypeList = oModel.getProperty("/PRC/TYPELIST");

                                        let oFind = aTypeList.find(elem => elem.KEY == TYPEKEY);
                                        if (oFind) {
                                            oModel.setProperty("/SNS/TYPE", oFind.TEXT);
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
                                    new sap.m.TextArea({
                                        width: "100%",
                                        rows: 20,
                                        value: "{/SNS/DESC}"
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

                            }).bindProperty("visible", "/PRC/VIDEO/RDBIDX", function(iIndex) {

                                if (iIndex !== 0) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setProperty("/SNS/VIDEO/URL", "");

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
                                        value: "{/SNS/VIDEO/LURL}",
                                        showValueHelp: true,
                                        valueHelpIconSrc: "sap-icon://attachment",
                                        valueHelpOnly: true,
                                        valueHelpRequest: () => {
                                            oAPP.fn.videoFileSelect();
                                        }
                                    })

                                ]
                            }).bindProperty("visible", "/PRC/VIDEO/RDBIDX", function(iIndex) {

                                if (iIndex !== 1) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setProperty("/SNS/VIDEO/LURL", "");

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

                                ]
                            }).bindProperty("visible", "/PRC/IMAGE/RDBIDX", function(iIndex) {

                                if (iIndex !== 0) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setProperty("/SNS/IMAGE/URL", "");

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

                            }).bindProperty("visible", "/PRC/IMAGE/RDBIDX", function(iIndex) {

                                if (iIndex !== 1) {

                                    // // 입력된 값 초기화
                                    // this.setValue("");

                                    oAPP.setProperty("/SNS/IMAGE/LURL", "");

                                    // Blob 파일 정보를 지운다.
                                    sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/DATA", "");

                                    // 미리보기쪽 이미지를 지운다.
                                    sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", "");

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
                            value: "{TAG}"
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
        reader.onloadend = function() {

            var base64data = reader.result;

            if (typeof fnCallback === "function") {
                fnCallback({
                    base64data: base64data,
                    blob: oImgFileBlob
                });
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

            oAPP.fn.readImageLocalDir(sFilePath, (oResult) => {

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/LURL", sFilePath);

                sap.ui.getCore().getModel().setProperty("/SNS/IMAGE/DATA", oResult.blob);

                sap.ui.getCore().getModel().setProperty("/PREV/IMAGE/URL", oResult.base64data);

                oAPP.setBusy(false);

            });

        });

    }; // end of oAPP.fn.imageFileSelect

    /************************************************************************
     * 테이블에 추가한 해시태그 정보 구하기
     ************************************************************************/
    oAPP.fn.getHashTagList = () => {

        let oHashTable = sap.ui.getCore().byId("hashTable");
        if (!oHashTable) {
            return;
        }

        let oTableModel = oHashTable.getModel();

        return oTableModel.getObject("/SNS/HASHTAG");

    }; // end of oAPP.fn.getHashTagList

    /************************************************************************
     * 게시글 SNS에 전송
     ************************************************************************/
    oAPP.fn.sendPost = () => {

        // 전송할 SNS 선택 구조
        let oChoice = sap.ui.getCore().getModel().getProperty("/PRC/CHOICE");

        // 체크박스가 하나도 선택 되어 있지 않다면 오류 메시지 출력

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

        // SNS 전송할 구조
        let oSns = sap.ui.getCore().getModel().getProperty("/SNS");

        TY_IFDATA.TITLE = oSns.TITLE;
        TY_IFDATA.TYPE = oSns.TYPE;
        TY_IFDATA.DESC = oSns.DESC;
        TY_IFDATA.SAMPLE_URL = oSns.SAMPLE_URL;
        TY_IFDATA.IMAGE.URL = oSns.IMAGE.URL;
        TY_IFDATA.IMAGE.DATA = oSns.IMAGE.DATA;
        TY_IFDATA.VIDEO.URL = oSns.VIDEO.URL;
        TY_IFDATA.VIDEO.FPATH = oSns.VIDEO.LURL;
        TY_IFDATA.HASHTAG = oAPP.fn.getHashTagList() || [];

        oAPP.setBusy(true);

        // SNS 일괄 전송!!
        oAPP.fn.sendSNS(TY_IFDATA, oChoice)
            .then(() => {

                // 오류가 있을 경우 오류에 대한 정보 기록하기
                oAPP.fn.setErrorLog();

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
    oAPP.fn.setErrorLog = () => {

        let oDefMsgPopData = jQuery.extend(true, {}, oAPP.setProperty("/PRC/MSGPOP"));

        let oErrLog = oAPP.errorlog,
            aLog = oErrLog.getLog(),
            iLoglength = aLog.length;

        oDefMsgPopData.MSGCNT = iLoglength;
        oDefMsgPopData.MSGLIST = [];

        if (iLoglength == 0) {
            oAPP.setProperty("/PRC/MSGPOP", oDefMsgPopData);
            return;
        }

        // SNS 전송시 오류가 있었다면 Log 파일 저장
        oErrLog.writeLog(aLog);

        oDefMsgPopData.MSGLIST = aLog;

        oAPP.setProperty("/PRC/MSGPOP", oDefMsgPopData);

    }; // end of oAPP.fn.setErrorLog

    /************************************************************************
     * SNS 일괄 전송
     ************************************************************************/
    oAPP.fn.sendSNS = (TY_IFDATA, oChoiceInfo) => {

        return new Promise((resolve) => {

            // 순서
            // 1. telegram
            // 2. youtube
            // 3. facebook
            // 4. instagram
            // 5. kakao story
            // 6. telegram

            oAPP.setBusyMsg("Youtube 전송중...");

            console.log("Youtube 시작");

            debugger;

            oAPP.youtube.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                oAPP.setBusyMsg("Facebook 전송중...");

                console.log("Youtube 종료");

                console.log("페이스북 시작");

                oAPP.facebook.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                    console.log("페이스북 종료");

                    oAPP.setBusyMsg("Instagram 전송중...");

                    console.log("인스타그램 시작");

                    oAPP.instagram.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                        console.log("인스타그램 종료");

                        oAPP.setBusyMsg("Kakao Story 전송중...");

                        console.log("카카오 시작");

                        oAPP.kakao.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                            console.log("카카오 종료");

                            oAPP.setBusyMsg("telegram 전송중...");

                            console.log("텔레그램 시작");

                            oAPP.telegram.send(TY_IFDATA, oChoiceInfo, (TY_IFDATA) => {

                                console.log("텔레그램 종료");

                                resolve();

                                return;

                            });

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

        let sMsgPopId = "msgpop";

        // 메시지 모델 세팅
        var oMsgPop = sap.ui.getCore().byId(sMsgPopId);
        if (oMsgPop) {

            oMsgPop.open();
            return;

        }

        let aLog = oAPP.errorlog.getLog();

        oAPP.setProperty("/PRC/MSGPOP/MSGLIST", aLog);

        new sap.m.MessagePopover(sMsgPopId, {

            items: {
                path: "/PRC/MSGPOP/MSGLIST",
                template: new sap.m.MessageItem({
                    title: "RTMSG"
                }).bindProperty("type", "RETCD", function(RETCD) {

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

        }).open();

    }; // end of oAPP.fn.openMsgPopover

    /************************************************************************
     * Tray Icon 생성
     ************************************************************************/
    oAPP.fn.createTrayIcon = () => {

        let sTrayIconPath = oAPP.path.join(oAPP.apppath, "img", "logo.png"),
            oTray = oAPP.remote.Tray(sTrayIconPath);

        let aMenu = [{
                key: "exit",
                label: "종료",
                click: oAPP.fn.TrayMenu01
            }

        ];

        let oTrayMenu = oAPP.trayMenu.buildFromTemplate(aMenu);
        oTray.setToolTip("U4A SNS");
        oTray.setContextMenu(oTrayMenu);

    }; // end of oAPP.fn.createTrayIcon

    /************************************************************************
     * Tray Icon의 종료 이벤트
     ************************************************************************/
    oAPP.fn.TrayMenu01 = () => {

        oAPP.remote.app.exit();

    }; // end of oAPP.fn.TrayMenu01

})(oAPP);

document.addEventListener("DOMContentLoaded", () => {

    // 화면 그리기
    oAPP.fn.attachInit();

    // pc 이름을 읽어서 백그라운드 모드로 할지 포그라운드로 할지 분기

    // 컴퓨터 이름을 읽어서 백그라운드 모드일지 아닐지 판단
    // if (process.env.COMPUTERNAME != process.env.SERVER_COMPUTERNAME) {
    //     return;
    // }

    // 백그라운드 일 경우
    // 서버 가동!!
    oAPP.server.serverOn();

    // Tray 아이콘 만들고
    oAPP.fn.createTrayIcon();

});


window.onerror = oAPP.fn.onError;
document.onerror = oAPP.fn.onError;