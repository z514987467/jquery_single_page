function BlacklistController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isAllChecked = false;
    this.allRules = [];
    this.checkedRules = [];

    this.pChkAll = "#" + this.elementId + "_chkAll";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
    this.pBtnEmpty = "#" + this.elementId + "_empty";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.bBtnUpload = "#" + this.elementId + "_btnUpload";
    this.pDdlFilter = "#" + this.elementId + "_ddlFilter";
    this.pFileUpload = "#" + this.elementId + "_fileUpload";
    this.pFormUpload = "#" + this.elementId + "_formUpload";
    this.pTdBlacklistList = "#" + this.elementId + "_tdBlacklistList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalBlacklist1 = "#" + this.elementId + "_lblTotalBlacklist1";
    this.pLblTotalBlacklist2 = "#" + this.elementId + "_lblTotalBlacklist2";

    this.pLblBugName = "#" + this.elementId + "_dialog_lblBugName";
    this.pLblBugNo = "#" + this.elementId + "_dialog_lblBugNo";
    this.pLblBugType = "#" + this.elementId + "_dialog_lblBugType";
    this.pLblBugSource = "#" + this.elementId + "_dialog_lblBugSource";
    this.pLblBugTime = "#" + this.elementId + "_dialog_lblBugTime";
    this.pLblBugLevel = "#" + this.elementId + "_dialog_lblBugLevel";
    this.pLblBugDevice = "#" + this.elementId + "_dialog_lblBugDevice";
    this.pLblBugRuleSource = "#" + this.elementId + "_dialog_lblBugRuleSource";
    this.pLblBugEventHandle = "#" + this.elementId + "_dialog_lblBugEventHandle";
    this.pLblCompactCompany = "#" + this.elementId + "_dialog_lblCompactCompany";
    this.pLblAttackCondition = "#" + this.elementId + "_dialog_lblAttackCondition";
    this.pLblRuleContent = "#" + this.elementId + "_dialog_lblRuleContent";
    this.pLblFeatureName = "#" + this.elementId + "_dialog_lblFeatureName";
    this.pLblFeaturePriority = "#" + this.elementId + "_dialog_lblFeaturePriority";
    this.pLblFeatureRisk = "#" + this.elementId + "_dialog_lblFeatureRisk";
    this.pLblFeatureNo = "#" + this.elementId + "_dialog_lblFeatureNo";
    this.pDllEvent = "#" + this.elementId + "_dllEventAll";
    this.pSids = [];
    this.pCurrentPageIndex = 1;
    this.pBlacklistPager = null;

    this.pIsRefresh = 1;//是否是第一次进入页面，默认是第一次
}

BlacklistController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.RULE_BLACKLIST_DIALOG],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - BlacklistController.init() - Unable to initialize all templates: " + err.message);
    }
}

BlacklistController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_BLACKLIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - BlacklistController.initShell() - Unable to initialize: " + err.message);
    }
}

BlacklistController.prototype.initControls = function () {
    try {
        var parent = this;
        //全选
        $(this.pChkAll).on("click", function () {
            //parent.enableBlacklist();
            parent.isAllChecked = ($(this).attr("isChecked") == "true");
            $(parent.pTdBlacklistList).find("input[type='checkbox']").prop("checked", parent.isAllChecked);
            if (parent.isAllChecked) {
                parent.checkedRules = parent.allRules.slice(0);
                $(this).text("取消").removeClass("but_off").addClass("but_all").attr("isChecked", "false");
            }
            else {
                parent.checkedRules = [];
                $(this).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
            }
        });

        $(this.pBtnEnable).on("click", function () {
            //parent.disableBlacklist();
            parent.startBlackListMulti();
        });
        $(this.pBtnEmpty).on("click", function () {
            //parent.disableBlacklist();
            parent.checkedRules = [];
            parent.startBlackListMulti();
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pBlacklistPager = null;
            parent.selectBlacklists(1);
        });

        $(this.pFileUpload).on("change", function () {
            var fileName = $.trim($(this).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1, 3).toLowerCase();
                if (fieExtension == "zip") {
                    parent.uploadBlacklist();
                }
                else {
                    layer.alert("文件格式不对", {icon: 6});
                }
            }

        });

        $(".rule-single-select").ruleSingleSelect();

        $(this.pDdlFilter).on("change", function () {
            parent.pBlacklistPager = null;
            parent.selectBlacklists(1);
        });
        $(this.pDllEvent).on("change", function () {
            parent.updateBlackEvent($(this).val());
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.initControls() - Unable to initialize control: " + err.message);
    }
}

BlacklistController.prototype.load = function () {
    try {
        this.selectBlacklists(1);
        this.getAllBlackIdsList();
    }
    catch (err) {
        console.error("ERROR - BlacklistController.load() - Unable to load: " + err.message);
    }
}

BlacklistController.prototype.uploadBlacklist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPLOAD_BLACKLIST_FILEPATH;
        var loadIndex = layer.load(2);
        jQuery.support.cors = true;
        $(this.pFormUpload).ajaxSubmit({
            type: 'post',
            url: link,//"/default.aspx",
            success: function (result) {
                $(parent.pFileUpload).val("");
                if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                    switch (result.status) {
                        case 0:
                            setTimeout(function () {
                                parent.pBlacklistPager = null;
                                parent.selectBlacklists(1);
                                parent.getAllBlackIdsList();
                            }, 3000);
                            layer.alert("上传成功", {icon: 6});
                            break;
                        case 2:
                            layer.alert("该黑名单已存在", {icon: 5});
                            break;
                        default:
                            layer.alert("上传失败", {icon: 5});
                            break;
                    }
                }
                else {
                    layer.alert("上传失败", {icon: 5});
                }
                layer.close(loadIndex);
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                layer.close(loadIndex);
                layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            }
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.flagBlacklist() - Unable to set all events to read status: " + err.message);
    }
}

