function SafeEventController(eventController, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnSetRead = "#" + this.elementId + "_btnSetRead";
    this.pBtnClear = "#" + this.elementId + "_btnClear";
    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pBtnFilter = "#" + this.elementId + "_btnFilter";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";
    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pDivFilter = "#" + this.elementId + "_divFilter";

    this.pTxtKeywords = "#" + this.elementId + "_txtKeywords";
    this.pTxtSourceIP = "#" + this.elementId + "_txtSourceIP";
    this.pTxtDestinationIP = "#" + this.elementId + "_txtDestinationIP";
    this.pTxtProtocol = "#" + this.elementId + "_txtProtocol";
    this.pTxtStartDateTime = "#" + this.elementId + "_txtStartDateTime";
    this.pTxtEndDateTime = "#" + this.elementId + "_txtEndDateTime";
    this.pTxtHierarchy = "#" + this.elementId + "_txthierarchy";
    this.pTxtStatus = "#" + this.elementId + "_txtstatus";

    this.pTdEventList = "#" + this.elementId + "_tdEventList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalEvent = "#" + this.elementId + "_lblTotalEvent";

    this.pLblEventLevel = "#" + this.elementId + "_dialog_lblEventLevel";
    this.pLblRiskLevel = "#" + this.elementId + "_dialog_lblRiskLevel";
    this.pLblEventType = "#" + this.elementId + "_dialog_lblEventType";
    this.pLblEventDate = "#" + this.elementId + "_dialog_lblEventDate";
    this.pLblEventTime = "#" + this.elementId + "_dialog_lblEventTime";
    this.pLblApplicationProtocol = "#" + this.elementId + "_dialog_lblApplicationProtocol";
    this.pLblNetworkProtocol = "#" + this.elementId + "_dialog_lblNetworkProtocol";
    this.pLblEventRemark = "#" + this.elementId + "_dialog_lblEventRemark";
    this.pLblProtocolContent = "#" + this.elementId + "_dialog_lblProtocolContent";
    this.pLblRuleContent = "#" + this.elementId + "_dialog_lblRuleContent";
    this.pLblEventContent = "#" + this.elementId + "_dialog_lblEventContent";
    this.pLblEventSize = "#" + this.elementId + "_dialog_lblEventSize";

    this.pEventPager = null;
    this.pEventController = eventController;
    this.pFilters = "";
}

SafeEventController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SAFE), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - SafeEventController.init() - Unable to initialize: " + err.message);
    }
}

SafeEventController.prototype.initControls = function () {
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
            $(".rule-single-select").ruleSingleSelect();
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
        console.error("ERROR - SafeEventController.initControls() - Unable to initialize control: " + err.message);
    }
}

SafeEventController.prototype.load = function () {
    try {
        this.selectEvents(1);
    }
    catch (err) {
        console.error("ERROR - SafeEventController.load() - Unable to load: " + err.message);
    }
}

SafeEventController.prototype.flagEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].FLAG_SAFE_EVENT_LIST;
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
                        parent.pEventController.setSafeEventNum();
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
        console.error("ERROR - SafeEventController.flagEvent() - Unable to set all events to read status: " + err.message);
    }
}

SafeEventController.prototype.clearEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_SAFE_EVENT_LIST;
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
                        parent.pEventController.setSafeEventNum();
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
        console.error("ERROR - SafeEventController.clearEvent() - Unable to clear all events: " + err.message);
    }
}

SafeEventController.prototype.exportEvent = function (filter) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_SAFE_EVENT + filter;
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
                        window.open(APPCONFIG["default"].SAFE_EVENT_FILEPATH + result.filename);
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
        console.error("ERROR - SafeEventController.exportEvent() - Unable to export all events: " + err.message);
    }
}

