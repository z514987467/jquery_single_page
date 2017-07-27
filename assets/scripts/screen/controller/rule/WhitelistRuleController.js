function WhitelistRuleController(controller, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnClear = "#" + this.elementId + "_btnClear";

    this.pTdWhitelistList = "#" + this.elementId + "_tdWhitelistList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalWhitelist = "#" + this.elementId + "_lblTotalWhitelist";

    this.pWhitelistPager = null;
    this.pWhitelistController = controller;
}

WhitelistRuleController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_WHITELIST_RULE), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - WhitelistRuleController.init() - Unable to initialize: " + err.message);
    }
}

WhitelistRuleController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pBtnClear).on("click", function () {
            parent.clearWhitelist();
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistRuleController.initControls() - Unable to initialize control: " + err.message);
    }
}

WhitelistRuleController.prototype.load = function () {
    try {
        this.selectWhitelists(1);
    }
    catch (err) {
        console.error("ERROR - WhitelistRuleController.load() - Unable to load: " + err.message);
    }
}

WhitelistRuleController.prototype.clearWhitelist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].CLEAR_WHITELIST;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("清除已部署规则成功", { icon: 6 });
                        setTimeout(function () { parent.selectWhitelists(1) }, 3000);
                        break;
                    default: layer.alert("清除已部署规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("清除已部署规则失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistRuleController.clearWhitelist() - Unable to clear all events: " + err.message);
    }
}

WhitelistRuleController.prototype.selectWhitelists = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:10%">优先级</td>';
    html += '<td class="address" style="width:20%">协议名称</td>';
    html += '<td class="address" style="width:20%">规则项名称</td>';
    html += '<td class="address" style="width:40%">操作码</td>';
    html += '<td class="address" style="width:10%">详情</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_WHITELIST + "?page=" + pageIndex;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
            $(parent.pTdWhitelistList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        var ruleinfo = parent.analysisRule(result.rows[i][1]);
                        html += "<td style='width:10%'>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                        html += "<td style='width:20%'>" + ruleinfo[0] + "</td>";
                        html += "<td style='width:20%'>" + result.rows[i][0] + "</td>";
                        html += "<td style='width:40%' title='" + ruleinfo[2] + "'>" + FormatterManager.stripText(ruleinfo[1], 50) + "</td>";
                        html += "<td style='width:10%'><button class='details' data-key='" + parent.pWhitelistController.formatDangerLevel(result.rows[i][2]) + "'>详情</button></td>";
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
                $(parent.pWhitelistController.pTotalKnowWhitelist).text(result.total);
                $(parent.pLblTotalWhitelist).text(result.total);
            }
            $(parent.pTdWhitelistList).html(html);
            layer.close(loadIndex);

            if (parent.pWhitelistPager == null) {
                parent.pWhitelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex) {
                    parent.selectWhitelists(pageIndex);
                });
                parent.pWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        $(this.pTdWhitelistList).html(html);
        console.error("ERROR - WhitelistRuleController.selectWhitelists() - Unable to get all events: " + err.message);
    }
}
WhitelistRuleController.prototype.analysisRule = function (tmp) {
    try {
        var index = tmp.split(",");
        var len = index.length;
        var tmp_name = index[0].substring(index[0].indexOf(":") + 1);
        var tmp_function = "";
        for (var i = 1; i < len; i++) {
            tmp_function += index[i];
            tmp_function += "\n";
        }

        return [tmp_name, tmp_function];
    } catch (err) {
        console.error("ERROR - WhitelistRuleController.getRuleInfo() - Unable to analysis rule information: " + err.message);
        return ["unknow", "unknow"];
    }
}
ContentFactory.assignToPackage("kea.base.WhitelistRuleController", WhitelistRuleController);

