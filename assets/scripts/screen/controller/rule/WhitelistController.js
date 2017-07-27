function WhitelistController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isAllChecked = false;
    this.allRules = [];
    this.checkedRules = [];

    this.pBtnDisable = "#" + this.elementId + "_btnDisable";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
    this.pBtnEmpty = "#" + this.elementId + "_empty";
    this.pChkAll = "#" + this.elementId + "_chkAll";
    this.pBtnStudy = "#" + this.elementId + "_btnStudy";
    this.pTxtStartDatetime = "#" + this.elementId + "_txtStartDateTime";
    this.pDdlStudyDurtion = "#" + this.elementId + "_ddlStudyDurtion";
    this.pDivSlider = "#" + this.elementId + "_divSlider";
    this.pDivProgressbar = "#" + this.elementId + "_divProgressbar";

    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pTdWhitelist = "#" + this.elementId + "_tdWhitelistList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pDetailsPagerContent = "#" + this.elementId + "_details_pagerContent";
    this.pDllEvent = "#" + this.elementId + "_dllEventAll";
    this.pLblTotalWhitelist1 = "#" + this.elementId + "_lblTotalWhitelist1";
    this.pLblTotalWhitelist2 = "#" + this.elementId + "_lblTotalWhitelist2";
    this.pDdlFilter = "#" + this.elementId + "_ddlFilter";
    this.studyTimer = null;

    this.pWhitelistPager = null;
    this.pDetailsWhitelistPager = null;
    this.pDetailViewHandle = null;
    this.pDetailproto = null;
    this.pDetailmac = null;
    this.pDetailid = null;
    this.pExpand = false;
    this.pCurrentPageIndex = 1;

    this.pIsRefresh = 1;//是否是第一次进入页面，默认是第一次

    this.protocal = ['unknown', 'profinet', 'modbus', 'opcda', 'dnp3', 'iec104', 'mms', 'opcua_tcp', 'ENIP-TCP', 'snmp', 'ENIP-UDP', 's7', 'ENIP-IO', 'hexagon', 'goose', 'sv', 'pnrtdcp'];
}

WhitelistController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_WHITELIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - WhitelistController.init() - Unable to initialize: " + err.message);
    }
}

WhitelistController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pDivSlider).css("display", "none");

        $(".rule-single-select").ruleSingleSelect();

        $(this.pChkAll).on("click", function () {
            parent.isAllChecked = ($(this).attr("isChecked") == "true");
            $(parent.pTdWhitelist).find("input:checkbox").prop("checked", parent.isAllChecked);
            if (parent.isAllChecked) {
                parent.checkedRules = parent.allRules.slice(0);
                $(this).text("取消");
                $(this).removeClass("but_off");
                $(this).addClass("but_all");
                $(this).attr("isChecked", "false");
            }
            else {
                parent.checkedRules = [];
                $(this).text("全选");
                $(this).removeClass("but_all");
                $(this).addClass("but_off");
                $(this).attr("isChecked", "true");
            }
        });

        $(this.pBtnEnable).on("click", function () {
            parent.updateWhitelist(parent.checkedRules, 1);
        });
        $(this.pBtnEmpty).on("click", function () {
            parent.updateWhitelist([], 1);
        });

        $(this.pBtnDisable).on("click", function () {
            parent.updateWhitelist(parent.checkedRules, 0);
        });

        $(this.pTxtStartDatetime).on("click", function () {
            var startTime = $(".systemtime>p").text();
            if (!$(this).val()) {
                var startTime_temp = FormatterManager.formatDateTime(new Date(startTime).getTime() + 20000, 'yyyy-MM-dd HH:mm:ss');
                $(this).val(startTime_temp);
            }
            return WdatePicker({
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                minDate: '#F{$dp.$DV(\'' + startTime + '\');}'
            });
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.checkedRules = [];
            $(parent.pChkAll).text("全选").removeClass("but_all").addClass("but_off").attr("isChecked", "true");
            parent.pWhitelistPager = null;
            parent.selectWhitelist(1);
        });
        $(this.pDllEvent).on("change", function () {
            parent.updateWhitelistEvent($(this).val());
        });
        $(this.pDdlFilter).on("change", function () {
            parent.pWhitelistPager = null
            parent.selectWhitelist(1);
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.initControls() - Unable to initialize control: " + err.message);
    }
}

WhitelistController.prototype.load = function () {
    try {
        var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
        if (beginnerGuide != "1") {
            this.getStudyStatus();
            this.selectWhitelist(1);
        }
        else {
            this.setupSlider();
        }
    }
    catch (err) {
        console.error("ERROR - WhitelistController.load() - Unable to load: " + err.message);
    }
}

