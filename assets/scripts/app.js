//app.js, the entry point of the whole project
$(function () {
    try {
        LocalStorageManager.getInstance().init();
        AuthManager.getInstance().init();
        ScriptLoader.getInstance().includeModule("core", function (done) {
            URLManager.getInstance().init();
            TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.UTILITY_ERROR,
                    Constants.TEMPLATES.UTILITY_PAGER1,
                    Constants.TEMPLATES.UTILITY_PAGER2],
                function (templateResults) {
                    var locale = CookieManager.getCookieValue("AgentLanguage");
                    locale = (locale == null || locale == "" || locale == "null") ? APPCONFIG.DEFAULT_LOCALE : locale;
                    //delete beginnerGuide
                    // var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
                    // if (beginnerGuide == null || beginnerGuide == "" || beginnerGuide == "null") {
                    //     CookieManager.setCookieValue("beginnerGuide", "1", 30);
                    // }
                    $("body").css({"display": "", "visibility": "visible"})
                    renderUI();
                    return;
                    AuthManager.getInstance().isLoggedIn(function () {
                        $("body").css({"display": "", "visibility": "visible"})
                        new kea.base.utility.SessionTimeoutController().init();
                        getDeiveMode();
                        renderUI();
                    }, function () {
                        AuthManager.getInstance().logOut();
                    });
                });
        });
    }
    catch (err) {
        console.error("ERROR - App.js document.ready() - Can not initialize KEA-C200: " + err.message);
    }
});

$(window).resize(function () {
    try {
    }
    catch (err) {
        console.error("ERROR - App.js window.resize() - Can not render UI: " + err.message);
    }
});

function renderUI() {
    try {
        //menu
        $(".Nav .firstnav h3").click(function () {
            $(".firstnav h3").removeClass("on");
            $(this).addClass("on");
            if ($(this).parent(".firstnav").hasClass("on")) {
                $(this).next(".secondnav").slideUp(300, function () {
                    $(this).parent(".firstnav").removeClass("on");
                });
            } else {
                $(this).next(".secondnav").slideDown(300, function () {
                    $(this).parent(".firstnav").addClass("on");
                });
            }
        });
        $(".secondnav>ul>li>a").click(function () {
            $(".secondnav>ul>li>a").removeClass("on");
            $(this).addClass("on");
        });
        //display user name
        $("#main_lblUserName").text(AuthManager.getInstance().getUserName());
        //bind event for exiting system
        $(".cion_exit").on("click", function () {
            AuthManager.getInstance().logOut();
        });

        if (AuthManager.getInstance().getMode() == 1) {
            //guide
            // $(".guide>div>p>a").on("click", function () {
            //     CookieManager.setCookieValue("beginnerGuide", "1", 30);
            //     View.getInstance().init("HOME_DASHBOARD", "首页");
            //     new GuideController($("#guideContainer"), "guide_step1").init(Constants.TEMPLATES.UTILITY_GUIDE_STEP_START);
            // });
            View.getInstance().init("HOME_DASHBOARD", "首页");
            // var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
            // if (beginnerGuide == "1") {
            //     new GuideController($("#guideContainer"), "guide_step1").init(Constants.TEMPLATES.UTILITY_GUIDE_STEP_START);
            // }
            $(".firstnav>li:not(#nav_interface_setting)").each(function (index, item) {
                $(this).css("visibility", "visible");
                $(this).css("display", "");
            });
            getDeiveRunMode();
            // $(".guide").css("visibility", "visible");
            // $(".guide").css("display", "");
        }
        else {
            $(".guide").css("visibility", "hidden");
            $(".guide").css("display", "none");
            $(".firstnav>li").each(function (index, item) {
                if (index == 4) {
                    $(this).css("display", "");
                    $(this).css("visibility", "visible");
                    $(this).find("h3").addClass("on");
                }
            });
            View.getInstance().init("DEVICE_LIST", "设备管理");
        }
        //call controller to load main page
        //bind event for exiting system
        getSysTime();
    }
    catch (err) {
        console.error("ERROR - App.js renderUI() - Can not render UI: " + err.message);
    }
}

var sysTimer;
function getSysTime() {
    clearInterval(sysTimer);
    var link = APPCONFIG["default"].GET_SYS_TIME;
    var promise = URLManager.getInstance().ajaxCall(link);
    promise.fail(function (jqXHR, textStatus, err) {
        console.log(textStatus + " - " + err.message);
        displaySysTime(new Date());
    });
    promise.done(function (result) {
        if (typeof (result) != "undefined") {
            var myDate = new Date(result.systime.replace(/-/g, '/'));
            displaySysTime(myDate);
        }
    });
}

function displaySysTime(systime) {
    systime.setSeconds(systime.getSeconds() + 1);
    var year = systime.getFullYear();
    var month = systime.getMonth() + 1;
    var date = systime.getDate();
    var hours = systime.getHours();
    var minutes = systime.getMinutes();
    var seconds = systime.getSeconds();
    //月份的显示为两位数字如09月  
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    //时间拼接  
    var displayTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    $(".systemtime>p").text(displayTime);
    sysTimer = setInterval(function () {
        var myDate = new Date($(".systemtime>p").text().replace(/-/g, '/'));
        myDate.setSeconds(myDate.getSeconds() + 1);
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1;
        var date = myDate.getDate();
        var hours = myDate.getHours();
        var minutes = myDate.getMinutes();
        var seconds = myDate.getSeconds();
        //月份的显示为两位数字如09月  
        if (month < 10) {
            month = "0" + month;
        }
        if (date < 10) {
            date = "0" + date;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        //时间拼接  
        var displayTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        $(".systemtime>p").text(displayTime);
    }, 1000);
}
//add by zhangmingzheng
function getDeiveRunMode() {
    var link = APPCONFIG["default"].GET_DEVICE_RUN_MODE;
    var promise = URLManager.getInstance().ajaxCall(link);
    promise.fail(function (jqXHR, textStatus, err) {
        console.log(textStatus + " - " + err.message);
    });
    promise.done(function (result) {
        if (typeof (result) != "undefined" && typeof (result.mode) != "undefined" && result.mode == "routing") {
            $("#nav_interface_setting").css({"visibility": "visible", "display": ""});
        }
        //test
        //$("#nav_interface_setting").css({"visibility": "visible", "display": ""});
    });
}

function getDeiveMode() {
    var link = APPCONFIG["default"].GET_DEVICE_MODE;
    var promise = URLManager.getInstance().ajaxCallByURL(link, 'GET', '', false);
    promise.fail(function (jqXHR, textStatus, err) {
        console.log(textStatus + " - " + err.message);
    });
    promise.done(function (result) {
        if (typeof (result) != "undefined" && typeof (result.curMode) != "undefined") {
            AuthManager.getInstance().setMode(result.curMode);
        }
        else {
            layer.alert("获取远程登录设置失败", {icon: 5});
        }
    });
}