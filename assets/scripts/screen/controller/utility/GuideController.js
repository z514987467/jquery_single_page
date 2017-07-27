function GuideController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.step = 1;
    this.displayTextTimer = null;

    this.pBtnPrev = ".btn-guidestyle.btn-g-pre";
    this.pBtnNext = "#" + this.elementId + "_btnNext";
    this.pBtnOver = ".btn-guidestyle.btn-g-over";
    this.pBtnClose = ".btn-g-style.btn-g-close";
    this.pBtnAgain = ".btn-g-style.btn-g-again";
    this.pBtnEvent = ".arrowsbox";

}

GuideController.prototype.init = function (templateId) {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.UTILITY_GUIDE_STEP_START,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP1,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP2,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP3,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP4,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP5,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP6,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP7,
                Constants.TEMPLATES.UTILITY_GUIDE_STEP_END],
            function (templateResults) {
                parent.initShell(templateId);
                $(".firstnav h3").removeClass("on");
                $(".firstnav").removeClass("on");
                $(".secondnav").slideUp(300, function () {
                    $(".arrowsbox.pos-arrows01").css("top", $("ul .firstnav").eq(6).find(".cion-device").offset().top + "px");
                });
            }
        );
    }
    catch (err) {
        console.error("ERROR - GuideController.init() - Unable to initialize all templates: " + err.message);
    }
}

GuideController.prototype.initShell = function (templateId) {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(templateId), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
    }
    catch (err) {
        console.error("ERROR - GuideController.initShell() - Unable to initialize: " + err.message);
    }
}

GuideController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pBtnPrev).on("click", function () {
            parent.step--;
            if (parent.step == 5) {
                parent.step = 4;
                $(".secondnav").slideUp(300);
                $(".firstnav h3").removeClass("on");
                $(".firstnav").removeClass("on");
                View.getInstance().init('DEVICE_LIST', '设备管理');
            }
            parent.initShell(parent.getTemplateId(parent.step));
            parent.redictPage(parent.step);
        });
        $(this.pBtnNext).on("click", function () {
            parent.step++;
            parent.initShell(parent.getTemplateId(parent.step));
            parent.redictPage(parent.step);
        });
        $(this.pBtnClose).on("click", function () {
            parent.step = 1;
            parent.pViewHandle.html("");
            CookieManager.setCookieValue("beginnerGuide", "0", 30);
            parent.redictPage(parent.step);
        });
        $(this.pBtnOver).on("click", function () {
            parent.step = 1;
            parent.pViewHandle.html("");
            CookieManager.setCookieValue("beginnerGuide", "0", 30);
            parent.redictPage(parent.step);
        });
        $(this.pBtnAgain).on("click", function () {
            parent.step = 1;
            parent.initShell(parent.getTemplateId(parent.step));
            CookieManager.setCookieValue("beginnerGuide", "1", 30);
            parent.redictPage(parent.step);
        });
        $(this.pBtnEvent).on("click", function () {
            parent.step++;
            parent.initShell(parent.getTemplateId(parent.step));
            parent.redictPage(parent.step);
        });

        $(document).on("scroll", function () {
            if (parent.step == 1) {
                $(".arrowsbox.pos-arrows01").css("top",$("ul .firstnav").eq(6).find(".cion-device").offset().top+"px");
            }
            else if (parent.step == 2)
            {
                $(".arrowsbox.pos-arrows02").css("top", $("#device_basic_btnIPSetting").offset().top + "px");                
            }
            else if (parent.step == 3) {
                $(".arrowsbox.pos-arrows03").css("top", $("#device_basic_btnDateTimeSetting").offset().top + "px");
            }
            else if (parent.step == 4) {
                $(".arrowsbox.pos-arrows04").css("top", $("ul .firstnav").eq(3).find(".cion-rule").offset().top + "px");
            }
            else if (parent.step == 5) {
                $(".arrowsbox.pos-arrows041").css("top", $("ul .firstnav").eq(3).find("li").eq(0).offset().top + "px");
            }
            $(".btn-guidestyle.btn-g-pre").css("bottom", "90px");
            $(".btn-guidestyle.btn-g-over").css("position","absolute").css("bottom", "20px");
        });
    }
    catch (err) {
        console.error("ERROR - GuideController.initControls() - Unable to initialize control: " + err.message);
    }
}

