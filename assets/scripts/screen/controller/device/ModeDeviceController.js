function ModeDeviceController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isRedirect = true;

    this.pLblDeviceTypeNo = "#" + this.elementId + "_lblDeviceTypeNo";
    this.pLblDeviceSerialNo = "#" + this.elementId + "_lblDeviceSerialNo";
    this.pLblDeviceVersion = "#" + this.elementId + "_lblDeviceVersion";

    this.pRabMode = this.elementId + "_rabMode";
    this.pRabMode1 = "#" + this.elementId + "_rabMode1";
    this.pRabMode2 = "#" + this.elementId + "_rabMode2";
    this.pBtnMode = "#" + this.elementId + "_btnMode";
    this.pDivMode = "#" + this.elementId + "_divMode";
    this.ptxtModeIP = "#" + this.elementId + "_txtModeIP";
    this.pRabSelfMode = this.elementId + "_rabSelfMode";
    this.pRabSelfMode1 = "#" + this.elementId + "_rabSelfMode1";
    this.pRabSelfMode2 = "#" + this.elementId + "_rabSelfMode2";
}

ModeDeviceController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_MODE), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - ModeDeviceController.init() - Unable to initialize: " + err.message);
    }
}

ModeDeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pBtnMode).on("click", function () {
            layer.confirm('此功能普通用户请勿操作，若需要进行设备模式切换，请联系匡恩售后人员支持，确定要该操作吗？', {
                btn: ['确定', '取消']
            }, function () {
                parent.changeDeviceMode();
            });
        });

        $("input[name='" + this.pRabMode + "']").on("click", function () {
            if ($(this).val() == "0") {
                $(parent.pDivMode).show();
            }
            else {
                $(parent.pDivMode).hide();
            }
        });

        $("input[name='" + this.pRabSelfMode + "']").on("click", function () {
            if ($(this).val() == "1") {
                $(parent.ptxtModeIP).attr("disabled", "disabled");
            }
            else {
                $(parent.ptxtModeIP).removeAttr("disabled");
            }
        });

    }
    catch (err) {
        console.error("ERROR - ModeDeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

ModeDeviceController.prototype.load = function () {
    try {
        this.getDeviceInfo();
        this.getDeviceMode();
    }
    catch (err) {
        console.error("ERROR - ModeDeviceController.load() - Unable to load: " + err.message);
    }
}

ModeDeviceController.prototype.getDeviceInfo = function () {
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
            }
            else {
                layer.alert("获取失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - ModeDeviceController.getDeviceInfo() - Unable to get device inforamtion: " + err.message);
    }
}

ModeDeviceController.prototype.getDeviceMode = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_MODE;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.curMode) != "undefined") {
                switch (result.curMode) {
                    case 1:
                        $(parent.pRabMode1).attr("checked", "checked");
                        $(parent.pDivMode).hide();
                        break;
                    default:
                        $(parent.pRabMode2).attr("checked", "checked");
                        $(parent.pDivMode).show();
                        switch (result.curDhcp) {
                            case 1:
                                $(parent.pRabSelfMode1).attr("checked", "checked");
                                $(parent.ptxtModeIP).attr("disabled", "disabled");
                                break;
                            default:
                                $(parent.pRabSelfMode2).attr("checked", "checked");
                                $(parent.ptxtModeIP).val(result.curMwIp);
                                $(parent.ptxtModeIP).removeAttr("disabled");
                                break;
                        }
                        break;
                }
            }
            else {
                layer.alert("获取远程登录设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - ModeDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

ModeDeviceController.prototype.changeDeviceMode = function () {
    try {
        var parent = this;
        var mode = $("input:radio[name='" + this.pRabMode + "']:checked").val();
        var link = APPCONFIG["default"].CHANGE_DEVICE_MODE + "?controlMode=" + mode + "&mwip=&dhcp=";
        if (mode == 0) {
            link = APPCONFIG["default"].CHANGE_DEVICE_MODE + "?controlMode=" + mode;
            var isSelf = $("input:radio[name='" + this.pRabSelfMode + "']:checked").val();
            link += "&dhcp=" + isSelf;
            if (isSelf == 1) {
                link += "&mwip=";
            }
            else {
                link += "&mwip=" + $.trim($(this.ptxtModeIP).val());
                if (!Validation.validateIP($.trim($(this.ptxtModeIP).val()))) {
                    layer.alert("请输入有效的IP", {icon: 5});
                    return false;
                }
            }
        }
        var layerIndex = layer.msg("正在切换模式，请稍后...", {
            time: 40000,
            shade: [0.5, '#fff']
        }, function () {
            parent.gotoPage();
        });
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.isRedirect = false;
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result.selfManageInfo) != "undefined" && typeof (result.selfManageInfo) != "undefined" && typeof (result.selfManageInfo.status) != "undefined") {
                switch (result.selfManageInfo.status) {
                    case 1:
                        parent.isRedirect = true;
                        AuthManager.getInstance().setMode(mode);
                        break;
                    default:
                        parent.isRedirect = false;
                        layer.alert("管理模式切换失败", {icon: 5});
                        break;
                }
            }
            else {
                parent.isRedirect = false;
                layer.alert("管理模式切换失败", {icon: 5});
            }
        });
    }
    catch (err) {
        this.isRedirect = false;
        console.error("ERROR - ModeDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

ModeDeviceController.prototype.gotoPage = function () {
    if (this.isRedirect == true) {
        window.location.replace(APPCONFIG["default"].HOMEPAGE_URL);
    }
}

ContentFactory.assignToPackage("kea.base.ModeDeviceController", ModeDeviceController);

