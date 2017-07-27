function MacRuleController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isAllChecked = false;
    this.allRules = [];
    this.checkedRules = [];

    this.pChkAll = "#" + this.elementId + "_chkAll";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
    this.pBtnEmpty = "#" + this.elementId + "_empty";
    this.pBtnDelete = "#" + this.elementId + "_btnDelete";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pDdlEvent = "#" + this.elementId + "_dllEvent";
    this.pDdlUnknownIpMacEvent = "#" + this.elementId + "_dllUnknownIpMacEvent";

    this.pTxtIP = "#" + this.elementId + "_txtIP";
    this.pTxtMac = "#" + this.elementId + "_txtMac";
    this.pTxtDevice = "#" + this.elementId + "_txtDevice";
    this.pBtnAdd = "#" + this.elementId + "_btnAdd";

    this.pTdRuleList = "#" + this.elementId + "_tdRuleList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalRule1 = "#" + this.elementId + "_lblTotalRule1";
    this.pLblTotalRule2 = "#" + this.elementId + "_lblTotalRule2";
    this.pDdlFilter = "#" + this.elementId + "_ddlFilter";

    this.pRulePager = null;
    this.pFilters = "";
}

MacRuleController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_MAC), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - MacRuleController.init() - Unable to initialize: " + err.message);
    }
}

MacRuleController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        $(this.pBtnAdd).on("click", function () {
            parent.addRule();
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pRulePager = null;
            parent.selectRules(1);
            parent.getAllRuleMacIds();
        });

        $(this.pChkAll).on("click", function () {
            //parent.enableBlacklist();
            parent.isAllChecked = ($(this).attr("isChecked") == "true");
            $(parent.pTdRuleList).find("input[type='checkbox']").prop("checked", parent.isAllChecked);
            if (parent.isAllChecked) {
                parent.checkedRules = parent.allRules.slice(0);
                $(this).text("取消").removeClass("but_off").addClass("but_all").attr("isChecked", "false");
            } else {
                parent.checkedRules = [];
                $(this).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
            }
        });

        $(this.pBtnEnable).on("click", function () {
            //parent.enableRule();
            parent.startRuleIpMacMulti();
        });
        $(this.pBtnEmpty).on("click", function () {
            //parent.enableRule();
            parent.startRuleIpMacMultiempt();
        });

        $(this.pBtnDelete).on("click", function () {
            parent.deleteRuleMulit();
        })

        $(this.pDdlUnknownIpMacEvent).on("change", function () {
            parent.setUnknownIpMacRule($(this).val());
        });

        $(parent.pDdlFilter).on("change", function () {
            parent.pRulePager = null;
            parent.selectRules(1);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.initControls() - Unable to initialize control: " + err.message);
    }
}

MacRuleController.prototype.load = function () {
    try {
        this.selectRules(1);
        this.getAllRuleMacIds();
    }
    catch (err) {
        console.error("ERROR - MacRuleController.load() - Unable to load: " + err.message);
    }
}