BlacklistController.prototype.enableBlacklist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].ADD_BLACKLIST_ALL;
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
                        $(parent.pTdBlacklistList).find("input[type='checkbox']").prop("checked", true);
                        layer.alert("启用所有规则成功", {icon: 6});
                        setTimeout(function () {
                            parent.selectBlacklists(1);
                        }, 3000);
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
        console.error("ERROR - BlacklistController.clearBlacklist() - Unable to clear all events: " + err.message);
    }
}

BlacklistController.prototype.disableBlacklist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].CLEAR_BLACKLIST_ALL;
        var promise = URLManager.getInstance().ajaxCall(link);
        var loadIndex = layer.load(2);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdBlacklistList).find("input[type='checkbox']").prop("checked", false);
                        $(parent.pLblTotalBlacklist1).text("0");
                        layer.alert("禁用所有规则成功", {icon: 6});
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
        console.error("ERROR - BlacklistController.clearBlacklist() - Unable to clear all events: " + err.message);
    }
}

BlacklistController.prototype.updateBlacklist = function (id, status, obj, v) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_BLACKLIST + "?sid=" + id + "&status=" + status;
        var loadIndex = layer.load(2);
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
                        layer.alert("操作成功", {icon: 6});
                        if (status == 1) {
                            $(parent.pLblTotalBlacklist1).text(parseInt($(parent.pLblTotalBlacklist1).html()) + 1);
                        }
                        else {
                            $(parent.pLblTotalBlacklist1).text(parseInt($(parent.pLblTotalBlacklist1).html()) - 1);
                        }
                        break;
                    default:
                        obj.prop("checked", v);
                        layer.alert("操作失败", {icon: 5});
                        break;
                }
            }
            else {
                obj.prop("checked", v);
                layer.alert("操作失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        obj.prop("checked", v);
        console.error("ERROR - BlacklistController.clearBlacklist() - Unable to clear all events: " + err.message);
    }
}