SafeEventController.prototype.selectEvents = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">源地址</td>';
    html += '<td class="address">目的地址</td>';
    html += '<td class="address">协议</td>';
    html += '<td class="time">时间</td>';
    html += '<td class="address">事件等级</td>';
    html += '<td class="address">风险等级</td>';
    html += '<td class="address">状态</td>';
    html += '<td>操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_SAFE_EVENT_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='7'>暂无数据</td></tr>";
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        //sourceIp,destinationIp,appLayerProtocol,timestamp,action,status,incidentId
                        html += "<td>" + result.rows[i][0] + "</td>";
                        html += "<td>" + result.rows[i][1] + "</td>";
                        if ($.trim(result.rows[i][2]) != "") {
                            html += "<td>" + result.rows[i][2] + "</td>";
                        } else {
                            html += "<td>UNKOWN</td>";
                        }
                        html += "<td>" + FormatterManager.formatToLocaleDateTime(result.rows[i][3]) + "</td>";
                        if (result.rows[i][4] == 0) {
                            html += "<td>通过</td>";
                        }
                        else if (result.rows[i][4] == 1) {
                            html += "<td>警告</td>";
                        }
                        else if (result.rows[i][4] == 3) {
                            html += "<td>阻断</td>";
                        }
                        else if (result.rows[i][4] == 2) {
                            html += "<td>丢弃</td>";
                        }
                        html += "<td>" + parent.formatRiskLevel(result.rows[i][5]) + "</td>";
                        html += "<td>" + parent.formatReadStatus(result.rows[i][6]) + "</td>";
                        html += "<td><button class='details' data-key='" + result.rows[i][7] + "'>详情</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='8'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='8'>暂无数据</td></tr>";
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pEventController.pTotalSafeEvent).text(result.total);
                $(parent.pLblTotalEvent).text(result.total);
            }
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
            $(parent.pTdEventList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                var $tr = $(this).parent().prev();
                var dialogTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SAFE_DIALOG), {
                    elementId: parent.elementId + "_dialog"
                });
                var width = parent.pEventController.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                var height = $(window).height() - parent.pEventController.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                layer.open({
                    type: 1,
                    title: "事件信息",
                    area: [width, height],
                    offset: ["82px", "200px"],
                    shade: [0.5, '#393D49'],
                    content: dialogTemplate,
                    success: function (layero, index) {
                        parent.getEventDetails(layero, id, $tr);
                        $(window).on("resize", function () {
                            var pwidth = parent.pEventController.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                            var pheight = $(window).height() - parent.pEventController.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                            layero.width(pwidth);
                            layero.height(pheight);
                        })
                    }
                });

            });


            if (parent.pEventPager == null) {
                parent.pEventPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex) {
                    parent.selectEvents(pageIndex);
                });
                parent.pEventPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='7'>暂无数据</td></tr>";
        $(this.pTdEventList).html(html);
        console.error("ERROR - SafeEventController.selectEvents() - Unable to get all events: " + err.message);
    }
}

SafeEventController.prototype.searchEvents = function (pageIndex, filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">源地址</td>';
    html += '<td class="address">目的地址</td>';
    html += '<td class="address">协议</td>';
    html += '<td class="time">时间</td>';
    html += '<td class="address">事件等级</td>';
    html += '<td class="address">风险等级</td>';
    html += '<td class="address">状态</td>';
    html += '<td>操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SEARCH_SAFE_EVENT + filter + "page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='7'>暂无数据</td></tr>";
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        //sourceIp,destinationIp,appLayerProtocol,timestamp,action,status,incidentId
                        html += "<td>" + result.rows[i][0] + "</td>";
                        html += "<td>" + result.rows[i][1] + "</td>";
                        html += "<td>" + result.rows[i][2] + "</td>";
                        html += "<td>" + FormatterManager.formatToLocaleDateTime(result.rows[i][3]) + "</td>";
                        if (result.rows[i][4] == 0) {
                            html += "<td>通过</td>";
                        }
                        else if (result.rows[i][4] == 1) {
                            html += "<td>警告</td>";
                        }
                        else if (result.rows[i][4] == 3) {
                            html += "<td>阻断</td>";
                        }
                        else if (result.rows[i][4] == 2) {
                            html += "<td>丢弃</td>";
                        }

                        html += "<td>" + parent.formatRiskLevel(result.rows[i][5]) + "</td>";
                        html += "<td>" + parent.formatReadStatus(result.rows[i][6]) + "</td>";
                        html += "<td><button class='details' data-key='" + result.rows[i][7] + "'>详情</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='7'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='7'>暂无数据</td></tr>";
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pEventController.pTotalSafeEvent).text(result.total);
                $(parent.pLblTotalEvent).text(result.total);
            }
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
            $(parent.pTdEventList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                var $tr = $(this).parent().prev();
                var dialogTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SAFE_DIALOG), {
                    elementId: parent.elementId + "_dialog"
                });
                var width = parent.pEventController.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                var height = $(window).height() - parent.pEventController.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                layer.open({
                    type: 1,
                    title: "事件信息",
                    area: [width, height],
                    offset: ["82px", "210px"],
                    shade: [0.5, '#393D49'],
                    content: dialogTemplate,
                    success: function (layero, index) {
                        parent.getEventDetails(layero, id, $tr);
                        $(window).on("resize", function () {
                            var pwidth = parent.pEventController.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                            var pheight = $(window).height() - parent.pEventController.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                            layero.width(pwidth);
                            layero.height(pheight);
                        })
                    }
                });

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
        html += "<tr><td colspan='7'>暂无数据</td></tr>";
        $(this.pTdEventList).html(html);
        console.error("ERROR - SafeEventController.selectEvents() - Unable to search safe events via filter: " + err.message);
    }
}

