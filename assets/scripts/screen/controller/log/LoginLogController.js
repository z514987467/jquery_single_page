function LoginLogController(eventController, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pTxtUserName = "#" + this.elementId + "_txtUserName";
    this.pTxtIP = "#" + this.elementId + "_txtIP";
    this.pTxtReason = "#" + this.elementId + "_txtReason";
    this.pTxtStartDateTime = "#" + this.elementId + "_txtStartDateTime";
    this.pTxtEndDateTime = "#" + this.elementId + "_txtEndDateTime";
    this.pDdlLoginStatus = "#" + this.elementId + "_ddlLoginStatus";

    this.pTdLogList = "#" + this.elementId + "_tdLogList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalLog = "#" + this.elementId + "_lblTotalLog";
    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnFilter = "#" + this.elementId + "_btnFilter";
    this.pDivFilter = "#" + this.elementId + "_divFilter";

    this.pLogPager = null;
    this.PLogController = eventController;
    this.pFilters = "";
}

LoginLogController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.LOG_LOGIN), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - LoginLogController.init() - Unable to initialize: " + err.message);
    }
}

LoginLogController.prototype.initControls = function () {
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
            parent.clearFormatFilter();
            parent.pLogPager = null;
            parent.selectLogs(1);
        });

        $(this.pBtnSearch).on("click", function () {
            parent.formatFilter();
            parent.pLogPager = null;
            parent.searchLogs(1, parent.pFilters);
        });
    }
    catch (err) {
        console.error("ERROR - LoginLogController.initControls() - Unable to initialize control: " + err.message);
    }
}

LoginLogController.prototype.load = function () {
    try {
        this.selectLogs(1);
    }
    catch (err) {
        console.error("ERROR - LoginLogController.load() - Unable to load: " + err.message);
    }
}

LoginLogController.prototype.exportLog = function (filter) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_LOGIN_LOG + filter;
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
                        window.open(APPCONFIG["default"].LOGIN_LOG_FILEPATH + result.filename);
                        break;
                    default:
                        layer.alert("导出失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("导出失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - LoginLogController.exportLog() - Unable to export all logs: " + err.message);
    }
}

LoginLogController.prototype.selectLogs = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" style="width:22%;">时间</td>';
    html += '<td class="address" style="width:13%;">用户</td>';
    html += '<td class="address" style="width:22%;">IP</td>';
    html += '<td class="address" style="width:22%;">登录状态</td>';
    html += '<td class="address">原因</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_LOGIN_LOG_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
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
                        if (result.rows[i][3] == "0") {
                            html += "<td style='color:#1ca826;width:22%;'>" + parent.formatLoginStatus(result.rows[i][3]) + "</td>";
                        }
                        else {
                            html += "<td style='color:#ff5f4a;width:22%;'>" + parent.formatLoginStatus(result.rows[i][3]) + "</td>";
                        }
                        html += "<td>" + result.rows[i][4] + "</td>";
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
                $(parent.PLogController.pTotalLoginLog).text(result.total);
                $(parent.pLblTotalLog).text(result.total);
            }
            $(parent.pTdLogList).html(html);
            layer.close(loadIndex);

            if (parent.pLogPager == null) {
                parent.pLogPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex) {
                    parent.selectLogs(pageIndex);
                });
                parent.pLogPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        $(this.pTdLogList).html(html);
        console.error("ERROR - LoginLogController.selectLogs() - Unable to get all events: " + err.message);
    }
}

LoginLogController.prototype.searchLogs = function (pageIndex, filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" style="width:22%;">时间</td>';
    html += '<td class="address" style="width:13%;">用户</td>';
    html += '<td class="address" style="width:22%;">IP</td>';
    html += '<td class="address" style="width:22%;">登录状态</td>';
    html += '<td class="address">原因</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SEARCH_LOGIN_LOG_LIST + filter + "page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
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
                        if (result.rows[i][3] == "0") {
                            html += "<td style='color:#1ca826;width:22%;'>" + parent.formatLoginStatus(result.rows[i][3]) + "</td>";
                        }
                        else {
                            html += "<td style='color:#ff5f4a;width:22%;'>" + parent.formatLoginStatus(result.rows[i][3]) + "</td>";
                        }
                        html += "<td>" + result.rows[i][4] + "</td>";
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
                $(parent.PLogController.pTotalLoginLog).text(result.total);
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
        console.error("ERROR - LoginLogController.searchLogs() - Unable to search login logs via filter: " + err.message);
    }
}

LoginLogController.prototype.formatLoginStatus = function (status) {
    try {
        switch (status) {
            case "0":
                return "成功";
            case "1":
                return "失败";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - LoginLogController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

LoginLogController.prototype.formatFilter = function () {
    try {
        this.pFilters = "";
        this.pFilters += "?ip=" + $.trim($(this.pTxtIP).val()) + "&";
        this.pFilters += "reason=" + $.trim($(this.pTxtReason).val()) + "&";
        this.pFilters += "status=" + $(this.pDdlLoginStatus + " option:selected").val() + "&";
        this.pFilters += "user=" + $.trim($(this.pTxtUserName).val()) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err)     {
        console.error("ERROR - OperationLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

LoginLogController.prototype.clearFormatFilter = function () {
    try {
        $(this.pTxtIP).val("");
        $(this.pTxtReason).val("");
        $(this.pDdlLoginStatus).val("");
        $(".rule-single-select").ruleSingleSelect();
        $(this.pTxtUserName).val("");
        $(this.pTxtStartDateTime).val("");
        $(this.pTxtEndDateTime).val("");
    }
    catch (err) {
        console.error("ERROR - OperationLogController.clearFormatFilter() : " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.LoginLogController", LoginLogController);

