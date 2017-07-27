function SystemEventController(eventController, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnSetRead = "#" + this.elementId + "_btnSetRead";
    this.pBtnClear = "#" + this.elementId + "_btnClear";
    this.pBtnFilter = "#" + this.elementId + "_btnFilter";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";
    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pDivFilter = "#" + this.elementId + "_divFilter";

    this.pTxtEventContent = "#" + this.elementId + "_txtEventContent";
    this.pTxtStartDateTime = "#" + this.elementId + "_txtStartDateTime";
    this.pTxtEndDateTime = "#" + this.elementId + "_txtEndDateTime";

    this.pTdEventList = "#" + this.elementId + "_tdEventList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalEvent = "#" + this.elementId + "_lblTotalEvent";

    this.pEventPager = null;
    this.pEventController = eventController;
    this.pFilters = "";
}

SystemEventController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SYSTEM), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - SystemEventController.init() - Unable to initialize: " + err.message);
    }
}

SystemEventController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        $(this.pBtnRefresh).on("click", function () {
            parent.clearFilter()
            parent.pEventPager = null;
            parent.selectEvents(1);
        });

        $(this.pBtnSetRead).on("click", function () {
            parent.flagEvent();
        });

        $(this.pBtnClear).on("click", function () {
            parent.clearEvent();
        });

        $(this.pBtnExport).on("click", function () {
            parent.formatFilter();
            parent.exportEvent(parent.pFilters);
        });

        $(this.pBtnFilter).on("click", function () {
            parent.pFilters = "";
            $(parent.pBtnFilter).toggleClass("butip");
            $(parent.pBtnFilter).toggleClass("butipon");
            $(parent.pDivFilter).toggle();
        });

        $(this.pBtnSearch).on("click", function () {
            parent.formatFilter();
            parent.pEventPager = null;
            parent.searchEvents(1, parent.pFilters);
        });
    }
    catch (err) {
        console.error("ERROR - SystemEventController.initControls() - Unable to initialize control: " + err.message);
    }
}

SystemEventController.prototype.load = function () {
    try {
        this.selectEvents(1);
    }
    catch (err) {
        console.error("ERROR - SystemEventController.load() - Unable to load: " + err.message);
    }
}

SystemEventController.prototype.flagEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].FLAG_SYS_EVENT_LIST;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("设置已读成功", {icon: 6, width: 300, height: 200});
                        parent.pEventController.setSysEventNum();
                        parent.selectEvents(1);
                        break;
                    default:
                        layer.alert("设置已读失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("设置已读失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - SystemEventController.flagEvent() - Unable to set all events to read status: " + err.message);
    }
}

SystemEventController.prototype.clearEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_SYS_EVENT_LIST;
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
                        layer.alert("清除所有事件成功", {icon: 6});
                        parent.pEventPager = null;
                        parent.pEventController.setSysEventNum();
                        parent.selectEvents(1);
                        break;
                    default:
                        layer.alert("清除所有事件失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("清除所有事件失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - SystemEventController.clearEvent() - Unable to clear all events: " + err.message);
    }
}

SystemEventController.prototype.exportEvent = function (filter) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_SYS_EVENT + filter;
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
                        window.open(APPCONFIG["default"].SYS_EVENT_FILEPATH + result.filename);
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
        console.error("ERROR - SystemEventController.exportEvent() - Unable to export all events: " + err.message);
    }
}

SystemEventController.prototype.selectEvents = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">事件等级</td>';
    html += '<td class="address">事件类型</td>';
    html += '<td class="time">时间</td>';
    html += '<td class="address">内容</td>';
    html += '<td class="address">状态</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_SYS_EVENT_LIST + "?page=" + pageIndex;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
            ;
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        //sourceIp,destinationIp,appLayerProtocol,timestamp,action,status,incidentId
                        html += "<td>" + parent.formatEventLevel(result.rows[i][0]) + "</td>";
                        html += "<td>" + parent.formatEventType(result.rows[i][1]) + "</td>";
                        html += "<td>" + FormatterManager.formatToLocaleDateTime(result.rows[i][2]) + "</td>";
                        html += "<td>" + result.rows[i][3] + "</td>";
                        if (result.rows[i][4] == 0) {
                            html += "<td><button class='details' data-key='" + result.rows[i][5] + "' >" + parent.formatReadStatus(result.rows[i][4]) + "</button></td>";
                        }
                        else {
                            html += "<td>" + parent.formatReadStatus(result.rows[i][4]) + "</td>";
                        }
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='5'>暂无数据</td></tr>";
                    ;
                }
            }
            else {
                html += "<tr><td colspan='5'>暂无数据</td></tr>";
                ;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pEventController.pTotalSystemEvent).text(result.total);
                $(parent.pLblTotalEvent).text(result.total);
            }
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);

            $(parent.pTdEventList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                parent.flagSingleEvent($(this), id);

            });

            if (parent.pEventPager == null) {
                parent.pEventPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectEvents(pageIndex);
                });
                parent.pEventPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        ;
        $(this.pTdEventList).html(html);
        console.error("ERROR - SystemEventController.selectEvents() - Unable to get all events: " + err.message);
    }
}

