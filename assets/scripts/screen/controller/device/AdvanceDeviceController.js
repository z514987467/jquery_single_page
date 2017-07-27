function AdvanceDeviceController(controller, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isRedirect = true;
    this.isRebootSuccess = true;
    this.isResetSuccess = true;

    this.pBtnRebootDevice = "#" + this.elementId + "_btnRebootDevice";
    this.pBtnShutdownDevice = "#" + this.elementId + "_btnShutdownDevice";
    this.pBtnResetDevice = "#" + this.elementId + "_btnResetDevice";
    this.pRabRemoteIP = this.elementId + "_rabRemoteIP";
    this.pRabRemoteIP1 = "#" + this.elementId + "_rabRemoteIP1";
    this.pRabRemoteIP2 = "#" + this.elementId + "_rabRemoteIP2";
    this.pBtnRemote = "#" + this.elementId + "_btnRemote";

    this.pFormSyslogRemote = "#" + this.elementId + "_formSyslogRemote";
    this.pBtnSyslogRemoteChange = "#" + this.elementId + "_btnSyslogRemoteChange";
    this.pRabSyslogRemote = this.elementId + "_rabSyslogRemote";
    this.pRabSyslogRemote1 = "#" + this.elementId + "_rabSyslogRemote1";
    this.pRabSyslogRemote2 = "#" + this.elementId + "_rabSyslogRemote2";
    this.pDivSyslogRemote = "#" + this.elementId + "_divSyslogRemote";
    this.pTxtSyslogRemoteIP = "#" + this.elementId + "_txtSyslogRemoteIP";
    this.pDdlSyslogRemoteProtocol = "#" + this.elementId + "_ddlSyslogRemoteProtocol";
    this.pTxtSyslogRemotePort = "#" + this.elementId + "_txtSyslogRemotePort";
    this.pBtnAddSyslogRemote = "#" + this.elementId + "_btnAddSyslogRemote";
    this.pTdSyslogRemoteList = "#" + this.elementId + "_tdSyslogRemoteList";

    this.pRunMode = this.elementId + "_runMode";
    this.pRouteMode = "#" + this.elementId + "_routeMode";
    this.pTransParentMode = "#" + this.elementId + "_transparentMode";
    this.pBtnRunMode = "#" + this.elementId + "_btnRunMode";

    this.pRabMode = this.elementId + "_rabMode";
    this.pRabMode1 = "#" + this.elementId + "_rabMode1";
    this.pRabMode2 = "#" + this.elementId + "_rabMode2";
    this.pBtnMode = "#" + this.elementId + "_btnMode";
    this.pDivMode = "#" + this.elementId + "_divMode";
    this.ptxtModeIP = "#" + this.elementId + "_txtModeIP";
    this.pRabSelfMode = this.elementId + "_rabSelfMode";
    this.pRabSelfMode1 = "#" + this.elementId + "_rabSelfMode1";
    this.pRabSelfMode2 = "#" + this.elementId + "_rabSelfMode2";

    this.pDivRemoteIP = "#" + this.elementId + "_divRemoteIP";
    this.pTdRemoteIPList = "#" + this.elementId + "_tdRemoteIPList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalRemoteIP = "#" + this.elementId + "_lblTotalRemoteIP";
    this.pTxtRemoteIP = "#" + this.elementId + "_txtRemoteIP";
    this.pBtnAddRemoteIP = "#" + this.elementId + "_btnAddRemoteIP";

    this.pRemoteIPPager = null;
    this.pDeviceController = controller;
}

AdvanceDeviceController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_ADVANCE), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.init() - Unable to initialize: " + err.message);
    }
}

AdvanceDeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        $(this.pFormSyslogRemote).Validform({
            datatype: {
                "ip": function (gets, obj, curform, regxp) {
                    return Validation.validateIP(gets);
                },
                "port": function (gets, obj, curform, regxp) {
                    return Validation.validatePort(gets);
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

        $(this.pBtnSyslogRemoteChange).on("click", function () {
            parent.switchDeviceSyslogRemote();
        })

        $(this.pBtnRunMode).on("click", function () {
            var flag = $("input:radio[name='" + parent.pRunMode + "']:checked").val();
            if (flag == "0") {
				layer.confirm('是否确认切换到路由保护模式？', {
                    btn: ['确定', '取消']
                }, function () {
                    parent.switchpRouteMode();
                });
            } else {
				layer.confirm('系统配置将更改，是否确认切换到智能保护模式？', {
                    btn: ['确定', '取消']
                }, function () {
                    parent.switchpRouteMode();
                });
            }
        })
        //add by zhangmingzheng
        $(this.pBtnAddSyslogRemote).on("click", function (event) {
            parent.addDeviceSyslogRemote();
            return false;
        });

        $(this.pBtnRebootDevice).on("click", function (event) {
            parent.rebootDevice();
        });

        $(this.pBtnResetDevice).on("click", function () {
            parent.resetDevice();
        });

        $(this.pBtnMode).on("click", function () {
            layer.confirm('此功能普通用户请勿操作，若需要进行设备模式切换，请联系匡恩售后人员支持，确定要该操作吗？', {
                btn: ['确定', '取消']
            }, function () {
                parent.changeDeviceMode();
            });
        });

        $("input[name='" + this.pRabRemoteIP + "']").on("click", function () {
            parent.updateDeviceRemote();
        });

        //add by zhangmingzheng
        $("input[name='" + this.pRabSyslogRemote + "']").on("click", function () {
            parent.changeDeviceSyslogRemote();
        })


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

        $(this.pBtnAddRemoteIP).on("click", function () {
            parent.addRemoteIP();
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

AdvanceDeviceController.prototype.load = function () {
    try {
        this.getDeviceRemote();
        this.getDeviceMode();
        this.getDeviceSyslogRemoteStatus();
        this.getRunningModeStatus();
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.load() - Unable to load: " + err.message);
    }
}

AdvanceDeviceController.prototype.getDeviceRemote = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_REMOTE;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.isRemoteCtl) != "undefined") {
                switch (result.isRemoteCtl) {
                    case 1:
                        $(parent.pRabRemoteIP1).attr("checked", "checked");
                        $(parent.pTxtRemoteIP).val(result.ipInfo);
                        $(parent.pDivRemoteIP).show();
                        break;
                    default:
                        $(parent.pRabRemoteIP2).attr("checked", "checked");
                        $(parent.pDivRemoteIP).hide();
                        break;
                }
            }
            else {
                layer.alert("获取远程登录IP控制状态失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.getDeviceMode = function () {
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
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}
/*begin add by wangxin*/
AdvanceDeviceController.prototype.loadpRouteMode = function () {
    try {
        var parent = this;
        var flag1 = $("input:radio[name='" + this.pRunMode + "']:checked").val();

        var link = APPCONFIG["default"].GET_CHANGE_RUN_MODEIRES + "?controlRunmode=" + flag1;
        var promise = URLManager.getInstance().ajaxCall(link);
        var layerIndex = layer.msg("正在切换，请稍后...", {
            time: 20000,
            shade: [0.5, '#fff']
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);

            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result.RunModeInfo) != "undefined" && typeof (result.RunModeInfo.status) != "undefined") {

                setTimeout(function () {

                    switch (result.RunModeInfo.status) {
                        case 1:
                            layer.alert("运行模式切换成功", {icon: 6});
                            //window.location.reload();
                            window.location.href("login.html");
                            break;
                        case 2:
                            layer.alert("切换模式为当前模式", {icon: 5});
                            break;
                        case 0:
                            layer.alert("运行模式切换失败", {icon: 5});
                            break;
                    }

                }, 1000)


            }
            else {

                layer.alert("运行模式切换失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.loadpRouteMode() - Unable to update the device routemode remote server status: " + err.message);
    }
}

AdvanceDeviceController.prototype.switchpRouteMode = function () {
    console.log("switchpRouteMode");
    try {
        var parent = this;
        var flag = $("input:radio[name='" + this.pRunMode + "']:checked").val();

        var link = APPCONFIG["default"].GET_CHANGE_RUN_MODEIRES + "?controlRunmode=" + flag;
        var promise = URLManager.getInstance().ajaxCall(link);
        var layerIndex = layer.msg('<div id="progressbar" style="width:300px; margin-top:5px;"><div class="progress-label" style="line-height: 40px"></div></div>', {
            time: 0,
            shade: [0.5, '#fff']
        });
        var progressbar = $("#progressbar"), progressLabel = $(".progress-label");
        progressbar.progressbar({
            value: 0, max: 100, min: 0,
            change: function (event, ui) {
                var val = progressbar.progressbar("value");
                if (val < 100) {
                    progressLabel.text("配置进度" + val + "%");
                } else {
                    window.location.replace(APPCONFIG["default"].LOGIN_URL);
                }
            }
        });

        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result.RunModeInfo) != "undefined" && typeof (result.RunModeInfo.status) != "undefined") {
                switch (result.RunModeInfo.status) {
                    case 1:
                        var percent = 0;
                        setInterval(function () {
                            percent += 1;
                            progressbar.progressbar("value", percent);
                        }, 1000);
                        break;
                    case 2:
                        layer.alert("切换模式为当前模式", {icon: 5});
                        break;
                    case 3:
                        layer.alert("设备不支持该模式", {icon: 5});
                        break;
                    case 0:
                        layer.alert("运行模式切换失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("运行模式切换失败", {icon: 5});
            }
        });
    }
    catch (err) {
        this.isrunmode = false;
        console.error("ERROR - AdvanceDeviceController.switchpRouteMode() - Unable to update the device routemode remote server status: " + err.message);
    }
}

AdvanceDeviceController.prototype.getRunningModeStatus = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_CURRUN_MODE;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.RunModeNum) != "undefined") {
                switch (result.RunModeNum) {
                    case 0:
                        $(parent.pRouteMode).attr("checked", "checked");
                        break;
                    case 1:
                        $(parent.pTransParentMode).attr("checked", "checked");
                        break;
                    default:
                        break;
                }
            }
            else {
                layer.alert("运行模式设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getRunningModeStatus() - Unable to get the device routemode remote server status: " + err.message);
    }
}
/*begin add by zhangmingzheng*/
AdvanceDeviceController.prototype.getDeviceSyslogRemoteStatus = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_SYSLOG_REMOTE;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.syslogswitch) != "undefined") {
                switch (result.syslogswitch) {
                    case 0:
                        $(parent.pRabSyslogRemote2).attr("checked", "checked");
                        $(parent.pDivSyslogRemote).hide();
                        break;
                    default:
                        $(parent.pRabSyslogRemote1).attr("checked", "checked");
                        $(parent.pDivSyslogRemote).show();
                        parent.getDeviceSyslogRemoteList();
                        break;
                }
            }
            else {
                layer.alert("获取远程登录设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceSyslogRemoteStatus() - Unable to get the device syslog remote server status: " + err.message);
    }
}