MacRuleController.prototype.addRule = function () {
    try {
        var parent = this;
        var device = $.trim($(this.pTxtDevice).val());
        var ip = $.trim($(this.pTxtIP).val());
        var mac = $.trim($(this.pTxtMac).val());

        if (device == "") {
            layer.alert("设备名称不能为空", {icon: 5});
            return false;
        }
        if (device.length > 50) {
            layer.alert("设备名称不能超过50个字符", {icon: 5});
            return false;
        }
        //不能是环回地址和D类广播地址
        if (!Validation.validateIP(ip)
            || Validation.validateLoopbackIP(ip)
            || (Validation.compareIP(ip, "224.0.0.0") == 1 && Validation.compareIP(ip, "239.255.255.255") == -1)
            || Validation.compareIP(ip, "224.0.0.0") == 0
            || Validation.compareIP(ip, "239.255.255.255") == 0) {
            layer.alert("请输入有效IP，且不能为环回地址和D类广播地址", {icon: 5});
            return false;
        }
        if (!Validation.validateMAC(mac)) {
            layer.alert("请输入正确有效的MAC地址", {icon: 5});
            return false;
        }
        var link = APPCONFIG["default"].ADD_RULE_MAC;
        var data = {"name": device.toLowerCase(), "ip": ip, "mac": mac.toLowerCase()};
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCallByURL(link, 'POST', data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            layer.close(loadIndex);
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("添加成功", {icon: 6});
                        setTimeout(function () {
                            $(parent.pBtnRefresh).click();
                        }, 3000);
                        break;
                    case -1:
                        layer.alert("当前规则已经存在，请不要重复添加", {icon: 5});
                        break;
                    case 0:
                        layer.alert("规则数量超出上限", {icon: 5});
                        break;
                    case 2:
                        layer.alert("白名单正在学习中...请稍后操作.", {icon: 5});
                        break;
                    case -2:
                        layer.alert("当前设备厂商或IP已经存在，请不要重复添加", {icon: 5});
                        break;
                    default:
                        layer.alert("添加规则失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("添加规则失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to export all events: " + err.message);
    }
}
//暂不使用
MacRuleController.prototype.disableRule = function () {
    try {
        var parent = this;
        if ($(this.pLblTotalRule2).html() == "0") {
            layer.alert("当前没有可以操作的规则", {icon: 5});
            return;
        }
        var link = APPCONFIG["default"].DISABLE_RULE_MAC;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdRuleList).find("input[type='checkbox']").prop("checked", false);
                        layer.close(loadIndex);
                        break;
                    default:
                        layer.alert("禁用所有规则失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("禁用所有规则失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to export all events: " + err.message);
    }
}
//暂不使用
MacRuleController.prototype.enableRule = function () {
    try {
        var parent = this;
        if ($(this.pLblTotalRule2).html() == "0") {
            layer.alert("当前没有可以操作的规则", {icon: 5});
            return;
        }
        var link = APPCONFIG["default"].ENABLE_RULE_MAC;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdRuleList).find("input[type='checkbox']").prop("checked", true);
                        break;
                    case 2:
                        layer.alert("白名单正在学习中...请稍后操作.", {icon: 5});
                        break;
                    default:
                        layer.alert("启用所有规则失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("启用所有规则失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to deploy rules: " + err.message);
    }
}
//暂不使用
MacRuleController.prototype.deleteRule = function (id, $tr) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_RULE_MAC + "?id=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $tr.remove();
                        var cur = parseInt($(parent.pLblTotalRule2).text()) - 1;
                        $(parent.pLblTotalRule2).text(cur);
                        break;
                    default:
                        layer.alert("删除规则失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("删除规则失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to delete this rule: " + err.message);
    }
}
//暂不使用
MacRuleController.prototype.updateRule = function (id, status, obj, v) {
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_RULE_MAC + "?id=" + id + "&status=" + status;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            obj.prop("checked", v);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        break;
                    case 2:
                        layer.alert("白名单正在学习中,请稍后操作...", {icon: 5});
                        obj.prop("checked", v);
                        break;
                    default:
                        layer.alert("修改失败", {icon: 5});
                        obj.prop("checked", v);
                        break;
                }
            }
            else {
                obj.prop("checked", v);
                layer.alert("修改失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        obj.prop("checked", v);
        console.error("ERROR - MacRuleController.exportLog() - Unable to save this rule: " + err.message);
    }
}
//翻页
MacRuleController.prototype.selectRules = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:4%;"><input data-key="0" type="checkbox" id="chkRuleListPage"></td>';
    html += '<td class="address">设备厂商</td>';
    html += '<td class="address" style="width:20%;">IP地址</td>';
    html += '<td class="address" style="width:20%;">MAC地址</td>';
    html += '<td class="address style="width:10%;"">启用状态</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var filter = $(parent.pDdlFilter + " option:selected").val();
        var link = APPCONFIG["default"].GET_RULE_MAC_LIST + "?page=" + pageIndex;
        if (filter != "") {
            link += "&status=" + filter;
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
            $(parent.pTdRuleList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td><input type='checkbox' data-key='" + result.rows[i][0] + "'></td>";
                        html += "<td>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:20%;text-align:center;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:20%;text-align:center;'>" + result.rows[i][3] + "</td>";
                        html += "<td>" + (result.rows[i][4] == 1 ? "启用" : "未启用") + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='5'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='5'>暂无数据</td></tr>";
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalRule1).text(result.num);
            }
            $(parent.pTdRuleList).html(html);
            if (typeof(result.action) != "undefined") {
                $(parent.pDdlEvent).val(result.action);
            }
            if (typeof(result.unknow_device_action) != "undefined") {
                $(parent.pDdlUnknownIpMacEvent).val(result.unknow_device_action);
            }
            $(".rule-single-select").ruleSingleSelect();
            layer.close(loadIndex);

            //判断是否选择
            $(parent.pTdRuleList).find("input:checkbox").each(function () {
                var id = $(this).attr("data-key");
                var isExits = $.inArray(id, parent.checkedRules);
                if (isExits >= 0) {
                    $(this).prop("checked", true);
                }
            });
            //当前页全选按钮
            $(parent.pTdRuleList).find("#chkRuleListPage").on("change", function () {
                var checked = $(this).prop("checked");
                $(parent.pTdRuleList).find("input:checkbox").prop("checked", checked);
                $(parent.pTdRuleList).find("input:checkbox").each(function () {
                    var id = $(this).attr("data-key");
                    if (checked && id != 0) {
                        var isExits = $.inArray(id, parent.checkedRules);
                        if (isExits < 0) {
                            parent.checkedRules.push(id);
                        }
                    }
                    else {
                        parent.checkedRules.forEach(function (item, index) {
                            if (item == id) {
                                parent.checkedRules.splice(index, 1);
                            }
                        });
                    }
                });
            });
            //每条数据选择按钮
            $(parent.pTdRuleList).find("input:checkbox").on("change", function () {
                var checked = $(this).prop("checked");
                var id = $(this).attr("data-key");
                if (checked && id != "0") {
                    var isExits = $.inArray(id, parent.checkedRules);
                    if (isExits < 0) {
                        parent.checkedRules.push(id);
                    }
                } else {
                    parent.checkedRules.forEach(function (item, index) {
                        if (item == id) {
                            parent.checkedRules.splice(index, 1);
                        }
                    });
                }
            });

            if (parent.pRulePager == null) {
                parent.pRulePager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectRules(pageIndex);
                });
                parent.pRulePager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        ;
        $(this.pTdRuleList).html(html);
        console.error("ERROR - MacRuleController.selectRules() - Unable to get all events: " + err.message);
    }
}
//获取所有规则ID数组
MacRuleController.prototype.getAllRuleMacIds = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_RULE_MAC_IDS;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (result && result.ipmaclist) {
                parent.allRules = result.ipmaclist;
                $(parent.pLblTotalRule2).text(result.ipmaclist.length);
            } else {
                layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            }
        })
    } catch (err) {
        console.error("ERROR - BlacklistController.checkAllBlacklists() - Unable to get all blacklist ids: " + err.message);
    }
}
//应用所选
MacRuleController.prototype.startRuleIpMacMulti = function () {
    try {
        var parent = this;
        var action = $(parent.pDdlEvent).val();
        if (!action) {
            layer.alert("请选择处理措施", {icon: 2});
            return;
        }
        var data = {"status": 1, "sids": parent.checkedRules.join(","), "action":$(parent.pDdlEvent).val()};
        var link = APPCONFIG["default"].START_RULE_IPMAC_MULTI;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCallByURL(link, 'POST', data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", {icon: 6});
                        parent.checkedRules = [];
                        $(parent.pChkAll).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
                        $(parent.pBtnRefresh).click();
                        break;
                    case 2:
                        layer.alert("白名单正在学习中...请稍后操作.", {icon: 5});
                        break;
                    default:
                        layer.alert("操作失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("操作失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.updateBlackListMulti() - Unable to  all events: " + err.message);
    }
}
//清空所有部署规则
MacRuleController.prototype.startRuleIpMacMultiempt = function () {
    try {
        var parent = this;
        var action = $(parent.pDdlEvent).val();
        if (!action) {
            layer.alert("请选择处理措施", {icon: 2});
            return;
        }
        var data = {"status": 1, "sids": "", "action":$(parent.pDdlEvent).val()};
        var link = APPCONFIG["default"].START_RULE_IPMAC_MULTI;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCallByURL(link, 'POST', data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", {icon: 6});
                        parent.checkedRules = [];
                        $(parent.pChkAll).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
                        $(parent.pBtnRefresh).click();
                        break;
                    case 2:
                        layer.alert("白名单正在学习中...请稍后操作.", {icon: 5});
                        break;
                    default:
                        layer.alert("操作失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("操作失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.updateBlackListMulti() - Unable to  all events: " + err.message);
    }
}
//删除所选
MacRuleController.prototype.deleteRuleMulit = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_RULE_MAC_MULTI + "?ids=" + parent.checkedRules.join(",");
        if (parent.checkedRules == "") {
            layer.alert("当前未选择规则，不能进行删除操作");
            return;
        }
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", {icon: 6});
                        parent.checkedRules = [];
                        $(parent.pChkAll).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
                        $(parent.pBtnRefresh).click();
                        break;
                    case 3:
                        layer.alert("删除的规则中包含有启用状态的规则，禁止该操作", {icon: 5});
                        break;
                    default:
                        layer.alert("操作失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("操作失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.updateBlackListMulti() - Unable to  all events: " + err.message);
    }
}
//未知设备接入监控
MacRuleController.prototype.setUnknownIpMacRule = function (operationId) {
    try {
        var parent = this;
        if (!operationId) return;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SET_RULE_UNKNOWNIPMAC_MULTI + "?action=" + operationId;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("处理成功", {icon: 6});
                        break;
                    default:
                        layer.alert("设置失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("设置失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.setUnknownDeviceRule() - Unable to set unknown ip/mac rule: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.MacRuleController", MacRuleController);