BlacklistController.prototype.selectBlacklists = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:4%"><input type="checkbox" id="chkBlacklistPage" data-key="0"/></td>';
    html += '<td class="address" style="width:4%">序号</td>';
    html += '<td class="address" style="width:40%">漏洞名称</td>';
    html += '<td class="address" style="width:12%">发布时间</td>';
    html += '<td class="address" style="width:10%">风险等级</td>';
    html += '<td class="IPaddress" style="width:8%;">事件处理</td>';
    html += '<td class="address" style="width:12%">内容</td>';
    html += '<td class="address" style="width:12%">启用状态</td>';
    html += '</tr>';
    try {
        var parent = this;
        var filter = $(parent.pDdlFilter + " option:selected").val();
        var link = APPCONFIG["default"].GET_BLACKLIST_LIST + "?page=" + pageIndex + "&pageIsRefresh=" + parent.pIsRefresh;
        if (filter != "") {
            link += "&status=" + filter;
        }
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='6'>暂无数据</td></tr>";
            $(parent.pTdBlacklistList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    parent.pIsRefresh = 0;
                    for (var i = 0; i < result.rows.length; i++) {
                        parent.pSids.push(result.rows[i][0]);
                        html += "<tr>";
                        html += "<td ><input type='checkbox'  data-key='" + result.rows[i][4] + "'></td>";
                        html += "<td >" + ((pageIndex - 1) * 10 + 1 + i) + "</td>";
                        //漏洞名称
                        html += "<td style='width:40%;text-align: left;padding-left:5px;' title='" + result.rows[i][0] + "'>" + FormatterManager.stripText(result.rows[i][0], 44) + "</td>";
                        //发布时间
                        html += "<td style='width:12%'>" + result.rows[i][1] + "</td>";
                        //风险等级
                        html += "<td style='width:12%'>" + parent.formatRiskLevel(result.rows[i][3]) + "</td>";
                        //事件处理
                        if (result.rows[i][5] == 0) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option selected='selected'  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>丢弃</option><option value='3'>阻断</option></select></td>";
                        } else if (result.rows[i][5] == 1) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option  value='0'>通过</option> <option selected='selected' value='1'>警告</option><option value='2'>丢弃</option><option value='3'>阻断</option></select></td>";
                        } else if (result.rows[i][5] == 2) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option  selected='selected'value='2'>丢弃</option><option value='3'>阻断</option></select></td>";
                        } else if (result.rows[i][5] == 3) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>丢弃</option><option selected='selected'  value='3'>阻断</option></select></td>";
                        }
                        //内容
                        html += "<td style='width:10%'><button class='details' data-key='" + result.rows[i][4] + "'>详情</button></td>";
                        //启用状态
                        html += "<td style='width:12%'>" + (result.rows[i][2] == 1 ? "启用" : "未启用") + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='8'>暂无数据</td></tr>";
                }
            } else {
                html += "<tr><td colspan='8'>暂无数据</td></tr>";
            }
            $(parent.pTdBlacklistList).html(html);
            layer.close(loadIndex);
            if (typeof (result.num) != "undefined") {
                $(parent.pLblTotalBlacklist1).text(result.num);
            }

            $(parent.pTdBlacklistList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                var dialogTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_BLACKLIST_DIALOG), {
                    elementId: parent.elementId + "_dialog"
                });
                var width = parent.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                var height = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                layer.open({
                    type: 1,
                    title: "预览规则",
                    area: [width, height],
                    offset: ["82px", "200px"],
                    shade: [0.5, '#393D49'],
                    content: dialogTemplate,
                    success: function (layero, index) {
                        parent.getBlacklistDetails(layero, id);
                        $(window).on("resize", function () {
                            var pwidth = parent.pViewHandle.find(".eventinfo_box").width() - 10;
                            var pheight = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10;
                            layero.width(pwidth);
                            layero.height(pheight);
                        })
                    }
                });

            });

            //判断是否选择
            $(parent.pTdBlacklistList).find("input:checkbox").each(function () {
                var id = $(this).attr("data-key");
                var isExits = $.inArray(id, parent.checkedRules);
                if (isExits >= 0) {
                    $(this).prop("checked", true);
                }
            });
            //当前页全选按钮
            $(parent.pTdBlacklistList).find("#chkBlacklistPage").on("change", function () {
                var checked = $(this).prop("checked");
                $(parent.pTdBlacklistList).find("input:checkbox").prop("checked", checked);
                $(parent.pTdBlacklistList).find("input:checkbox").each(function () {
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
            $(parent.pTdBlacklistList).find("input:checkbox").on("change", function () {
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

            $(parent.pTdBlacklistList).find("select").each(function () {
                $(this).change(function () {
                    var id = $(this).attr("data-key");
                    var value = $(this).val();
                    if (!value) return;
                    var link = APPCONFIG["default"].UPDATE_BLACKLIST_EVENT;
                    var data = {"action": value, "sid": id};
                    var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
                    promise.fail(function (jqXHR, textStatus, err) {
                        console.log(textStatus + " - " + err.message);
                        layer.alert("事件处理失败", {icon: 5});
                    });
                    promise.done(function (result) {
                        if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                            switch (result.status) {
                                case 1:
                                    //layer.alert("事件处理成功", {icon: 6});
                                    break;
                                default:
                                    layer.alert("事件处理失败", {icon: 5});
                                    break;
                            }
                        }
                        else {
                            layer.alert("事件处理失败", {icon: 5});
                        }
                    });
                });
            });

            if (parent.pBlacklistPager == null) {
                parent.pBlacklistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex) {
                    parent.selectBlacklists(pageIndex);
                });
                parent.pBlacklistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='6'>暂无数据</td></tr>";
        $(this.pTdBlacklistList).html(html);
        console.error("ERROR - BlacklistController.selectBlacklists() - Unable to get all events: " + err.message);
    }
}

BlacklistController.prototype.getBlacklistDetails = function (viewHandler, id) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_BLACKLIST + "?recordid=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result.rows) != "undefined" && result.rows.length > 0) {
                $(viewHandler).find(parent.pLblBugName).text(result.rows[0][0]);
                $(viewHandler).find(parent.pLblBugNo).text(result.rows[0][5]);
                $(viewHandler).find(parent.pLblBugType).text(result.rows[0][1]);
                $(viewHandler).find(parent.pLblBugSource).text("iSightPartners");
                $(viewHandler).find(parent.pLblBugTime).text(result.rows[0][2]);
                $(viewHandler).find(parent.pLblBugLevel).text(parent.formatDangerLevel(result.rows[0][3]));
                $(viewHandler).find(parent.pLblBugDevice).text("Genesis");
                $(viewHandler).find(parent.pLblBugRuleSource).text("漏洞库");
                $(viewHandler).find(parent.pLblBugEventHandle).text(parent.formatEventLevel(result.rows[0][4]));
                $(viewHandler).find(parent.pLblCompactCompany).text("Iconics");
                $(viewHandler).find(parent.pLblAttackCondition).text(result.rows[0][6]);
                $(viewHandler).find(parent.pLblRuleContent).text(result.rows[0][8]);
                $(viewHandler).find(parent.pLblFeatureName).text(result.rows[0][9]);
                $(viewHandler).find(parent.pLblFeaturePriority).text("1");
                $(viewHandler).find(parent.pLblFeatureRisk).text(parent.formatRiskLevel(result.rows[0][10]));
                $(viewHandler).find(parent.pLblFeatureNo).text(result.rows[0][11]);
            }
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.getBlacklistDetails() - Unable to get safe event information: " + err.message);
    }
}

