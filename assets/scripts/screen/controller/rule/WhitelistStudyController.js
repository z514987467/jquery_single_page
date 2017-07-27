function WhitelistStudyController(controller, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnDisable = "#" + this.elementId + "_btnDisable";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
    this.pBtnDisableAll = "#" + this.elementId + "_btnDisableAll";
    this.pBtnEnableAll = "#" + this.elementId + "_btnEnableAll";
    this.pBtnStudy = "#" + this.elementId + "_btnStudy";
    this.pTxtStartDatetime = "#" + this.elementId + "_txtStartDateTime";
    this.pTxtStudyDur = "#" + this.elementId + "_txtStudyDur";
    this.pDivSlider = "#" + this.elementId + "_divSlider";
    this.pDivProgressbar = "#" + this.elementId + "_divProgressbar";

    this.pTdWhitelist = "#" + this.elementId + "_tdWhitelistList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pDetailsPagerContent = "#" + this.elementId + "_details_pagerContent";
    this.pLblStudyRuleCount = "#" + this.elementId + "_lblStudyRuleCount";

    this.pWhitelistPager = null;
    this.pDetailsWhitelistPager = null;
    this.pWhitelistController = controller;

    this.protocal = ['unknown', 'dcerpcudp', 'modbus', 'dcerpc', 'dnp3', 'iec104', 'mms', 'opcua_tcp', 'ENIP-TCP', 'snmp', 'ENIP-UDP', 's7', 'ENIP-IO', 'hexagon', 'goose', 'sv'];
}

WhitelistStudyController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_WHITELIST_STUDY), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.init() - Unable to initialize: " + err.message);
    }
}

WhitelistStudyController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pDivSlider).css("display", "none");

        $(this.pBtnDisableAll).on("click", function () {
            parent.updateWhitelistAll(0);
        });

        $(this.pBtnEnableAll).on("click", function () {
            parent.updateWhitelistAll(1);
        });

        $(this.pBtnEnable).on("click", function () {
            var sids = []
            $(parent.pTdWhitelist).find(".chktmp:checked").each(function () {
                var id = $(this).attr("data-key");
                sids.push(id);
            });
            parent.updateWhitelist(sids, 1);
        });

        $(this.pBtnDisable).on("click", function () {
            var sids = [];
            $(parent.pTdWhitelist).find(".chktmp:checked").each(function () {
                var id = $(this).attr("data-key");
                sids.push(id);
            });
            parent.updateWhitelist("[" + sids.join(",") + "]", 0);
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.initControls() - Unable to initialize control: " + err.message);
    }
}

WhitelistStudyController.prototype.load = function () {
    try {
        this.getStudyStatus();
        this.selectWhitelist(1);
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.load() - Unable to load: " + err.message);
    }
}

WhitelistStudyController.prototype.getStudyStatus = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_WHITELIST_STUDY_STATU;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.setupSlider();
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined" && typeof (result.start) != "undefined") {
                switch (result.status) {
                    case 1:
                        if (result.state == 1) {
                            var starttime = new Date(result.start);
                            var systime = new Date($(".systemtime>p").text());
                            var duration = systime.getTime() - starttime.getTime();
                            if (duration > 0) {
                                var percent = Math.floor(duration / (result.dur * 60 * 60 * 1000) * 100);
                                if (percent >= 100) {
                                    parent.setupSlider();
                                }
                                else {
                                    parent.setupProgressbar(duration, result.dur * 60 * 60 * 1000, starttime);//单位：毫秒
                                }
                            }
                            else {
                                parent.setupProgressbar(duration, result.dur * 60 * 60 * 1000, starttime);//单位：毫秒
                            }
                        }
                        else {
                            parent.setupSlider();//单位：毫秒
                        }
                        break;
                    default: layer.alert("获取学习状态失败", { icon: 5 }); parent.setupSlider(); break;
                }
            }
            else {
                parent.setupSlider();
                layer.alert("获取学习状态失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        parent.setupSlider();
        console.error("ERROR - WhitelistStudyController.getStudyStatus() - Unable to get study status: " + err.message);
    }
}

WhitelistStudyController.prototype.setupSlider = function () {
    var parent = this;
    $(this.pDivSlider).css("display", "block");
    $(this.pDivProgressbar).css("display", "none");
    $(this.pBtnStudy).removeClass("but_stopstudy").addClass("but_beginstudy").text("开始学习").unbind("click");
    $(".slider").slider({
        range: "min",
        min: 0,
        max: 100,
        slide: function (event, ui) {
            $(parent.pTxtStudyDur).text(ui.value);
        }
    });
    $(this.pBtnStudy).on("click", function () {
        parent.startStudyWhitelist();
    });
}