AdvanceDeviceController.prototype.getDeviceSyslogRemoteList = function () {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:22%;">服务器IP</td>';
    html += '<td class="address" style="width:13%;">协议</td>';
    html += '<td class="address" style="width:22%;">端口</td>';
    html += '<td class="address">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_DEVICE_SYSLOG_REMOTE_LIST;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";
            $(parent.pTdSyslogRemoteList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.syslogdata) != "undefined") {
                if (result.syslogdata.length > 0) {
                    for (var i = 0; i < result.syslogdata.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:22%;'>" + result.syslogdata[i].syslogip + "</td>";
                        html += "<td style='width:13%;'>" + result.syslogdata[i].protocol + "</td>";
                        html += "<td style='width:22%;'>" + result.syslogdata[i].port + "</td>";
                        html += "<td><button class='button button_delete' onclick=\"View.getInstance().controller.pAdvanceDeviceController.deleteDeviceSyslogRemote('" + result.syslogdata[i].syslogip + "','" + result.syslogdata[i].protocol + "','" + result.syslogdata[i].port + "')\" >删除</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='4'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='4'>暂无数据</td></tr>";
            }
            $(parent.pTdSyslogRemoteList).html(html);
            layer.close(loadIndex);
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";
        $(this.pTdLogList).html(html);
        console.error("ERROR - LoginLogController.selectLogs() - Unable to get all events: " + err.message);
    }
}

AdvanceDeviceController.prototype.changeDeviceSyslogRemote = function () {
    try {
        var parent = this;
        var remoteStaus = $("input:radio[name='" + this.pRabSyslogRemote + "']:checked").val();
        if (remoteStaus == 1) {
            $(parent.pDivSyslogRemote).show();
            this.getDeviceSyslogRemoteList();
        }
        else {
            $(parent.pDivSyslogRemote).hide();
        }
    } catch (err) {
        console.error("ERROR - AdvanceDeviceController.changeDeviceSyslogRemote() - Change syslog remote server status: " + err.message);
    }
}