WhitelistController.prototype.getStudyStatus = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_WHITELIST_STUDY_STATU;
        var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
        if (beginnerGuide == "1") {
            link = APPCONFIG["default"].ID2URL["START_WHITELIST_STUDY"];
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.setupSlider();
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined" && typeof (result.start) != "undefined") {
                switch (result.status) {
                    case 1:
                        if (result.state == 1) {
                            if (beginnerGuide == "1") {
                                result.start = $(parent.pTxtStartDatetime).val();
                                result.dur = 5;
                            }
                            var starttime = new Date(result.start.replace(/-/g, '/'));
                            var systime = new Date($(".systemtime>p").text().replace(/-/g, '/'));
                            var duration = systime.getTime() - starttime.getTime();
                            if (duration > 0) {
                                var percent = Math.floor(duration / (result.dur * 60 * 1000) * 100);
                                if (percent >= 100) {
                                    parent.setupSlider();
                                }
                                else {
                                    parent.setupProgressbar(duration, result.dur * 60 * 1000, starttime);//单位：毫秒
                                }
                            }
                            else {
                                parent.setupProgressbar(duration, result.dur * 60 * 1000, starttime);//单位：毫秒
                            }
                        }
                        else {
                            parent.setupSlider();//单位：毫秒
                        }
                        break;
                    default:
                        layer.alert("获取学习状态失败", {icon: 5});
                        parent.setupSlider();
                        break;
                }
            }
            else {
                parent.setupSlider();
                layer.alert("获取学习状态失败", {icon: 5});
            }
        });
    }
    catch (err) {
        parent.setupSlider();
        console.error("ERROR - WhitelistController.getStudyStatus() - Unable to get study status: " + err.message);
    }
}

WhitelistController.prototype.setupSlider = function () {
    var parent = this;
    $(this.pDivSlider).css("display", "block");
    $(this.pDivProgressbar).css("display", "none");
    $(".arrowsbox.pos-arrows02").css("display", "none");
    $(this.pBtnStudy).removeClass("but_stopstudy").addClass("but_beginstudy").text("开始学习").unbind("click");
    $(this.pBtnStudy).on("click", function () {
        parent.startStudyWhitelist();
    });
}

WhitelistController.prototype.setupProgressbar = function (duration, total, starttime) {
    var parent = this;
    $(this.pDivSlider).css("display", "none");
    $(this.pDivProgressbar).css("display", "block");
    $(this.pBtnStudy).removeClass("but_beginstudy").addClass("but_stopstudy").text("停止学习").unbind("click");
    var progressbar = $("#progressbar");
    progressLabel = $(".progress-label");
    var label = "剩余学习时间:";
    var studyedTime = duration;
    if (duration < 0) {
        label = "距离开始时间:";
        studyedTime = 0;
    }
    progressbar.progressbar({
        value: studyedTime / total * 100,
        max: 100,
        min: 0,
        change: function () {
            var date = progressLabel.text().split(":");
            var hours = parseInt(date[1]);
            var minutes = parseInt(date[2]);
            var seconds = parseInt(date[3]);
            var milliseconds = seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000 - 1000;
            var displayTime = FormatterManager.formatMilliseconds(milliseconds);
            progressLabel.text(label + displayTime);
        },
        complete: function () {
            clearInterval(parent.studyTimer);
            parent.setupSlider();
            parent.selectWhitelist(1);
        }
    });
    if (duration < 0) {
        progressLabel.text(label + FormatterManager.formatMilliseconds(-1 * duration));
    }
    else {
        progressLabel.text(label + FormatterManager.formatMilliseconds(total - duration));
    }

    parent.studyTimer = setInterval(function progress() {
        if (duration < 0) {
            var date = progressLabel.text().split(":");
            var hours = parseInt(date[1]);
            var minutes = parseInt(date[2]);
            var seconds = parseInt(date[3]);
            if (hours == 0 && minutes == 0 && seconds == 0) {
                duration = 0;
                clearInterval(parent.studyTimer);
                parent.getStudyStatus();
            }
            else {
                var milliseconds = seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000 - 1000;
                var displayTime = FormatterManager.formatMilliseconds(milliseconds);
                progressLabel.text(label + displayTime);
            }
        }
        else {
            var val = $("#progressbar").progressbar("option", "value");
            var curDatetime = new Date($(".systemtime>p").text().replace(/-/g, '/'));
            if (starttime < curDatetime) {
                $("#progressbar").progressbar("option", "value", val + 1000 / total * 100);
                if (val == 100) {
                    clearInterval(parent.studyTimer);
                }
            }
        }
    }, 1000);
    $(this.pBtnStudy).on("click", function () {
        clearInterval(parent.studyTimer);
        parent.stopStudyWhitelist();
    });
}
//未用
WhitelistController.prototype.updateWhitelistAll = function (status) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_WHITELIST_STUDY_ALL + "?state=" + status;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", {icon: 6});
                        break;
                    default:
                        layer.alert("操作失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("操作失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.updateWhitelist() - Unable to disable/enable whitelist: " + err.message);
    }
}