SystemEventController.prototype.searchEvents = function (pageIndex, filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">事件等级</td>';
    html += '<td class="address">事件类型</td>';
    html += '<td class="time">时间</td>';
    html += '<td class="address">内容</td>';
    html += '<td class="address">状态</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].SEARCH_SYS_EVENT + filter + "page=" + pageIndex;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
            ;
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        //sourceIp,destinationIp,appLayerProtocol,timestamp,action,status,incidentId
                        html += "<td>" + parent.formatEventLevel(result.rows[i][0]) + "</td>";
                        html += "<td>" + parent.formatEventType(result.rows[i][1]) + "</td>";
                        html += "<td>" + FormatterManager.formatToLocaleDateTime(result.rows[i][2]) + "</td>";
                        html += "<td>" + result.rows[i][3] + "</td>";
                        if (result.rows[i][4] == 0) {
                            html += "<td><button class='details' data-key='" + result.rows[i][5] + "' >" + parent.formatReadStatus(result.rows[i][4]) + "</button></td>";
                        }
                        else {
                            html += "<td>" + parent.formatReadStatus(result.rows[i][4]) + "</td>";
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
                $(parent.pEventController.pTotalSystemEvent).text(result.total);
                $(parent.pLblTotalEvent).text(result.total);
            }
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);

            $(parent.pTdEventList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                parent.flagSingleEvent($(this), id);

            });


            if (parent.pEventPager == null) {
                parent.pEventPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.searchEvents(pageIndex, parent.pFilters);
                });
                parent.pEventPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        $(this.pTdEventList).html(html);
        console.error("ERROR - SystemEventController.selectEvents() - Unable to search safe events via filter: " + err.message);
    }
}

SystemEventController.prototype.flagSingleEvent = function (obj, id) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].FLAG_SYS_EVENT + "?recordid=" + id;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("设置已读成功", {icon: 6});
                        obj.parent().html("已读");
                        parent.pEventController.setSysEventNum();
                        break;
                    default:
                        layer.alert("设置已读失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("设置已读失败", {icon: 5});
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - SystemEventController.flagSingleEvent() - Unable to set event to read status: " + err.message);
    }
}

SystemEventController.prototype.formatEventLevel = function (status) {
    try {
        switch (status) {
            case 0:
                return "信息";
            case 1:
                return "警告";
            case 3:
                return "信息和警告";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

SystemEventController.prototype.formatReadStatus = function (status) {
    try {
        switch (status) {
            case 1:
                return "已读";
            case 0:
                return "未读";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

SystemEventController.prototype.formatEventType = function (v) {
    try {
        switch (v) {
            case 0:
                return "设备状态";
            case 1:
                return "接口状态";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}

/*
SystemEventController.prototype.formatEventContent = function (v) {
    try {
        switch ($.trim(v)) {
            case "all":
                return "所有内容";
            case "link":
                return "连接";
            case "unlink":
                return "未连接";
            case "p0 up,p1 up":
                return "P0连接,P1连接";
            case "p0 up,p1 down":
                return "P0连接,P1未连接";
            case "p0 down,p1 up":
                return "P0未连接,P1连接";
            case "p0 down,p1 down":
                return "P0未连接,P1未连接";
            default:
                return v;
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}
*/

SystemEventController.prototype.formatFilter = function () {
    try {
        this.pFilters = "";
        this.pFilters += "?status=&level=&";
        this.pFilters += "content=" + decodeURI($.trim($(this.pTxtEventContent).val())) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

SystemEventController.prototype.clearFilter = function () {
    try {
        $(this.pTxtEventContent).val("");
        $(".rule-single-select").ruleSingleSelect();
        $(this.pTxtStartDateTime).val("");
        $(this.pTxtEndDateTime).val("");
    }
    catch (err) {
        console.error("ERROR - SystemEventController.clearFilter() - Unable to clear filter for searching: " + err.message);
    }
}
ContentFactory.assignToPackage("kea.base.SystemEventController", SystemEventController);

