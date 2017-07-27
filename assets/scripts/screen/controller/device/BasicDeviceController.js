function BasicDeviceController(controller, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isRedirect = true;

    this.pFormIP = "#" + this.elementId + "_formIP";
    this.pLblDeviceTypeNo = "#" + this.elementId + "_lblDeviceTypeNo";
    this.pLblDeviceSerialNo = "#" + this.elementId + "_lblDeviceSerialNo";
    this.pLblDeviceVersion = "#" + this.elementId + "_lblDeviceVersion";
    this.pLblDeviceIP = "#" + this.elementId + "_lblDeviceIP";
    this.pTxtDeviceNewIP = "#" + this.elementId + "_txtDeviceNewIP";
    this.pTxtDeviceNewSubnet = "#" + this.elementId + "_txtDeviceNewSubnet";
    this.pTxtDeviceNewGateway = "#" + this.elementId + "_txtDeviceNewGateway";
    this.pBtnIPSetting = "#" + this.elementId + "_btnIPSetting";

    this.pFormDatetime = "#" + this.elementId + "_formDatetime";
    this.pRabDeviceDateTime1 = this.elementId + "_rabDeviceDateTime1";
    this.pRabDeviceDateTime2 = this.elementId + "_rabDeviceDateTime2";
    this.pRabDeviceDateTime = this.elementId + "_rabDeviceDateTime";
    this.pTxtDeviceDateTime3 = "#" + this.elementId + "_txtDeviceDateTime3";
    this.pTxtDeviceDateTime4 = "#" + this.elementId + "_txtDeviceDateTime4";

    this.pFormLogin = "#" + this.elementId + "_formLogin";
    this.pBtnDateTimeSetting = "#" + this.elementId + "_btnDateTimeSetting";
    this.pTxtDeviceLogoutDateTime = "#" + this.elementId + "_txtDeviceLogoutDateTime";
    this.pTxtDeviceLogintTimes = "#" + this.elementId + "_txtDeviceLogintTimes";
    this.pBtnLoginSetting = "#" + this.elementId + "_btnLoginSetting";

    this.pBtnUpload = "#" + this.elementId + "_btnUpload";
    this.pFileUpload = "#" + this.elementId + "_fileUpload";
    this.pFormUpload = "#" + this.elementId + "_formUpload";
    this.pBtnUpgrade = "#" + this.elementId + "_btnUpgrade";
    this.pErrUpload = "#" + this.elementId + "_errUpload";

    this.PDeviceController = controller;
}

BasicDeviceController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_BASIC), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.init() - Unable to initialize: " + err.message);
    }
}

BasicDeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pFormIP).Validform({
            datatype: {
                "ip": function (gets, obj, curform, regxp) {
                    return Validation.validateIP2(gets);
                },
                "subnet": function (gets, obj, curform, regxp) {
                    return Validation.validateSubnet2(gets);
                }
            },
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.attr("errormsg"));

                    return;
                }
            },
            beforeSubmit: function () {
            }
        });

        $(this.pFormDatetime).Validform({
            datatype: {
                "ip": function (gets, obj, curform, regxp) {
                    return Validation.validateIP2(gets);
                },
            },
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.attr("errormsg"));

                    return false;
                }
            }
        });

        $(".dxinput").on("change", function () {
            if (parent.pRabDeviceDateTime1 == $(this).attr("data-id")) {
                $(parent.pTxtDeviceDateTime3).removeAttr("disabled");
                $(parent.pTxtDeviceDateTime4).attr("disabled", "disabled");
            }
            else {
                $(parent.pTxtDeviceDateTime3).attr("disabled", "disabled");
                $(parent.pTxtDeviceDateTime4).removeAttr("disabled");
            }
        });

        $(this.pTxtDeviceLogoutDateTime).on("keyup", function () {
            $(this).val($(this).val().replace(/\D/g, '0'));
        });

        $(this.pTxtDeviceLogintTimes).on("keyup", function () {
            $(this).val($(this).val().replace(/\D/g, '0'));
        });

        $(this.pTxtDeviceLogoutDateTime).on("change", function () {
            var logoutDatetime = $(this).val();
            if (parseInt(logoutDatetime) < 5 || parseInt(logoutDatetime) > 60) {
                $(parent.pTxtDeviceLogoutDateTime).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("登出时间请确认在5-60分钟");
            }
            else {
                $(parent.pTxtDeviceLogoutDateTime).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pTxtDeviceLogintTimes).on("change", function () {
            var loginTimes = $(this).val();
            if (parseInt(loginTimes) < 5 || parseInt(loginTimes) > 10) {
                $(parent.pTxtDeviceLogintTimes).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("登录次数请确认在5-10次");
                return false;
            }
            else {
                $(parent.pTxtDeviceLogintTimes).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });

        $(this.pBtnIPSetting).on("click", function (event) {
            parent.updateDeviceIP();
            return false;
        });

        $(this.pBtnDateTimeSetting).on("click", function (event) {
            parent.updateDeviceDatetime();
            return false;
        });

        $(this.pBtnLoginSetting).on("click", function (event) {
            parent.updateDeviceLoginInfo();
            return false;
        });

        $(this.pFileUpload).on("change", function () {
            var fileName = $.trim($(this).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1, 3).toLowerCase();
                if (fieExtension == "bin") {
                    $(parent.pErrUpload).html(fileName);
                }
                else {
                    layer.alert("文件格式不对！", {icon: 5});
                    $(parent.pErrUpload).html("文件格式不对");
                }
            }
            else {
                layer.alert("请选择文件！", {icon: 5});
                $(parent.pErrUpload).html("选择上传文件");
            }
        });

        $(this.pBtnUpgrade).on("click", function () {
            var fileName = $.trim($(parent.pFileUpload).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1, 3).toLowerCase();
                if (fieExtension == "bin") {
                    $(parent.pErrUpload).html(fileName);
                    parent.upgradeDevice();
                }
                else {
                    layer.alert("文件格式不对！", {icon: 5});
                    $(parent.pErrUpload).html("文件格式不对");
                }
            }
            else {
                layer.alert("请选择文件！", {icon: 5});
                $(parent.pErrUpload).html("选择上传文件");
            }
            return false;
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

BasicDeviceController.prototype.load = function () {
    try {
        this.getDeviceInfo();
        this.getLoginInfo();
        this.getRemoteNTP()
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.load() - Unable to load: " + err.message);
    }
}

BasicDeviceController.prototype.getDeviceInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_INFO;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.dpiInfo) != null) {
                $(parent.pLblDeviceTypeNo).html(result.dpiInfo.product);
                $(parent.pLblDeviceSerialNo).html(result.dpiInfo.SN);
                $(parent.pLblDeviceVersion).html(result.dpiInfo.version);
                $(parent.pLblDeviceIP).html(result.dpiInfo.ip);
            }
            else {
                layer.alert("获取失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getDeviceInfo() - Unable to get device inforamtion: " + err.message);
    }
}

BasicDeviceController.prototype.getLoginInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_LOGIN_INFO + "?username=admin";
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                $(parent.pTxtDeviceLogoutDateTime).val(result.logoutTime);
                $(parent.pTxtDeviceLogintTimes).val(result.loginAttemptCount);
            }
            else {
                layer.alert("获取失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getLoginInfo() - Unable to get device login setting: " + err.message);
    }
}