WhitelistController.prototype.updateWhitelist = function (sids, status) {
    try {
        var parent = this;
        if (status == 0 && !sids.length) {
            layer.alert("当前未选择规则，不能进行删除操作");
            return;
        }
        var link = APPCONFIG["default"].UPDATE_WHITELIST_STUDY;
        var loadIndex = layer.load(2);
        var data = {"status": status, "sids": sids.join(",")};
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
                        $(parent.pBtnRefresh).trigger("click");
                        layer.alert("操作成功", {icon: 6});
                        break;
                    case 2:
                        layer.alert("白名单正在学习中...请稍后操作.", {icon: 5});
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
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.updateWhitelist() - Unable to disable/enable whitelist: " + err.message);
    }
}

WhitelistController.prototype.startStudyWhitelist = function () {
    try {
        var parent = this;
        var starttime = $(this.pTxtStartDatetime).val();
        var curDatetime = new Date($(".systemtime>p").text().replace(/-/g, '/'));
        var dur = $(this.pDdlStudyDurtion + " option:selected").val();
        if ($.trim(starttime) == "") {
            layer.alert("请选择开始时间", {icon: 5});
            return;
        }
        if (new Date($.trim(starttime).replace(/-/g, '/')) < curDatetime) {
            layer.alert("开始学习时间必须在系统时间之后", {icon: 5});
            return;
        }
        var link = APPCONFIG["default"].START_WHITELIST_STUDY;
        var data = {"start": starttime, "dur": dur};
        var promise = URLManager.getInstance().ajaxCallByURL(link, 'POST', data, true);
        var loadIndex = layer.load(2);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            layer.close(loadIndex);
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.getStudyStatus();
                        break;
                    default:
                        layer.alert("开始学习设置失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("开始学习设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.startStudyWhitelist() - Unable to start study rule: " + err.message);
    }
}

WhitelistController.prototype.stopStudyWhitelist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].STOP_WHITELIST_STUDY;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.selectWhitelist(1);
                        parent.getStudyStatus();
                        break;
                    default:
                        layer.alert("停止学习设置失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("停止学习设置失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.stopStudyWhitelist() - Unable to stop study rule: " + err.message);
    }
}