AdvanceDeviceController.prototype.switchDeviceSyslogRemote = function () {
    try {
        var parent = this;
        //var loadIndex = layer.load(2);
        var flag = $("input:radio[name='" + this.pRabSyslogRemote + "']:checked").val();
        var link = APPCONFIG["default"].CHANGE_DEVICE_SYSLOG_REMOTE + "?syslogremoteflag=" + flag;
        var promise = URLManager.getInstance().ajaxCall(link);
        var layerIndex = layer.msg("正在切换，请稍后...", {
            time: 20000,
            shade: [0.5, '#fff']
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0:
                        layer.alert("Syslog远程服务模式切换失败", {icon: 5});
                        break;
                    case 1:
                        layer.alert("Syslog远程服务模式切换成功", {icon: 6});
                        break;
                }
            }
            else {
                layer.alert("Syslog远程服务模式切换失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.updateSyslogRemote() - Unable to update the device syslog remote server status: " + err.message);
    }
}

AdvanceDeviceController.prototype.addDeviceSyslogRemote = function () {
    try {
        var parent = this;
        var ip = $.trim($(this.pTxtSyslogRemoteIP).val());
        var protocol = $.trim($(this.pDdlSyslogRemoteProtocol).val());
        var port = $.trim($(this.pTxtSyslogRemotePort).val());
        if (!Validation.validateIP(ip) || !protocol || !Validation.validatePort(port)) {
            layer.alert("请输入有效的IP、协议和端口", {icon: 5});
            return false;
        }
        var link = APPCONFIG["default"].ADD_DEVICE_SYSLOG_REMOTE;
        var data = JSON.stringify({
            "syslogip": ip,
            "protocol": protocol,
            "port": port
        });
        var promise = URLManager.getInstance().ajaxCall(link, data, "POST");
        layer.msg("正在处理中...", {
            time: 10000,
            shade: [0.5, '#fff']
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("Syslog远程服务添加失败", {icon: 5});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null) {
                switch (result.status) {
                    case 0:
                        layer.alert("Syslog远程服务添加失败", {icon: 5});
                        break;
                    case 1:
                        layer.alert("Syslog远程服务添加成功", {icon: 6});
                        parent.getDeviceSyslogRemoteList();
                        break;
                    case 2:
                        layer.alert("Syslog远程服务器配置已超过3个,无法添加", {icon: 5});
                        break;
                    default:
                        layer.alert("Syslog远程服务器配置已存在，无法添加", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("Syslog远程服务添加失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.addDeviceSyslogRemote() - Unable to add device syslog remote server: " + err.message);
    }
}

AdvanceDeviceController.prototype.deleteDeviceSyslogRemote = function (ip, protocol, port) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_DEVICE_SYSLOG_REMOTE;
        var data = JSON.stringify({"syslogip": ip, "protocol": protocol, "port": port});
        var promise = URLManager.getInstance().ajaxCall(link, data, "POST");
        layer.msg("正在处理中...", {
            time: 10000,
            shade: [0.5, '#fff']
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("Syslog远程服务删除失败", {icon: 5});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null) {
                layer.alert("Syslog远程服务删除成功", {icon: 6});
                parent.getDeviceSyslogRemoteList();
            }
            else {
                layer.alert("Syslog远程服务删除失败", {icon: 5});
            }
        });
    } catch (err) {
        console.error("ERROR - AdvanceDeviceController.deleteDeviceSyslogRemote() - Unable to delete device syslog remote server: " + err.message);
    }
}
/*end add by zhangmingzheng*/
AdvanceDeviceController.prototype.rebootDevice = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].REBOOT_DEVICE;
        var layerIndex = layer.msg("正在重启，请稍后登录...", {
            time: 60000,
            shade: [0.5, '#fff']
        }, function () {
            if (parent.isRebootSuccess == true) {
                window.location.replace(APPCONFIG["default"].LOGIN_URL);
            }
        });
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.isRebootSuccess = false;
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.isRebootSuccess = true;
                        break;
                    default:
                        parent.isRebootSuccess = false;
                        layer.alert("重启失败", {icon: 5});
                        break;
                }
            }
            else {
                parent.isRebootSuccess = false;
                layer.alert("重启失败", {icon: 5});
            }
        });
    }
    catch (err) {
        this.isRebootSuccess = false;
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.resetDevice = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].RESET_DEVICE;
        var layerIndex = layer.msg("正在恢复出厂设置，请稍后登录...", {
            time: 60000,
            shade: [0.5, '#fff']
        }, function () {
            if (parent.isResetSuccess == true) {
                window.location.replace(APPCONFIG["default"].LOGIN_URL);
            }
        });
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.isResetSuccess = false;
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.isResetSuccess = true;
                        break;
                    default:
                        parent.isResetSuccess = false;
                        layer.alert("恢复出厂设置失败", {icon: 5});
                        break;
                }
            }
            else {
                parent.isResetSuccess = false;
                layer.alert("恢复出厂设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        this.isResetSuccess = false;
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.updateDeviceRemote = function () {
    try {
        var parent = this;
        var remoteStaus = $("input:radio[name='" + this.pRabRemoteIP + "']:checked").val();
        var link = APPCONFIG["default"].UPDATE_DEVICE_REMOTE + "?flag=" + remoteStaus;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        if (remoteStaus == 1) {
                            parent.selectRemoteIPs(1, true);
                            $(parent.pDivRemoteIP).show();
                        }
                        else {
                            $(parent.pDivRemoteIP).hide();
                        }
                        break;
                    default:
                        parent.getDeviceRemote();
                        break;
                }
            }
            else {
                layer.alert("更新远程登录设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.changeDeviceMode = function () {
    try {
        var parent = this;
        //var loadIndex = layer.load(2);
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
        var promise = URLManager.getInstance().ajaxCall(link);
        var layerIndex = layer.msg("正在切换模式，请稍后...", {
            time: 30000,
            shade: [0.5, '#fff']
        }, function () {
            parent.gotoPage();
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.isRedirect = false;
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result.selfManageInfo) != "undefined" && typeof(result.selfManageInfo) != "undefined" && typeof (result.selfManageInfo.status) != "undefined") {
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
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.addRemoteIP = function () {
    try {
        var parent = this;
        var ip = $.trim($(this.pTxtRemoteIP).val());
        if (!Validation.validateComplexIP(ip)) {
            layer.alert("请输入正确有效的IP", {icon: 5});
            return false;
        }
        layer.confirm("请确认已经加入本机IP到远程访问列表", {
            title: "提示",
            btn: ["确定", "取消"],
            btn1: function (index, layero) {
                var link = APPCONFIG["default"].ADD_DEVICE_REMOTE_IP + "?accessIp=" + ip;
                var promise = URLManager.getInstance().ajaxCall(link);
                promise.fail(function (jqXHR, textStatus, err) {
                    console.log(textStatus + " - " + err.message);
                    layer.alert("系统服务忙，请稍后重试！", {icon: 2});
                });
                promise.done(function (result) {
                    if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                        switch (result.status) {
                            case 1:
                                layer.alert("添加远程控制IP成功", {icon: 6});
                                break;
                            default:
                                layer.alert("添加远程控制IP失败", {icon: 5});
                                break;
                        }
                    }
                    else {
                        layer.alert("重启失败", {icon: 5});
                    }
                });
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.gotoPage = function () {
    if (this.isRedirect == true) {
        window.location.replace(APPCONFIG["default"].HOMEPAGE_URL);
    }
}
/*暂时不需要的js*/
AdvanceDeviceController.prototype.deleteRemoteIP = function (id) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_DEVICE_REMOTE_IP + "?id=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.selectRemoteIPs(1, true);
                        break;
                    default:
                        layer.alert("删除远程控制IP失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("删除远程控制IP失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.deployRemoteIP = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DEPLOY_DEVICE_REMOTE_IP;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("部署远程控制IP成功", {icon: 6});
                        break;
                    default:
                        layer.alert("部署远程控制失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("部署远程控制失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.appendRemoteIP = function (ip, $table, $total) {
    try {
        var parent = this;
        var html = "";
        html += "<tr>";
        html += "<td style='width:50%;'>" + ip + "</td>";
        html += "<td></td>";
        html += "</tr>";
        if ($table.find("tr:last").find("td").length > 1) {
            $table.append(html);
        }
        else {
            $table.html(html);
        }
        $total.html(parseInt($total.html()) + 1);
        setTimeout(function () {
            parent.selectRemoteIPs(1, true);
        }, 4000);
        return false;
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

AdvanceDeviceController.prototype.selectRemoteIPs = function (pageIndex, isPaged) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:50%;">IP地址</td>';
    html += '<td class="address">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_REMOTE_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='2'>暂无数据</td></tr>";
            ;
            $(parent.pTdEventList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:50%;'>" + result.rows[i][1] + "</td>";
                        html += "<td><button class='button_delete button' data-key='" + result.rows[i][0] + "'>删除</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='2'>暂无数据</td></tr>";
                    ;
                }
            }
            else {
                html += "<tr><td colspan='2'>暂无数据</td></tr>";
                ;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalRemoteIP).text(result.total);
            }
            $(parent.pTdRemoteIPList).html(html);

            $(parent.pTdRemoteIPList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                parent.deleteRemoteIP(id);

            });
            if (parent.pRemoteIPPager == null || isPaged) {
                parent.pRemoteIPPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectRemoteIPs(pageIndex, false);
                });
                parent.pRemoteIPPager.init();
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='2'>暂无数据</td></tr>";
        ;
        $(this.pTdRemoteIPList).html(html);
        console.error("ERROR - AdvanceDeviceController.selectRemoteIPs() - Unable to get all remote ip list: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.AdvanceDeviceController", AdvanceDeviceController);