BlacklistController.prototype.formatDangerLevel = function (status) {
    try {
        switch (status) {
            case 0:
                return "低";
            case 1:
                return "中";
            case 2:
                return "高";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - BlacklistController.formatDangerLevel() - Unable to get danger level via id: " + err.message);
    }
}

BlacklistController.prototype.formatEventLevel = function (status) {
    try {
        switch (status) {
            case 0:
                return "通过";
            case 1:
            case 2:
                return "警告";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - BlacklistController.formatEventLevel() - Unable to get event level via id: " + err.message);
    }
}

BlacklistController.prototype.formatRiskLevel = function (status) {
    try {
        switch (status) {
            case 0:
                return "低";
            case 1:
                return "中";
            case 2:
                return "高";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - BlacklistController.formatRiskLevel() - Unable to get risk level via id: " + err.message);
    }
}

BlacklistController.prototype.formatStatus = function (status) {
    try {
        switch (status) {
            case 1:
                return "checked";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - BlacklistController.formatEventLevel() - Unable to get event level via id: " + err.message);
    }
}

BlacklistController.prototype.updateBlackEvent = function (operationId) {
    try {
        var parent = this;
        if (!operationId) return;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_BLACKLIST_ALLEVENT + "?action=" + operationId;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdBlacklistList).find("select").val(operationId).attr("selected", true);
                        //layer.alert("处理成功", {icon: 6});
                        layer.close(loadIndex);
                        break;
                    default:
                        layer.alert("设置失败", {icon: 5});
                        layer.close(loadIndex);
                        break;
                }
            }
            else {
                layer.alert("设置失败", {icon: 5});
                layer.close(loadIndex);
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.updateBlackEvent() - Unable to update backlist event: " + err.message);
    }
}
//add by zhangmignzheng
BlacklistController.prototype.getAllBlackIdsList = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_BLACKLIST_IDS;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (result && result.blacklist) {
                parent.allRules = result.blacklist;
                $(parent.pLblTotalBlacklist2).text(result.blacklist.length);
            } else {
                layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            }
        })
    } catch (err) {
        console.error("ERROR - BlacklistController.checkAllBlacklists() - Unable to get all blacklist ids: " + err.message);
    }
}
//add by zhangmignzheng
BlacklistController.prototype.startBlackListMulti = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].START_BLACKLIST_MULTI ;
        var loadIndex = layer.load(2);
        var data = {"status": 1, "sids": parent.checkedRules.join(",")};
        var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true)
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
//
ContentFactory.assignToPackage("kea.base.BlacklistController", BlacklistController);