SafeEventController.prototype.getEventDetails = function (viewHandler, id, $tr) {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SAFE_DIALOG), {
            elementId: parent.elementId + "_dialog"
        });
        var tmpViewHandle = $("<div />").html(tabTemplate);
        var link = APPCONFIG["default"].GET_SAFE_EVENT + "?recordid=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result.values) != "undefined") {
                parent.flagSingleEvent(id, $tr);
                $(viewHandler).find(parent.pLblEventLevel).text(parent.formatEventLevel(result.values[0]));
                $(viewHandler).find(parent.pLblRiskLevel).text(parent.formatRiskLevel(result.values[1]));
                $(viewHandler).find(parent.pLblEventType).text("安全事件");
                $(viewHandler).find(parent.pLblEventDate).text(FormatterManager.formatDate(result.values[2]));
                $(viewHandler).find(parent.pLblEventTime).text(FormatterManager.formatToLongTime(result.values[2]));
                $(viewHandler).find(parent.pLblApplicationProtocol).text(result.values[3]);
				if(result.values[4]==""){
					$(viewHandler).find(parent.pLblNetworkProtocol).text("UNKOWN");
					
				}else{
					
					$(viewHandler).find(parent.pLblNetworkProtocol).text(result.values[4]);
				}
				//$(viewHandler).find(parent.pLblNetworkProtocol).text(result.values[4]);
                $(viewHandler).find(parent.pLblEventRemark).text(result.values[6] != "(null)" ? result.values[6] : "无");

                $(viewHandler).find(parent.pLblProtocolContent).text(result.values[5]);
                $(viewHandler).find(parent.pLblRuleContent).text(result.values[7]);
                $(viewHandler).find(parent.pLblEventSize).text(result.values[8]);
                $(viewHandler).find(parent.pLblEventContent).text(result.packstr);
            }
        });
    }
    catch (err) {
        console.error("ERROR - SafeEventController.getEventDetails() - Unable to get safe event information: " + err.message);
    }
}

SafeEventController.prototype.flagSingleEvent = function (id, obj) {
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].FLAG_SAFE_EVENT + "?recordindex=" + id;
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
                        parent.pEventController.setSafeEventNum();
                        obj.html("已读");
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
        console.error("ERROR - SafeEventController.flagEvent() - Unable to set event to read status: " + err.message);
    }
}

SafeEventController.prototype.formatReadStatus = function (status) {
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
        console.error("ERROR - SafeEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}
/*kacystart*/
SafeEventController.prototype.formatEventLevel = function (v) {
    try {
        switch (v) {
            case 0:
                return "通过";
            case 1:
                return "警告";
            case 2:
                return "丢弃";
            case 3:
                return "阻断";
            default:
                return "";
        }
    }
    catch (err) {
        console.error("ERROR - SafeEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}
/*kacy end*/
SafeEventController.prototype.formatRiskLevel = function (v) {
    try {
        switch (v) {
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
        console.error("ERROR - SafeEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}

SafeEventController.prototype.formatFilter = function () {
    try {
        this.pFilters = "?action=" + $(this.pTxtHierarchy + " option:selected").val() + "&";
        this.pFilters += "sourceIp=" + $.trim($(this.pTxtSourceIP).val()) + "&";
        this.pFilters += "status=" + $(this.pTxtStatus + " option:selected").val() + "&";
        this.pFilters += "destinationIp=" + $.trim($(this.pTxtDestinationIP).val()) + "&";
        this.pFilters += "appLayerProtocol=" + $.trim($(this.pTxtProtocol).val()) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err) {
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}
SafeEventController.prototype.clearFilter = function () {
    try {
        $(this.pTxtHierarchy).val("");
        $(this.pTxtSourceIP).val("");
        $(this.pTxtStatus).val("");
        $(this.pTxtDestinationIP).val("");
        $(this.pTxtProtocol).val("");
        $(this.pTxtStartDateTime).val("")
        $(this.pTxtEndDateTime).val("")
    }
    catch (err) {
        console.error("ERROR - SafeEventController.clearFilter() - Unable to clear filter for searching: " + err.message);
    }
}
ContentFactory.assignToPackage("kea.base.SafeEventController", SafeEventController);