GuideController.prototype.redictPage = function (step) {
    try {
        var parent = this;
        switch (step) {
            case 1:
                if (parent.displayTextTimer != null) {
                    clearInterval(parent.displayTextTimer);
                }
                $(".secondnav").slideUp(300);
                $(".firstnav").removeClass("on");
                $(".firstnav h3").removeClass("on");
                //$(".arrowsbox.pos-arrows01").css("top", $("ul .firstnav").eq(6).find(".cion-device").offset().top + "px");
                View.getInstance().init('HOME_DASHBOARD', '首页');
                break;
            case 2:
                $(".arrowsbox.pos-arrows02").css("display", "none");
                View.getInstance().init('DEVICE_LIST', '设备管理');
                clearInterval(parent.displayTextTimer)
                var tmpTimer = setInterval(function () {
                    var divIP = $("#device_basic_formIP>div");
                    if (divIP.length > 2) {
                        //取消原有事件按钮
                        $("#viewContainer").find("button").unbind("click");
                        $("#viewContainer").find("button").on("click", function () {                            
                            return false;
                        });
                        $("#viewContainer .tabtitle>ul>li").unbind("click");
                        $("#viewContainer .tabtitle>ul>li").on("click", function () {                            
                            return false;
                        });
                        clearInterval(tmpTimer);
                        $("#device_basic_formDatetime>div").eq(1).removeClass("highlight-border");
                        $("#device_basic_formIP>div").eq(1).addClass("highlight-border");
                        parent.displayTextTimer = setInterval(function () {
                            $("#device_basic_formIP>div").eq(1).toggleClass("highlight-border");
                        }, 500);
                        $("#device_basic_formIP>div>input[type='text']").eq(0).typetype('192.168.1.100', {
                            e: 0.04,
                            t: 100,
                            callback: function () {
                                $("#device_basic_formIP>div>input[type='text']").eq(1).typetype('255.255.255.0', {
                                    e: 0.04,
                                    t: 100,
                                    callback: function () {
                                        $("#device_basic_formIP>div>input[type='text']").eq(2).typetype('192.168.1.1', {
                                            e: 0.04,
                                            t: 100,
                                            callback: function () {
                                                $(".arrowsbox.pos-arrows02").show();
                                                $(".arrowsbox.pos-arrows02").css("top", $("#device_basic_btnIPSetting").offset().top + "px");
                                                clearInterval(parent.displayTextTimer);
                                                $("#device_basic_formIP>div").eq(1).removeClass("highlight-border");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }, 500);
                break;
            case 3:
                clearInterval(parent.displayTextTimer);
                $(".arrowsbox.pos-arrows03").css("display", "none");
                var tmpTimer = setInterval(function () {
                    var divIP = $("#device_basic_formDatetime>div");
                    if (divIP.length > 1) {
                        $("#viewContainer").find("button").unbind("click");
                        $("#viewContainer").find("button").on("click", function () {
                            
                            return false;
                        });
                        $("#viewContainer .tabtitle>ul>li").unbind("click");
                        $("#viewContainer .tabtitle>ul>li").on("click", function () {
                            
                            return false;
                        });
                        clearInterval(tmpTimer);
                        $("#device_basic_formIP>div").eq(1).removeClass("highlight-border");
                        $("#device_basic_formDatetime>div").eq(1).addClass("highlight-border");
                        parent.displayTextTimer = setInterval(function () {
                            $("#device_basic_formDatetime>div").eq(1).toggleClass("highlight-border");
                        }, 500);
                        var now = new Date($(".systemtime>p").text().replace(/-/g, '/'));
                        $("#device_basic_formDatetime>div>input[type='text']").eq(0).typetype(FormatterManager.formatDateFromLocale(now, "yyyy-MM-dd HH:mm:ss"), {
                            e: 0.04,
                            t: 100,
                            callback: function () {
                                $("#device_basic_formDatetime>div").eq(1).removeClass("highlight-border");
                                $(".arrowsbox.pos-arrows03").show();
                                $(".arrowsbox.pos-arrows03").css("top", $("#device_basic_btnDateTimeSetting").offset().top + "px");
                                clearInterval(parent.displayTextTimer);
                            }
                        });
                    }
                }, 500);
                break;
            case 4:
                $(".arrowsbox.pos-arrows04").css("top", $("ul .firstnav").eq(3).find(".cion-rule").offset().top + "px");
                break;
            case 5:
                $(".firstnav").eq(4).find(".secondnav").slideDown(300);
                $(".firstnav").eq(4).addClass("on");
                $(".arrowsbox.pos-arrows04").removeClass("pos-arrows04");
                $(".arrowsbox").addClass("pos-arrows041");
                $(".arrowsbox.pos-arrows041").css("top", $("ul .firstnav").eq(3).find("li").eq(0).offset().top + "px");
                break;
            case 6:
                View.getInstance().init('RULE_WHITELIST', '白名单');
                $(".arrowsbox.pos-arrows05").css("display", "none");
                clearInterval(parent.displayTextTimer)
                var tmpTimer = setInterval(function () {
                    var div = $("#whitelist_tdWhitelistList");
                    if (div.length > 0) {
                        //取消原有事件按钮
                        $("#viewContainer").find("button").unbind("click");
                        $("#viewContainer").find("button").on("click", function () {                            
                            return false;
                        });
                        clearInterval(tmpTimer);
                        $("#whitelist_txtStartDateTime").parent().parent().addClass("highlight-border");
                        parent.displayTextTimer = setInterval(function () {
                            $("#whitelist_txtStartDateTime").parent().parent().toggleClass("highlight-border");
                        }, 500);
                        var now = new Date($(".systemtime>p").text().replace(/-/g, '/'));
                        now.setSeconds(now.getSeconds() - 280);
                        var myDate = FormatterManager.formatDateFromLocale(now,"yyyy-MM-dd HH:mm:ss");
                        $("#whitelist_txtStartDateTime").typetype(myDate, {
                            e: 0.04,
                            t: 100,
                            callback: function () {
                                clearInterval(parent.displayTextTimer);
                                $(".arrowsbox.pos-arrows05").show();
                                $(".arrowsbox.pos-arrows05").css("top", $("#whitelist_btnStudy").offset().top + "px");
                                $("#whitelist_txtStartDateTime").parent().parent().removeClass("highlight-border");
                            }
                        });
                    }
                });
                break;
            case 7:
                View.getInstance().controller.getStudyStatus();
                $(".arrowsbox.pos-arrows06").css("left", ($("#whitelist_chkAll").offset().left + 10) + "px");
                $(".arrowsbox.pos-arrows06").css("top", $("#whitelist_chkAll").offset().top + "px");
            case 8:
                $(".arrowsbox.pos-arrows07").css("left", ($("#whitelist_btnEnable").offset().left + 10) + "px");
                $(".arrowsbox.pos-arrows07").css("top", $("#whitelist_btnEnable").offset().top + "px");
            case 9:
                $(".arrowsbox.pos-arrows08").css("top", $("ul .firstnav").eq(5).find(".cion-nettopo").offset().top + "px");
                break;
            case 10:
                View.getInstance().init('NETTOPO_LIST', '网络拓扑');
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - GuideController.getTemplateId() - Unable to get template id for guide: " + err.message);
    }
}

GuideController.prototype.getTemplateId = function (step) {
    try {
        switch (step) {
            case 1:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP_START;
            case 2:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP1;
            case 3:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP2;
            case 4:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP3;
            case 5:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP3;
            case 6:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP4;
            case 7:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP5;
            case 8:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP6;
            case 9:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP7;
            default:
                return Constants.TEMPLATES.UTILITY_GUIDE_STEP_END;
        }
    }
    catch (err) {
        console.error("ERROR - GuideController.getTemplateId() - Unable to get template id for guide: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.utility.GuideController", GuideController);