WhitelistController.prototype.selectWhitelist = function (pageIndex) {
    var parent = this;
    var loadIndex = layer.load(2);
    var html = '';
    try {
        html += '<tr class="title">';
        html += '<td class="address" style="width:4%"><input type="checkbox" id="chkWhitelistPage" data-key="0"/></td>';
        html += '<td class="address" style="width:4%">序号</td>';
        html += '<td class="address" style="width:8%">规则名</td>';
        html += '<td class="address" style="width:8%">源地址</td>';
        html += '<td class="address" style="width:8%">目的地址</td>';
        html += '<td class="address" style="width:8%">应用协议</td>';
        html += '<td class="address" style="width:15%">操作码</td>';
        html += '<td class="address" style="width:8%">事件等级</td>';
        html += '<td class="address" style="width:8%">创建时间</td>';
        html += '<td class="IPaddress" style="width:8%">事件处理</td>';
        html += '<td class="address" style="width:8%">启用状态</td>';
        html += '</tr>';
        var filter = $(parent.pDdlFilter + " option:selected").val();
        var link = APPCONFIG["default"].GET_WHITELIST_RULE + "?page=" + pageIndex + "&pageIsRefresh=" + parent.pIsRefresh;
        if (filter != "") {
            link += "&status=" + filter;
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='11'>暂无数据</td></tr>";
        });
        promise.done(function (result) {
            if (typeof (result.rows) != "undefined" && result.rows.length > 0) {
                parent.pIsRefresh = 0;
                for (var i = 0; i < result.rows.length; i++) {
                    html += "<tr>";
                    html += '<td><input type="checkbox" data-key="' + result.rows[i][3] + '" /></td>';
                    html += "<td>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                    html += "<td style='text-align: left'>" + FormatterManager.stripText(result.rows[i][0], 30) + "</td>";
                    html += "<td>" + result.rows[i][5] + "</td>";
                    html += "<td>" + result.rows[i][6] + "</td>";
                    html += "<td>" + result.rows[i][9] + "</td>";
                    html += "<td style='text-align:left;' title='" + result.rows[i][1] + "'>" + FormatterManager.stripText(result.rows[i][1], 20) + "</td>";
                    html += "<td>中</td>";
                    html += "<td>" + result.rows[i][7] + "</td>";
                    if (result.rows[i][4] == 0) {
                        html += "<td ><select class='select-note' data-key='" + result.rows[i][3] + "'><option selected='selected'  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>丢弃</option><option value='3'>阻断</option></select></td>";
                    }
                    else if (result.rows[i][4] == 1) {
                        html += "<td ><select class='select-note' data-key='" + result.rows[i][3] + "'><option  value='0'>通过</option> <option selected='selected' value='1'>警告</option><option value='2'>丢弃</option><option value='3'>阻断</option></select></td>";
                    }
                    else if (result.rows[i][4] == 2) {
                        html += "<td ><select class='select-note' data-key='" + result.rows[i][3] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option value='2' selected='selected'>丢弃</option><option   value='3'>阻断</option></select></td>";
                    }
                    else if (result.rows[i][4] == 3) {
                        html += "<td ><select class='select-note' data-key='" + result.rows[i][3] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>丢弃</option><option selected='selected'  value='3'>阻断</option></select></td>";
                    }
                    if (result.rows[i][2] == 1) {
                        html += "<td style='text-align:center;color: #1ca826;'>启用</td>";
                    } else {
                        html += "<td style='text-align:center'>未启用</td>";
                    }
                    html += "</tr>";
                }
            }
            else {
                html += "<tr><td colspan='11'>暂无数据</td></tr>";
            }
            $(parent.pTdWhitelist).html(html);

            if (typeof (result.alllist) != "undefined") {
                parent.allRules = result.alllist;
                $(parent.pLblTotalWhitelist2).text(result.alllist.length);
                $(parent.pLblTotalWhitelist1).text(result.checklist.length);
            }

            layer.close(loadIndex);

            $(parent.pTdWhitelist).find("select").each(function () {
                $(this).change(function () {
                    var id = $(this).attr("data-key");
                    var value = $(this).val();
                    var link = APPCONFIG["default"].UPDATE_WHITELIST_EVENT + "?action=" + value + "&sid=" + id;
                    var promise = URLManager.getInstance().ajaxCall(link);
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

            //判断是否选择
            $(parent.pTdWhitelist).find("input:checkbox").each(function () {
                var id = $(this).attr("data-key");
                var isExits = $.inArray(id, parent.checkedRules);
                if (isExits >= 0) {
                    $(this).prop("checked", true);
                }
            });
            //当前页全选按钮
            $(parent.pTdWhitelist).find("#chkWhitelistPage").on("change", function () {
                var checked = $(this).prop("checked");
                $(parent.pTdWhitelist).find("input:checkbox").prop("checked", checked);
                $(parent.pTdWhitelist).find("input:checkbox").each(function () {
                    var id = $(this).attr("data-key");
                    if (checked && id != "0") {
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
            $(parent.pTdWhitelist).find("input:checkbox").on("change", function () {
                var checked = $(this).prop("checked");
                var id = $(this).attr("data-key");
                if (checked) {
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

            if (parent.pWhitelistPager == null) {
                //parent.checkedRules = result.checklist;
                parent.allRules = result.alllist;
            }

            if (parent.pWhitelistPager == null) {
                parent.pWhitelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectWhitelist(pageIndex);
                    parent.pCurrentPageIndex = pageIndex;
                });
                parent.pWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='6'>暂无数据</td></tr>";
        $(parent.pTdWhitelist).html(html);
        console.error("ERROR - KnowWhitelistController.getWhitelist() - Unable to get rule information: " + err.message);
    }
}

WhitelistController.prototype.updateWhitelistEvent = function (operationId) {
    try {
        var parent = this;
        if (!operationId) return;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_WHITELIST_ALLEVENT + "?action=" + operationId;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdWhitelist).find("select").val(operationId).attr("selected", true);
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
        console.error("ERROR - WhitelistController.updateWhitelistEvent() - Unable to update whitelist event: " + err.message);
    }
}
//获取所有ID和已部署ID
WhitelistController.prototype.getWhitelistTotal = function () {
    var parent = this;
    try {
        var link = APPCONFIG["default"].GET_WHITELIST_TOTAL;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result.checklist) != "undefined" && typeof (result.alllist) != "undefined") {
                parent.allRules = result.alllist;
                $(parent.pLblTotalWhitelist2).text(result.alllist.length);
                $(parent.pLblTotalWhitelist1).text(result.checklist.length);
            }
            else {
                parent.allRules = [];
                $(parent.pLblTotalWhitelist2).text(0);
                $(parent.pLblTotalWhitelist1).text(0);
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.getWhitelistTotal() - Unable to get rule total: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.WhitelistController", WhitelistController);

