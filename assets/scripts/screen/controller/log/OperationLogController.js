function OperationLogController(logController, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";

    this.pTxtUserName = "#" + this.elementId + "_txtUserName";
    this.pTxtIP = "#" + this.elementId + "_txtIP";
    this.pTxtProcotol = "#" + this.elementId + "_txtProtocol";
    this.pTxtStartDateTime = "#" + this.elementId + "_txtStartDateTime";
    this.pTxtEndDateTime = "#" + this.elementId + "_txtEndDateTime";
    this.pDdlExecuteStatus = "#" + this.elementId + "_ddlExecuteStatus";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnFilter = "#" + this.elementId + "_btnFilter";
    this.pDivFilter = "#" + this.elementId + "_divFilter";

    this.pTdLogList = "#" + this.elementId + "_tdLogList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalLog = "#" + this.elementId + "_lblTotalLog";

    this.pLogPager = null;
    this.pLogController = logController;
    this.pFilters = "";
}

OperationLogController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.LOG_OPERATION), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - OperationLogController.init() - Unable to initialize: " + err.message);
    }
}

OperationLogController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        $(this.pBtnFilter).on("click", function () {
            parent.pFilters = "";
            $(parent.pBtnFilter).toggleClass("butip");
            $(parent.pBtnFilter).toggleClass("butipon");
            $(parent.pDivFilter).toggle();
        });

        $(this.pBtnExport).on("click", function () {
            parent.formatFilter();
            parent.exportLog(parent.pFilters);
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pLogPager = null;
            parent.clearFormatFilter();
            parent.selectLogs(1);
        });

        $(this.pBtnSearch).on("click", function () {
            parent.formatFilter();
            parent.pLogPager = null;
            parent.searchLogs(1, parent.pFilters);
        });
    }
    catch (err) {
        console.error("ERROR - OperationLogController.initControls() - Unable to initialize control: " + err.message);
    }
}

OperationLogController.prototype.load = function () {
    try {
        this.selectLogs(1);
    }
    catch (err) {
        console.error("ERROR - OperationLogController.load() - Unable to load: " + err.message);
    }
}

OperationLogController.prototype.exportLog = function (filter) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_OPER_LOG + filter;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        window.open(APPCONFIG["default"].OPER_LOG_FILEPATH + result.filename);
                        break;
                    default: layer.alert("导出失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("导出失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - OperationLogController.exportLog() - Unable to export all events: " + err.message);
    }
}

OperationLogController.prototype.selectLogs = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" style="width:22%;">时间</td>';
    html += '<td class="address" style="width:13%;">用户</td>';
    html += '<td class="address" style="width:22%;">IP</td>';
    html += '<td class="address style="width:22%;"">输入命令</td>';
    html += '<td class="address">执行结果</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_LOGIN_OPER_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            $(parent.pTdLogList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:22%;'>" + FormatterManager.formatToLocaleDateTime(result.rows[i][0]) + "</td>";
                        html += "<td style='width:13%;'>" + result.rows[i][1] + "</td>";
                        html += "<td style='width:22%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:22%;'>" + result.rows[i][3] + "</td>";
                        if (result.rows[i][4] == "0") {
                            html += "<td style='color:#1ca826;'>" + parent.formatExecutetatus(result.rows[i][4]) + "</td>";
                        } else {
                            html += "<td style='color:#ff5f4a;'>" + parent.formatExecutetatus(result.rows[i][4]) + "</td>";
                        }
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='5'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLogController.pTotalOperationLog).text(result.total);
                $(parent.pLblTotalLog).text(result.total);
            }
            $(parent.pTdLogList).html(html);
            layer.close(loadIndex);

            if (parent.pLogPager == null) {
                parent.pLogPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex,filters) {
                    parent.selectLogs(pageIndex);
                });
                parent.pLogPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";;
        $(this.pTdLogList).html(html);
        console.error("ERROR - OperationLogController.selectLogs() - Unable to get all events: " + err.message);
    }
}

OperationLogController.prototype.searchLogs = function (pageIndex, filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" stle="width:22%;">时间</td>';
    html += '<td class="address" stle="width:13%;">用户</td>';
    html += '<td class="address" stle="width:22%;">IP</td>';
    html += '<td class="address stle="width:22%;"">输入命令</td>';
    html += '<td class="address">执行结果</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SEARCH_OPER_LOG_LIST + filter + "page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            $(parent.pTdLogList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:22%;'>" + FormatterManager.formatToLocaleDateTime(result.rows[i][0]) + "</td>";
                        html += "<td stle='width:13%;'>" + result.rows[i][1] + "</td>";
                        html += "<td stle='width:22%;'>" + result.rows[i][2] + "</td>";
                        html += "<td stle='width:22%;'>" + result.rows[i][3] + "</td>";
                        if (result.rows[i][4] == "0") {
                            html += "<td style='color:#1ca826;'>" + parent.formatExecutetatus(result.rows[i][4]) + "</td>";
                        } else {
                            html += "<td style='color:#ff5f4a;'>" + parent.formatExecutetatus(result.rows[i][4]) + "</td>";
                        }
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
                $(parent.pLogController.pTotalOperationLog).text(result.total);
                $(parent.pLblTotalLog).text(result.total);
            }
            $(parent.pTdLogList).html(html);
            layer.close(loadIndex);

            if (parent.pLogPager == null) {
                parent.pLogPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.searchLogs(pageIndex, parent.pFilters);
                });
                parent.pLogPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        $(this.pTdLogList).html(html);
        console.error("ERROR - OperationLogController.selectLogs() - Unable to search safe events via filter: " + err.message);
    }
}

OperationLogController.prototype.formatExecutetatus = function (status) {
    try {
        switch (status) {
            case "1": return "失败";
            case "0": return "成功";
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - OperationLogController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

OperationLogController.prototype.formatFilter = function () {
    try {
        this.pFilters = "";
        this.pFilters += "?ip=" + $.trim($(this.pTxtIP).val()) + "&";
        this.pFilters += "cmd=" + $.trim($(this.pTxtProcotol).val()) + "&";
        this.pFilters += "cmd_result=" + $(this.pDdlExecuteStatus + " option:selected").val() + "&";
        this.pFilters += "user=" + $.trim($(this.pTxtUserName).val()) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err) {
        console.error("ERROR - OperationLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

OperationLogController.prototype.clearFormatFilter = function () {
    try {
        $(this.pTxtIP).val("");
        $(this.pTxtProcotol).val("");
        $(this.pDdlExecuteStatus).val("")
        $(".rule-single-select").ruleSingleSelect();
        $(this.pTxtUserName).val("");
        $(this.pTxtStartDateTime).val("");
        $(this.pTxtEndDateTime).val("");
    }
    catch (err) {
        console.error("ERROR - OperationLogController.clearFormatFilter(): " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.OperationLogController", OperationLogController);