WhitelistStudyController.prototype.setupProgressbar = function (duration, total, starttime) {
    var parent = this;
    $(this.pDivSlider).css("display", "none");
    $(this.pDivProgressbar).css("display", "block");
    $(this.pBtnStudy).removeClass("but_beginstudy").addClass("but_stopstudy").text("停止学习").unbind("click");
    var progressbar = $("#progressbar");
    progressLabel = $(".progress-label");
    var studyTimer;
    var label = "剩余学习时间:";
    var studyedTime = duration;
    if (duration < 0)
    {
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
            clearInterval(studyTimer);
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

    studyTimer = setInterval(function progress() {
        if (duration < 0) {
            var date = progressLabel.text().split(":");
            var hours = parseInt(date[1]);
            var minutes = parseInt(date[2]);
            var seconds = parseInt(date[3]);
            if (hours == 0 && minutes == 0 && seconds == 0) {
                duration = 0;
                clearInterval(studyTimer);
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
            var curDatetime = new Date($(".systemtime>p").text());
            if (starttime < curDatetime) {
                $("#progressbar").progressbar("option", "value", val + 1000 / total * 100);
                if (val == 100) {
                    clearInterval(studyTimer);
                }
            }
        }
    }, 1000);
    $(this.pBtnStudy).on("click", function () {
        clearInterval(studyTimer);
        parent.stopStudyWhitelist();
    });
}

WhitelistStudyController.prototype.updateWhitelistAll = function (status) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_WHITELIST_STUDY_ALL + "?state=" + status;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", { icon: 6 });
                        break;
                    default: layer.alert("操作失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("操作失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.updateWhitelist() - Unable to disable/enable whitelist: " + err.message);
    }
}

WhitelistStudyController.prototype.updateWhitelist = function (sids, status) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_WHITELIST_STUDY + "?status=" + status + "&sids=" + sids;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", { icon: 6 });
                        break;
                    default: layer.alert("操作失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("操作失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.updateWhitelist() - Unable to disable/enable whitelist: " + err.message);
    }
}

WhitelistStudyController.prototype.startStudyWhitelist = function () {
    try {
        var parent = this;
        var starttime = $(this.pTxtStartDatetime).val();
        var dur = $(this.pTxtStudyDur).text();
        if ($.trim(starttime) == "")
        {
            layer.alert("请选择开始时间", { icon: 5 });
            return;
        }
        if ($.trim(dur) == "" || $.trim(dur) == "0") {
            layer.alert("请设置学习时间长度", { icon: 5 });
            return;
        }
        var link = APPCONFIG["default"].START_WHITELIST_STUDY + "?start=" + starttime + "&dur=" + dur;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.getStudyStatus();
                        break;
                    default: layer.alert("开始学习设置失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("开始学习设置失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.startStudyWhitelist() - Unable to start study rule: " + err.message);
    }
}

WhitelistStudyController.prototype.stopStudyWhitelist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].STOP_WHITELIST_STUDY;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.getStudyStatus();
                        break;
                    default: layer.alert("停止学习设置失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("停止学习设置失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistStudyController.stopStudyWhitelist() - Unable to stop study rule: " + err.message);
    }
}

