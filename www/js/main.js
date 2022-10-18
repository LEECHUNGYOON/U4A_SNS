let oAPP = parent.oAPP;

((oAPP) => {
    "use strict";


    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(() => {

            oAPP.fn.initModeling();

            oAPP.fn.initRendering();

        });


    }; // end of oAPP.fn.attachInit

    oAPP.fn.initModeling = () => {

        debugger;


        let oModelData = {
                PRC: {
                    RDBTNIDX1 : 0,
                    RDBTNIDX2 : 0,
                },
                SNS: {
                    "TITLE": "자유게시",
                    "TYPE": "ㅁㅁㅁㅁ",
                    "DESC": "ㅇㄴㅁㄹㄴㅇㄹㄴㅇㄹ #ㅁㄴㅇㄻㄴㅇㄹ",
                    "IMAGE": {
                        "URL": "",
                        "DATA": ""
                    },
                    "VIDEO": {
                        "URL": "",
                        "DATA": ""
                    },
                    "HASHTAG": []

                }
            },
            oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData(oModelData);

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {

            sap.ui.getCore().setModel(oJsonModel);
            return;
        }

        oCoreModel.setModel(oJsonModel);

    }; // end of oAPP.fn.initModeling

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

    oAPP.fn.getPageContent = () => {

        let aSNSContent = oAPP.fn.getSnsPageContent();

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

                                        contentRight: [
                                            new sap.m.Button({
                                                text: "Send",
                                                type: sap.m.ButtonType.Emphasized,
                                                press: () => {


                                                }
                                            })
                                        ]

                                    }),
                                    content: aSNSContent
                                }),
                            }),

                            new sap.ui.layout.SplitPane({
                                content: new sap.m.Page({
                                    title: "SNS Preview",
                                    footer: new sap.m.Bar()
                                }),
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


    oAPP.fn.getSnsPageContent = () => {

        let oForm = new sap.ui.layout.form.Form({
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
                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "1. 본문 작성하기"
                        })
                    ]
                }),

                content: [
                    oForm
                ]
            }),

            oForm1 = new sap.ui.layout.form.Form({
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

                                    })

                                ]
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: "FILE Attach"
                                }),
                                fields: [
                                    
                                    new sap.m.Input({
                                        
                                    })

                                ]
                            }),
                        ]
                    })

                ]

            }),

            oPanel2 = new sap.m.Panel({

                headerToolbar: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({
                            text: "2. 첨부하기"
                        }),

                        new sap.m.RadioButtonGroup({
                            columns: 2,
                            selectedIndex:"{/PRC/RDBTNIDX1}",
                            buttons: [
                                new sap.m.RadioButton({
                                    text: "Image",
                                }),
                                new sap.m.RadioButton({
                                    text: "Video",
                                }),
                            ]
                        })     

                    ]
                }),

                content: [

                    oForm1

                ]

            });

        return [

            oPanel1,

            oPanel2

        ];

    }; // end of oAPP.fn.getSnsPageContent

})(oAPP);

document.addEventListener("DOMContentLoaded", () => {

    oAPP.fn.attachInit();

});