BasicDeviceController.prototype.getRemoteNTP = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_NET;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.mode) != "undefined" && typeof (result.serverIp) != "undefined") {
                if (result.mode == 0) {//手动
                    $(parent.pTxtDeviceDateTime3).removeAttr("disabled", "disabled");
                    $(parent.pTxtDeviceDateTime4).attr("disabled", "disabled");
                }
                else {//自动
                    $("#" + parent.pRabDeviceDateTime2).attr("checked", "checked");
                    $(parent.pTxtDeviceDateTime3).attr("disabled", "disabled");
                    $(parent.pTxtDeviceDateTime4).removeAttr("disabled", "disabled");
                }
                $(parent.pTxtDeviceDateTime4).val(result.serverIp);
            }
            else {
                layer.alert("获取失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getLoginInfo() - Unable to get device login setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceIP = function () {
    try {
        var parent = this;
        var ip = $.trim($(this.pTxtDeviceNewIP).val());
        var subnet = $.trim($(this.pTxtDeviceNewSubnet).val());
        var gateway = $.trim($(this.pTxtDeviceNewGateway).val());
        if (!Validation.validateIP2(ip)) {
            layer.alert("请输入有效的IP", {icon: 5});
            return false;
        }
        if (!Validation.validateSubnet2(subnet)) {
            layer.alert("请输入子网掩码,且不能为0.0.0.0", {icon: 5});
            return false;
        }
        if (!Validation.validateIP2(gateway)) {
            layer.alert("请输入有效的网关", {icon: 5});
            return false;
        }
        if (FormatterManager.calculateNetwork(ip, subnet) == ip || FormatterManager.calculateBroadcast(ip, subnet) == ip || $.trim(ip) == "127.0.0.1") {
            layer.alert("IP不能为网关IP或广播IP等非法IP", {icon: 5});
            return false;
        }
        if (FormatterManager.calculateNetwork(ip, subnet) != FormatterManager.calculateNetwork(gateway, subnet)) {
            layer.confirm("IP和网关不在同一网段,是否继续？", {
                btn: ["继续", "取消"]
            }, function () {
                continueUpdateDeviceIP();
            });
        } else {
            continueUpdateDeviceIP();
        }
        function continueUpdateDeviceIP() {
            var link = APPCONFIG["default"].UPDATE_DEVICE_IP + "?Newdpiip=" + ip + "&newdpimask=" + subnet + "&newdpigateway=" + gateway;
            var promise = URLManager.getInstance().ajaxCall(link);
            layer.msg("正在跳转中...", {
                time: 10000,
                shade: [0.5, '#fff']
            }, function () {
                window.location.replace("https://" + ip + "/" + APPCONFIG["default"].LOGIN_URL);
            });
            promise.fail(function (jqXHR, textStatus, err) {
                console.log(textStatus + " - " + err.message);
            });
            promise.done(function (result) {
                if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                    layer.alert("IP设置成功", {icon: 6});
                    k
                }
                else {
                    layer.alert("IP设置失败", {icon: 5});
                }
            });
        }
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceIP() - Unable to update ip setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceDatetime = function () {
    try {
        var parent = this;
        var manualTime = $.trim($(this.pTxtDeviceDateTime3).val());
        var autoIP = $.trim($(this.pTxtDeviceDateTime4).val());
        var syncType = $("input:radio[name='" + this.pRabDeviceDateTime + "']:checked").val();
        var link = APPCONFIG["default"].UPDATE_DEVICE_TIME_MANUAL + "?inputTime=" + manualTime;
        if (syncType == 2) {
            link = APPCONFIG["default"].UPDATE_DEVICE_TIME_AUTO + "?destIp=" + autoIP;
            if (!Validation.validateIP(autoIP)) {
                layer.alert("请输入有效的服务器IP", {icon: 5});
                return false;
            }
            if (autoIP == "0.0.0.0" || autoIP == "255.255.255.255" || ( autoIP >= "224.0.0.0" && autoIP <= "239.255.255.255")) {
                layer.alert("IP地址不能为0.0.0.0或255.255.255.255,且不能为IP多播地址", {icon: 5});
                return false;
            }
        }
        else {
            if (!Validation.validateDateTime(manualTime)) {
                return false;
            }
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                getSysTime();
                layer.alert("时间设置成功", {icon: 6});
            }
            else {
                layer.alert("时间设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceDatetime() - Unable to update datetime setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceLoginInfo = function () {
    try {
        var parent = this;
        var logoutDatetime = $.trim($(this.pTxtDeviceLogoutDateTime).val());
        var loginTimes = $.trim($(this.pTxtDeviceLogintTimes).val());//IP
        var passwordLevel = 2;
        var link = APPCONFIG["default"].UPDATE_DEVICE_LOGIN_SETTING;
        link += "?logoutMinute=" + logoutDatetime;
        link += "&tryLogTimes=" + loginTimes
        link += "&safeLevel=" + passwordLevel;
        if ((parseInt(logoutDatetime) < 5 || parseInt(logoutDatetime) > 60) || (parseInt(loginTimes) < 5 || parseInt(loginTimes) > 10)) {
            layer.alert("登出时间请确认在5-60分钟,登录次数请确认在5-10次否则会导致无法登录", {icon: 5});
            return;
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                AuthManager.getInstance().setSessionTimeMin(logoutDatetime);
                layer.alert("登录安全设置成功", {icon: 6});
            }
            else {
                layer.alert("登录安全设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceLoginInfo() - Unable to update login setting: " + err.message);
    }
}

BasicDeviceController.prototype.gotoPage = function () {
    if (this.isRedirect == true) {
        try {
            var parent = this;
            var link = APPCONFIG["default"].GET_DEVICE_INFO;
            var promise = URLManager.getInstance().ajaxCall(link);
            promise.fail(function (jqXHR, textStatus, err) {
                //从升级文件上传完成计时，超过14分钟提示升级失败
                console.log("升级用时：" + ((new Date().getTime() - parent.upgradeTimeStart) / 1000) + "s");
                if (parent.upgradeTimeStart && (new Date().getTime() - parent.upgradeTimeStart) > 840000) {
                    layer.alert("升级失败", {icon: 5});
                } else {
                    setTimeout(function () {
                        parent.gotoPage();
                    }, 5000);
                }
            });
            promise.done(function (result) {
                window.location.replace(APPCONFIG["default"].LOGIN_URL);
            });
        }
        catch (err) {
            console.error("ERROR - BasicDeviceController.getDeviceInfo() - Unable to get device inforamtion: " + err.message);
        }
    }
}

BasicDeviceController.prototype.upgradeDevice = function () {
    var layerIndex;
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPGRADE_DEVICE;
        layerIndex = layer.msg('<div id="progressbar" style="width:300px; margin-top:5px;"><div class="progress-label" style="line-height: 40px"></div></div>', {
            time: 0,
            shade: [0.5, '#fff']
        });
        var progressbar = $("#progressbar"), progressLabel = $(".progress-label");
        progressbar.progressbar({
            value: 0,
            max: 100,
            min: 0,
            change: function (event, ui) {
                var val = progressbar.progressbar("value");
                if (val < 100) {
                    progressLabel.text("上传进度" + val + "%");
                } else {
                    //预计14min升级完成,模拟进度
                    var val = 0;
                    var s = setInterval(function () {
                        val += 1;
                        if (val >= 100) {
                            val = 99;
                            clearInterval(s);
                        }
                        progressLabel.text("正在升级" + val + "%");
                    }, 8000);
                    progressLabel.text("正在升级0%");
                    parent.upgradeTimeStart = new Date().getTime();
                    setTimeout(function () {
                        parent.gotoPage();
                    }, 600000);
                }
            }
        });
        $(this.pFormUpload).ajaxSubmit({
            type: 'POST',
            url: link,
            beforeSend: function () {
                progressbar.progressbar("value", 0);
            },
            uploadProgress: function (event, position, total, percentComplete) {
                progressbar.progressbar("value", percentComplete);
            },
            complete: function (xhr) {
                progressbar.progressbar("value", 100);
            },
            success: function (result) {
                result = $.parseJSON(result);
                if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                    switch (result.status) {
                        case 0:
                            parent.isRedirect = false;
                            layer.alert("升级失败", {icon: 5});
                            break;
                        default:
                            $(parent.pErrUpload).html("");
                            break;
                    }
                }
                else {
                    parent.isRedirect = false;
                    layer.alert("升级失败", {icon: 5});
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
            }
        });
    }
    catch (err) {
        this.isRedirect = false;
        layer.close(layerIndex);
        console.error("ERROR - BasicDeviceController.upgradeDevice() - Unable to upgrade device: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.BasicDeviceController", BasicDeviceController);