WhitelistStudyController.prototype.selectWhitelist = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="list"><input type="checkbox" id="chkWhitelist" /></td>';
    html += '<td class="list" style="width:8%;">序号</td>';
    html += '<td class="devicename" style="width:26%;">设备名称</td>';
    html += '<td class="IPaddress" style="width:14%;">IP地址</td>';
    html += '<td class="IPaddress" style="width:14%;">MAC地址</td>';
    html += '<td class="IPaddress" style="width:12%;">协议</td>';
    html += '<td class="IPaddress" style="width:10%;">风险等级</td>';
    html += '<td class="IPaddress" style="width:10%;">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_WHITELIST_DEVICE + "?page=" + pageIndex;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='8'>暂无数据</td></tr>";;
            $(parent.pTdWhitelist).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += '<td><input type="checkbox" class="chktmp" id="chk' + ((pageIndex - 1) * 10 + i + 1) + '" data-key="' + result.rows[i][0] + '"></td>';
                        html += "<td style='width:8%;'>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                        html += "<td style='width:26%;text-align:left;' title='" + result.rows[i][1] + "'>" + FormatterManager.stripText(result.rows[i][1], 30) + "</td>";
                        html += "<td style='width:14%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:14%;'>" + result.rows[i][3] + "</td>";
                        html += "<td style='width:12%;'>" + parent.protocal[result.rows[i][4]] + "</td>";
                        html += "<td style='width:10%;'>中</td>";
                        html += "<td style='width:10%;'><button class='details' id='" + result.rows[i][0] + "' status='0' mac='" + result.rows[i][3] + "' proto='" + result.rows[i][4] + "'>详情</button>&nbsp;&nbsp;</td>";
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
                $(parent.pLblStudyRuleCount).text(result.total);
            }
            $(parent.pTdWhitelist).html(html);
            layer.close(loadIndex);

            $(parent.pViewHandle).find("#chkWhitelist").on("change", function () {
                $(parent.pTdWhitelist).find("tr>td>input[type='checkbox']").prop("checked", $(this).prop("checked"));
            });

            $(parent.pTdWhitelist).find("button[class='details']").on("click", function (event) {
                var mac = $(this).attr("mac");
                var proto = $(this).attr("proto");
                var id = $(this).attr("id");
                var status = $(this).attr("status");
                if (status == "0") {
                    //var html = "</td></tr>";
                    parent.pDetailsWhitelistPager = null;
                    $(parent.pTdWhitelist).find("button[class='details']").attr("status","0");
                    $(parent.pTdWhitelist).find("td[colspan='8']").parent().remove();
                    var lastTr = $(this).parent().parent();
                    var html='<tr><td colspan="8" style="width:100%;" align="center">';
                    html+='<div class="tabel_div" style="padding:5px 5px;margin-bottom:0px;">';
                    html+='<table style="width:100%;"></table>';
                    html+='</div>';
                    html += "<div class='page' data-id='" + parent.elementId + "_details_pagerContent" + id + "' id='" + parent.elementId + "_details_pagerContent" + id + "'></div>";
                    html+='</td></tr>';
                    var viewHandler=lastTr.after(html).next().find("table");
                    parent.getWhitelistDetails(viewHandler, 1, proto, mac, id);
                    $(this).attr("status", "1");
                }
                else {
                    $(this).parent().parent().next().remove();
                    $(this).attr("status", "0");
                }
            });

            if (parent.pWhitelistPager == null && result.rows.length > 0) {
                parent.pWhitelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectWhitelist(pageIndex);
                });
                parent.pWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='8'>暂无数据</td></tr>";
        $(this.pTdWhitelist).html(html);
        console.error("ERROR - WhitelistStudyController.selectWhitelist() - Unable to get whitelist: " + err.message);
    }
}

WhitelistStudyController.prototype.getWhitelistDetails = function (viewHandler, pageIndex, proto, mac, id) {
    var parent = this;
    var loadIndex = layer.load(2);
    var html = '';
    try {
        html += '<tr class="wtitle">';
        html += '<td><input type="checkbox" id="chkWhitelistDetails' + id + '" /></td>';
        html += '<td style="width:10%;">序号</td>';
        html += '<td style="width:40%;">规则名</td>';
        html += '<td style="width:40%;">操作码</td>';
        html += '</tr>';
        var link = APPCONFIG["default"].GET_WHITELIST_RULE + "?page=" + pageIndex + "&proto=" + proto + "&mac=" + mac;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";
        });
        promise.done(function (result) {
            if (typeof (result.rows) != "undefined" && result.rows.length > 0) {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += '<td><input type="checkbox" id="chkDetails' + ((pageIndex - 1) * 10 + i + 1) + '" /></td>';
                        html += "<td style='width:10%;'>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                        html += "<td style='width:40%;' title='" + result.rows[i][0] + "'>" + FormatterManager.stripText(result.rows[i][0], 30) + "</td>";
                        html += "<td style='width:40%;text-align:left;'>" + result.rows[i][1] + "</td>";
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

            viewHandler.html(html);

            layer.close(loadIndex);
            $(viewHandler).find("#chkWhitelistDetails" + id).on("change", function () {
                $(viewHandler).find("input:checkbox").prop("checked", $(this).prop("checked"));
            });

            if (parent.pDetailsWhitelistPager == null) {
                parent.pDetailsWhitelistPager = new kea.base.utility.PagerController($(parent.pDetailsPagerContent + id), parent.elementId + "_details", 10, result.total, function (pageIndex, filters) {
                    parent.getWhitelistDetails(viewHandler, pageIndex, proto, mac, id);
                });
                parent.pDetailsWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER2);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";
        viewHandler.html(html);
        console.error("ERROR - KnowWhitelistController.getWhitelistDetails() - Unable to get rule information: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.WhitelistStudyController", WhitelistStudyController);

