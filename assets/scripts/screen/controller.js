function FlowAuditController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pDdlTime1 = "#" + this.elementId + "_ddlTime1";
    this.pDdlTime2 = "#" + this.elementId + "_ddlTime2";
    this.pDdlTime3 = "#" + this.elementId + "_ddlTime3";
    this.pDivLineChart = this.elementId + "_divLineChart";
    this.pDivLeftPieChart = this.elementId + "_divLeftPieChart";
    this.pDivRightPieChart = this.elementId + "_divRightPieChart";

    this.pTdFlowList = "#" + this.elementId + "_tdFlowList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalFlow = "#" + this.elementId + "_lblTotalFlow";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";

    this.pPager = null;
    this.pDetailController = null;

    this.lineChart = null;
    this.leftPieChart = null;
    this.rightPieChart = null;
    this.totalFlowTimer = null;

    this.color = ['#3994d3', '#f98665', '#fac767', '#28daca', '#9569f9', '#e36585'];
}

FlowAuditController.prototype.init = function () {
    try {
        var parent = this;

        var parent = this;
        TemplateManager.getInstance().requestTemplates([
            Constants.TEMPLATES.AUDIT_FLOW_DETAIL],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.init() - Unable to initialize: " + err.message);
    }
}

FlowAuditController.prototype.initShell = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_FLOW), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.initShell() - Unable to initialize: " + err.message);
    }
}

FlowAuditController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();
        
        $(this.pBtnRefresh).on("click", function () {
            parent.pPager = null;
            parent.selectFlow(1);
            parent.leftPieChart = parent.initPieChart(parent.pDivLeftPieChart, parent.selectDeviceFlow());
            parent.rightPieChart = parent.initPieChart(parent.pDivRightPieChart, parent.selectProtocolFlow());
        });

        $(this.pDdlTime1).on("change", function () {
            parent.lineChart = parent.initLineChart(parent.pDivLineChart, parent.selectTotalFlow());
        });

        $(this.pDdlTime2).on("change", function () {
            parent.leftPieChart = parent.initPieChart(parent.pDivLeftPieChart, parent.selectDeviceFlow());
        });

        $(this.pDdlTime3).on("change", function () {
            parent.rightPieChart = parent.initPieChart(parent.pDivRightPieChart, parent.selectProtocolFlow());
        });
        this.lineChart = this.initLineChart(this.pDivLineChart, this.selectTotalFlow());
        this.leftPieChart = this.initPieChart(this.pDivLeftPieChart, parent.selectDeviceFlow());
        this.rightPieChart = this.initPieChart(this.pDivRightPieChart, parent.selectProtocolFlow());
        $(window).resize(function () {
            parent.lineChart.resize();
            parent.leftPieChart.resize();
            parent.rightPieChart.resize();
        });

        clearInterval(this.totalFlowTimer);
        this.totalFlowTimer = setInterval(function () {
            var data = parent.selectSingleTotalFlow();
            var option = parent.lineChart.getOption();
            if (option.yAxis[0].max < Math.ceil(data.y)) {
                option.yAxis[0].max = Math.ceil(data.y);
                parent.lineChart.setOption(option);
            }
            parent.lineChart.addData([
                [
                    0,
                    data.y,
                    false,
                    false,
                    data.x
                ]
            ]);
        }, 20000);
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.initControls() - Unable to initialize control: " + err.message);
    }
}

FlowAuditController.prototype.load = function () {
    try {
        this.pPager = null;
        this.selectFlow(1);
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.load() - Unable to load: " + err.message);
    }
}

FlowAuditController.prototype.selectTotalFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            x: [],
            y: []
        };
        var link = APPCONFIG["default"].GET_TOTAL_FLOW;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                for (var i = 0; i < result.points.length; i++) {
                    data.y.push(result.points[i]);
                }
                for (var i = 0; i < result.timePoints.length; i++) {
                    data.x.push(result.timePoints[i]);
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.selectFlow() - Unable to get all points: " + err.message);
        return data;
    }
}

FlowAuditController.prototype.selectSingleTotalFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = { x: '', y: 0 };
        var link = APPCONFIG["default"].GET_TOTAL_FLOW_POINT;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.point) != "undefined" && typeof (result.timePoint) != "undefined"
                && result.timePoint != "undefined") {
                data.x = result.timePoint;
                data.y = result.point;
            }
        });

        return data;
    }
    catch (err) {
        return data;
        console.error("ERROR - FlowAuditController.selectSingleTotalFlow() - Unable to get single point: " + err.message);
    }
}

FlowAuditController.prototype.selectFlow = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">设备名称</td>';
    html += '<td class="address" style="width:10%;">IP地址</td>';
    html += '<td class="address" style="width:10%;">MAC地址</td>';
    html += '<td class="address" style="width:11.5%;">平均输入速率(1小时)</td>';
    html += '<td class="address style="width:8%;"">平均输出速率(1小时)</td>';
    html += '<td class="address style="width:8%;"">平均流量百分比</td>';
    html += '<td class="address style="width:8%;"">更新时间</td>';
    html += '<td class="address" style="width:8%;">内容</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_FLOW_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='8'>暂无数据</td></tr>";
            $(parent.pTdFlowList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='text-align:left;padding-left:5px;' title='" + result.rows[i][5] + "'>" + FormatterManager.stripText(result.rows[i][5],18) + "</td>";
                        html += "<td style='width:10%;text-align:center;'>" + result.rows[i][0] + "</td>";
                        html += "<td style='width:10%;text-align:center;'>" + result.rows[i][1] + "</td>";
                        html += "<td style='width:10%;text-align:center;'>" + (result.rows[i][2]).toFixed(2) + " Kbps</td>";
                        html += "<td style='width:8%;text-align:center;'>" + (result.rows[i][3]).toFixed(2) + " Kbps</td>";
                        html += "<td style='width:8%;text-align:center;'>" + (result.rows[i][6] * 100).toFixed(2) + "%</td>";
                        html += "<td style='width:8%;'>" + result.rows[i][4] + "</td>";
                        html += "<td style='color:#1ca826;width:8%;'><button class='details' data-key='" + result.rows[i][1] + "'>详情</button></td>";
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
                $(parent.pLblTotalFlow).text(result.total);
            }

            $(parent.pTdFlowList).html(html);
            layer.close(loadIndex);

            $(parent.pTdFlowList).find("button[class='details']").on("click", function () {
                loadIndex = layer.load(2);
                var mac = $(this).attr("data-key");
                var dialogHandler = $("<div />");
                var width = parent.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                var height = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                var openDialog = layer.open({
                    type: 1,
                    title: "设备流量信息",
                    area: [width, height],
                    offset: ["82px", "200px"],
                    shade: [0.5, '#393D49'],
                    content: dialogHandler.html(),
                    success: function (layero, index) {
                        parent.pDetailController = new kea.base.FlowDetailAuditController(layero, parent.elementId + "_dialog", mac, parent);
                        parent.pDetailController.init();
                        layer.close(loadIndex);
                        $(window).on("resize", function () {
                            var pwidth = parent.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                            var pheight = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                            layero.width(pwidth);
                            layero.height(pheight);
                        })
                    },
                    end: function () {
                        if (parent.pDetailController != null && typeof (parent.pDetailController.protocolFlowTimer) != "undefined" && parent.pDetailController.protocolFlowTimer != null) {
                            clearInterval(parent.pDetailController.protocolFlowTimer);
                        }
                    }
                });
            });

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 3, result.total, function (pageIndex, filters) {
                    parent.selectFlow(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='8'>暂无数据</td></tr>";
        $(this.pTdFlowList).html(html);
        console.error("ERROR - FlowAuditController.selectFlow() - Unable to get all events: " + err.message);
    }
}

FlowAuditController.prototype.selectDeviceFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            name: [],
            item: []
        };
        var timeFlag = $(this.pDdlTime2 + " option:selected").val();
        var link = APPCONFIG["default"].GET_DEVICE_TOTAL_FLOW + "?timeDelta=" + timeFlag;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][1] != 0) {
                        var color = parent.color[i];
                        if (result.rows[i][0].toLowerCase() == "others") {
                            color = parent.color[5];
                        }
                        var item = parent.createPieStruct(result.rows[i][0], result.rows[i][1], color);
                        data.name.push(result.rows[i][0]);
                        data.item.push(item);
                    }
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.selectFlow() - Unable to get all events: " + err.message);
        return data;
    }
}

FlowAuditController.prototype.selectProtocolFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            name: [],
            item: []
        };
        var timeFlag = $(this.pDdlTime3 + " option:selected").val();
        var link = APPCONFIG["default"].GET_PROTOCOL_TOTAL_FLOW + "?timeDelta=" + timeFlag;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][1] != 0) {
                        var color = parent.color[i];
                        if (result.rows[i][0].toLowerCase() == "others") {
                            color = parent.color[5];
                        }
                        var item = parent.createPieStruct(result.rows[i][0], result.rows[i][1], color);
                        data.name.push(result.rows[i][0]);
                        data.item.push(item);
                    }
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - FlowAuditController.selectFlow() - Unable to get all events: " + err.message);
        return data;
    }
}

FlowAuditController.prototype.initLineChart = function (id, data) {
    var line = echarts.init(document.getElementById(id));
    var option = {
        calculable: true,
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}Kbps'
        },
        xAxis: [
            {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        type: 'dashed'
                    }
                },
                boundaryGap: false,
                data: data.x
            }
        ],
        yAxis: [
            {
                type: 'value',
                min: 0,
                max: data.y.length==0?1:Math.ceil(Math.max.apply(null, data.y))+1,
                boundaryGap: false,
                axisLabel: {
                    formatter: function (v) {
                        if (v == 0) {
                            return v;
                        }
                        return v.toFixed(1);
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        type: 'dashed'
                    }
                }
            }
        ],
        series: [
            {
                type: 'line',
                symbol: 'none',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            color: '#56c2f7'
                        },
                        lineStyle: {
                            color: '#67c5f1',
                            type: 'dashed'
                        }
                    }
                },
                data: data.y
            }
        ]
    };

    line.setOption(option);

    return line;
}

FlowAuditController.prototype.initPieChart = function (id, data) {
    var parent = this;
    var pie = echarts.init(document.getElementById(id));
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{d}%"
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            data: data.name
        },
        calculable: true,
        series: [
            {
                name: 'pie',
                type: 'pie',
                radius: ['50%', '80%'],
                center: ['40%', '50%'],
                data: data.item
            }
        ]
    };

    pie.setOption(option);

    return pie;
}

FlowAuditController.prototype.createPieStruct = function (name, value, color) {
    return {
        name: name,
        value: value,
        itemStyle: {
            normal:
                {
                    color: color,
                    label: {
                        show: false,
                        formatter: '{d}%',
                        textStyle: {
                            fontSize: 14,
                            fontFamily: "微软雅黑"
                        },
                        position: 'inner'
                    },
                    labelLine: {
                        show: false
                    }
                }
        }
    }
}

ContentFactory.assignToPackage("kea.base.FlowAuditController", FlowAuditController);


// ---------------------------------------------
﻿function ProtocolAuditController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.protocol = "";

    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnSearch = "#" + this.elementId + "_btnSearch";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pTxtIP = "#" + this.elementId + "_txtIP";
    this.pTxtMac = "#" + this.elementId + "_txtMac";
    this.pTxtPort = "#" + this.elementId + "_txtPort";
    this.pDdlTime = "#" + this.elementId + "_ddlTime";

    this.pTxtDIP = "#" + this.elementId + "_txtDIP";
    this.pTxtDMac = "#" + this.elementId + "_txtDMac";
    this.pTxtDPort = "#" + this.elementId + "_txtDPort";
    this.pDdlProtocol = "#" + this.elementId + "_ddlProtocol";

    this.pAuditPager = null;
    this.pDetailController = null;
    this.pFilters = "";

}

ProtocolAuditController.prototype.init = function () {
    try {
        var parent = this;

        var parent = this;
        TemplateManager.getInstance().requestTemplates([
            Constants.TEMPLATES.AUDIT_PROTOCOL_HTTP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_FTP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_POP3,
            Constants.TEMPLATES.AUDIT_PROTOCOL_SMTP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_TELNET,
            Constants.TEMPLATES.AUDIT_PROTOCOL_SNMP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_MODBUS,
            Constants.TEMPLATES.AUDIT_PROTOCOL_OPCDA,
            Constants.TEMPLATES.AUDIT_PROTOCOL_S7,
            Constants.TEMPLATES.AUDIT_PROTOCOL_DNP3,
            Constants.TEMPLATES.AUDIT_PROTOCOL_IEC104,
            Constants.TEMPLATES.AUDIT_PROTOCOL_MMS,
            Constants.TEMPLATES.AUDIT_PROTOCOL_PROFINETIO,
            Constants.TEMPLATES.AUDIT_PROTOCOL_PNRTDCP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_GOOSE,
            Constants.TEMPLATES.AUDIT_PROTOCOL_SV,
            Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPTCP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPUDP,
            Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPIO,
            Constants.TEMPLATES.AUDIT_PROTOCOL_OPCUA],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - ProtocolAuditController.init() - Unable to initialize: " + err.message);
    }
}

ProtocolAuditController.prototype.initShell = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - ProtocolAuditController.initShell() - Unable to initialize: " + err.message);
    }
}

ProtocolAuditController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        ScriptLoader.getInstance().includeModule("protocol", function (success) {
            console.log("children js loading successfully.")
        });
        $(this.pBtnRefresh).on("click", function () {
            parent.formatSearchFilter();
            parent.pAuditPager = null;
            parent.selectProtocol(1);
        });

        $(this.pBtnSearch).on("click", function () {
            parent.formatSearchFilter();
            parent.pAuditPager = null;
            parent.selectProtocol(1);
        });

    }
    catch (err) {
        console.error("ERROR - ProtocolAuditController.initControls() - Unable to initialize control: " + err.message);
    }
}

ProtocolAuditController.prototype.load = function () {
    try {
        this.formatSearchFilter();
        this.pAuditPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - ProtocolAuditController.load() - Unable to load: " + err.message);
    }
}

ProtocolAuditController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:8%;">序号</td>';
    html += '<td class="address" style="width:15%;">起始时间</td>';
    html += '<td class="address" style="width:20%;">IP地址</td>';
    html += '<td class="address" style="width:20%;">MAC地址</td>';
    html += '<td class="address style="width:15%;"">端口</td>';
    html += '<td class="address style="width:15%;"">协议类型</td>';
    html += '<td class="address">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_PROTOCOL_LIST + "?page=" + pageIndex + "&" + this.pFilters;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='7'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var ip = parent.formatIP(result.rows[i][6], result.rows[i][8], result.rows[i][14]);
                        var mac = parent.formatMAC(result.rows[i][3], result.rows[i][4], result.rows[i][14]);
                        var port = parent.formatPort(result.rows[i][7], result.rows[i][9], result.rows[i][14]);
                        var time = FormatterManager.formatToLocaleDateTime(result.rows[i][2], result.rows[i][14]);
                        html += "<tr>";
                        html += "<td style='width:8%;'>" + ((pageIndex - 1) * 10 + (i + 1)) + "</td>";
                        html += "<td style='width:15%;'>" + time + "</td>";
                        html += "<td style='width:20%;text-align:center;'>" + ip + "</td>";
                        html += "<td style='width:20%;text-align:center;'>" + mac + "</td>";
                        html += "<td style='width:15%;text-align:center;'>" + port + "</td>";
                        html += "<td style='width:15%;'>" + result.rows[i][13] + "</td>";
                        html += "<td style='color:#1ca826;'><button class='details' data-key='" + result.rows[i][0] + "' ip='" + ip + "' mac='" + mac + "' port='" + port + "' protocol='" + result.rows[i][13] + "' time='"+time+"'>详情</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='7'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='7'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);
            layer.close(loadIndex);

            $(parent.pTdProtocolList).find("button[class='details']").on("click", function () {
                parent.pDetailController = null;
                var id = $(this).attr("data-key");
                var ip = $(this).attr("ip");
                var mac = $(this).attr("mac");
                var port = $(this).attr("port");
                var protocol = $(this).attr("protocol");
                var time = $(this).attr("time");
                var dialogHandler = $("<div />");
                var width = parent.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                var height = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                layer.open({
                    type: 1,
                    title: "详细信息",
                    area: [width, height],
                    offset: ["82px", "200px"],
                    shade: [0.5, '#393D49'],
                    content: dialogHandler.html(),
                    success: function (layero, index) {
                        switch (protocol) {
                            case "dnp3":
                                parent.pDetailController = new kea.base.DNP3Controller(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "enipio":
                                parent.pDetailController = new kea.base.ENIPIOController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "eniptcp":
                                parent.pDetailController = new kea.base.ENIPTCPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "enipudp":
                                parent.pDetailController = new kea.base.ENIPUDPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "ftp":
                                parent.pDetailController = new kea.base.FTPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "goose":
                                parent.pDetailController = new kea.base.GOOSEController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "http":
                                parent.pDetailController = new kea.base.HTTPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "iec104":
                                parent.pDetailController = new kea.base.IEC104Controller(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "mms":
                                parent.pDetailController = new kea.base.MMSController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "modbus":
                                parent.pDetailController = new kea.base.MODBUSController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "opcda":
                                parent.pDetailController = new kea.base.OPCDAController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "opcua":
                                parent.pDetailController = new kea.base.OPCUAController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "pnrtdcp":
                                parent.pDetailController = new kea.base.PNRTDCPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "pop3":
                                parent.pDetailController = new kea.base.POP3Controller(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "profinetio":
                                parent.pDetailController = new kea.base.PROFINETIOController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "s7":
                                parent.pDetailController = new kea.base.S7Controller(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "snmp":
                                parent.pDetailController = new kea.base.SNMPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "smtp":
                                parent.pDetailController = new kea.base.SMTPController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "sv":
                                parent.pDetailController = new kea.base.SVController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                            case "telnet":
                                parent.pDetailController = new kea.base.TELNETController(layero, parent.elementId + "_dialog", id, ip, mac, port, time, protocol);
                                parent.pDetailController.init();
                                break;
                        }
                        $(window).on("resize", function () {
                            var pwidth = parent.pViewHandle.find(".eventinfo_box").width() - 10;
                            var pheight = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10;
                            layero.width(pwidth);
                            layero.height(pheight);
                        })
                    }
                });
            });

            if (parent.pAuditPager == null) {
                parent.pAuditPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pAuditPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='7'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - ProtocolAuditController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ProtocolAuditController.prototype.formatIP = function (sourcIP, destionIP,direction) {
    var result = "";
    if (typeof (sourcIP) != "undefined" && sourcIP != "" && sourcIP.toUpperCase() != "NULL") {
        result += sourcIP;
    }
    if (typeof (sourcIP) != "undefined" && sourcIP != "" && sourcIP.toUpperCase() != "NULL"
        && typeof (destionIP) != "undefined" && destionIP != "" && destionIP.toUpperCase() != "NULL") {
        if (direction == 1) {
            result += "--->";
        }
        else
        {
            result += "<--->";
        }
    }
    if (typeof (destionIP) != "undefined" && destionIP != "" && destionIP.toUpperCase() != "NULL") {
        result += destionIP;
    }

    return result;
}

ProtocolAuditController.prototype.formatMAC = function (sourcMAC, destionMAC, direction) {
    var result = "";
    if (typeof (sourcMAC) != "undefined" && sourcMAC != "" && sourcMAC.toUpperCase() != "NULL") {
        result += sourcMAC;
    }
    if (typeof (sourcMAC) != "undefined" && sourcMAC != "" && sourcMAC.toUpperCase() != "NULL"
        && typeof (destionMAC) != "undefined" && destionMAC != "" && destionMAC.toUpperCase() != "NULL") {
        if (direction == 1) {
            result += "--->";
        }
        else {
            result += "<--->";
        }
    }
    if (typeof (destionMAC) != "undefined" && destionMAC != "" && destionMAC.toUpperCase() != "NULL") {
        result += destionMAC;
    }

    return result;
}

ProtocolAuditController.prototype.formatPort = function (sourcePort, destionPort, direction) {
    var result = "";
    if (typeof (sourcePort) != "undefined" && sourcePort != "") {
        result += sourcePort;
    }
    if (typeof (sourcePort) != "undefined" && sourcePort != ""
        && typeof (destionPort) != "undefined" && destionPort != "") {
        if (direction == 1) {
            result += "--->";
        }
        else {
            result += "<--->";
        }
    }
    if (typeof (destionPort) != "undefined" && destionPort != "") {
        result += destionPort;
    }

    return result;
}

ProtocolAuditController.prototype.formatSearchFilter = function () {
    try {
        this.pFilters = "srcIp=" + $.trim($(this.pTxtIP).val()) + "&";
        this.pFilters += "srcPort=" + $.trim($(this.pTxtPort).val()) + "&";
        this.pFilters += "srcMac=" + $.trim($(this.pTxtMac).val()) + "&";
        this.pFilters += "destIp=" + $.trim($(this.pTxtDIP).val()) + "&";
        this.pFilters += "destPort=" + $.trim($(this.pTxtDPort).val()) + "&";
        this.pFilters += "destMac=" + $.trim($(this.pTxtDMac).val()) + "&";
        this.pFilters += "protocol=" + $.trim($(this.pDdlProtocol + " option:selected").val()) + "&";
        this.pFilters += "timeDelta=" + $.trim($(this.pDdlTime + " option:selected").val());
    }
    catch (err) {
        console.error("ERROR - ProtocolAuditController.formatSearchFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.ProtocolAuditController", ProtocolAuditController);


// ---------------------------------------------
﻿function AdvanceDeviceController(controller, viewHandle, elementId) {
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

        //add by zhangmingzheng
        $(".rule-single-select").ruleSingleSelect();
        //add by zhangmingzheng
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
        //add by zhangmingzhegn
        $(this.pBtnSyslogRemoteChange).on("click", function () {
            parent.switchDeviceSyslogRemote();
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
            parent.changeDeviceMode();
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
                        html += "<td><button class='button_delete' onclick=\"View.getInstance().controller.pAdvanceDeviceController.deleteDeviceSyslogRemote('" + result.syslogdata[i].syslogip + "','" + result.syslogdata[i].protocol + "','" + result.syslogdata[i].port + "')\" >删除</button></td>";
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
            time: 20000,
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


// ---------------------------------------------
﻿function BasicDeviceController(controller, viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isRedirect = true;

    this.pFormIP = "#" + this.elementId + "_formIP";
    this.pLblDeviceTypeNo = "#" + this.elementId + "_lblDeviceTypeNo";
    this.pLblDeviceSerialNo = "#" + this.elementId + "_lblDeviceSerialNo";
    this.pLblDeviceVersion = "#" + this.elementId + "_lblDeviceVersion";
    this.pLblDeviceIP = "#" + this.elementId + "_lblDeviceIP";
    this.pTxtDeviceNewIP = "#" + this.elementId + "_txtDeviceNewIP";
    this.pTxtDeviceNewSubnet = "#" + this.elementId + "_txtDeviceNewSubnet";
    this.pTxtDeviceNewGateway = "#" + this.elementId + "_txtDeviceNewGateway";
    this.pBtnIPSetting = "#" + this.elementId + "_btnIPSetting";

    this.pFormDatetime = "#" + this.elementId + "_formDatetime";
    this.pRabDeviceDateTime1 = this.elementId + "_rabDeviceDateTime1";
    this.pRabDeviceDateTime2 = this.elementId + "_rabDeviceDateTime2";
    this.pRabDeviceDateTime = this.elementId + "_rabDeviceDateTime";
    this.pTxtDeviceDateTime3 = "#" + this.elementId + "_txtDeviceDateTime3";
    this.pTxtDeviceDateTime4 = "#" + this.elementId + "_txtDeviceDateTime4";

    this.pFormLogin = "#" + this.elementId + "_formLogin";
    this.pBtnDateTimeSetting = "#" + this.elementId + "_btnDateTimeSetting";
    this.pTxtDeviceLogoutDateTime = "#" + this.elementId + "_txtDeviceLogoutDateTime";
    this.pTxtDeviceLogintTimes = "#" + this.elementId + "_txtDeviceLogintTimes";
    this.pBtnLoginSetting = "#" + this.elementId + "_btnLoginSetting";

    this.pBtnUpload = "#" + this.elementId + "_btnUpload";
    this.pFileUpload = "#" + this.elementId + "_fileUpload";
    this.pFormUpload = "#" + this.elementId + "_formUpload";
    this.pBtnUpgrade = "#" + this.elementId + "_btnUpgrade";
    this.pErrUpload = "#" + this.elementId + "_errUpload";

    this.PDeviceController = controller;
}

BasicDeviceController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_BASIC), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.init() - Unable to initialize: " + err.message);
    }
}

BasicDeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        $(this.pFormIP).Validform({
            datatype: {
                "ip": function (gets, obj, curform, regxp) {
                    return Validation.validateIP(gets);
                },
                "subnet": function (gets, obj, curform, regxp) {
                    return Validation.validateSubnet(gets);
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
            beforeSubmit: function () { }
        });

        $(this.pFormDatetime).Validform({
            datatype: {
                "ip": function (gets, obj, curform, regxp) {
                    return Validation.validateIP(gets);
                }
            },
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.attr("errormsg"));

                    return false;
                }
            }
        });

        $(".dxinput").on("change", function () {
            if (parent.pRabDeviceDateTime1 == $(this).attr("data-id")) {
                $(parent.pTxtDeviceDateTime3).removeAttr("disabled");
                $(parent.pTxtDeviceDateTime4).attr("disabled", "disabled");
            }
            else {
                $(parent.pTxtDeviceDateTime3).attr("disabled", "disabled");
                $(parent.pTxtDeviceDateTime4).removeAttr("disabled");
            }
        });

        $(this.pTxtDeviceLogoutDateTime).on("keyup", function () {
            $(this).val($(this).val().replace(/\D/g, '0'));
        });

        $(this.pTxtDeviceLogintTimes).on("keyup", function () {
            $(this).val($(this).val().replace(/\D/g, '0'));
        });

        $(this.pTxtDeviceLogoutDateTime).on("change", function () {
            var logoutDatetime = $(this).val();
            if (parseInt(logoutDatetime) < 5 || parseInt(logoutDatetime) > 60) {
                $(parent.pTxtDeviceLogoutDateTime).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("登出时间请确认在5-60分钟");
            }
            else {
                $(parent.pTxtDeviceLogoutDateTime).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pTxtDeviceLogintTimes).on("change", function () {
            var loginTimes = $(this).val();
            if (parseInt(loginTimes) < 5 || parseInt(loginTimes) > 10) {
                $(parent.pTxtDeviceLogintTimes).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("登录次数请确认在5-10次");
                return false;
            }
            else {
                $(parent.pTxtDeviceLogintTimes).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });

        $(this.pBtnIPSetting).on("click", function (event) {
            parent.updateDeviceIP();
            return false;
        });

        $(this.pBtnDateTimeSetting).on("click", function (event) {
            parent.updateDeviceDatetime();
            return false;
        });

        $(this.pBtnLoginSetting).on("click", function (event) {
            parent.updateDeviceLoginInfo();
            return false;
        });

        $(this.pFileUpload).on("change", function () {
            var fileName = $.trim($(this).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1, 3).toLowerCase();
                if (fieExtension == "bin") {
                    $(parent.pErrUpload).html(fileName);
                }
                else {
                    layer.alert("文件格式不对！", { icon: 5 });
                    $(parent.pErrUpload).html("文件格式不对");
                }
            }
            else {
                layer.alert("请选择文件！", { icon: 5 });
                $(parent.pErrUpload).html("选择上传文件");
            }
        });

        $(this.pBtnUpgrade).on("click", function () {
            var fileName = $.trim($(parent.pFileUpload).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1, 3).toLowerCase();
                if (fieExtension == "bin") {
                    $(parent.pErrUpload).html(fileName);
                    parent.upgradeDevice();
                }
                else {
                    layer.alert("文件格式不对！", { icon: 5 });
                    $(parent.pErrUpload).html("文件格式不对");
                }
            }
            else {
                layer.alert("请选择文件！", { icon: 5 });
                $(parent.pErrUpload).html("选择上传文件");
            }
            return false;
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

BasicDeviceController.prototype.load = function () {
    try {
        this.getDeviceInfo();
        this.getLoginInfo();
        this.getRemoteNTP()
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.load() - Unable to load: " + err.message);
    }
}

BasicDeviceController.prototype.getDeviceInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_INFO;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.dpiInfo) != null) {
                $(parent.pLblDeviceTypeNo).html(result.dpiInfo.product);
                $(parent.pLblDeviceSerialNo).html(result.dpiInfo.SN);
                $(parent.pLblDeviceVersion).html(result.dpiInfo.version);
                $(parent.pLblDeviceIP).html(result.dpiInfo.ip);
            }
            else {
                layer.alert("获取失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getDeviceInfo() - Unable to get device inforamtion: " + err.message);
    }
}

BasicDeviceController.prototype.getLoginInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_LOGIN_INFO + "?username=admin";
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                $(parent.pTxtDeviceLogoutDateTime).val(result.logoutTime);
                $(parent.pTxtDeviceLogintTimes).val(result.loginAttemptCount);
            }
            else {
                layer.alert("获取失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getLoginInfo() - Unable to get device login setting: " + err.message);
    }
}

BasicDeviceController.prototype.getRemoteNTP = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_DEVICE_NET;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.mode) != "undefined" && typeof (result.serverIp) != "undefined") {
                if (result.mode == 0) {//手动
                    $(parent.pTxtDeviceDateTime3).removeAttr("disabled", "disabled");
                    $(parent.pTxtDeviceDateTime4).attr("disabled", "disabled");
                }
                else {//自动
                    $("#" + parent.pRabDeviceDateTime2).attr("checked", "checked");
                    $(parent.pTxtDeviceDateTime3).attr("disabled", "disabled");
                    $(parent.pTxtDeviceDateTime4).removeAttr("disabled", "disabled");
                }
                $(parent.pTxtDeviceDateTime4).val(result.serverIp);
            }
            else {
                layer.alert("获取失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.getLoginInfo() - Unable to get device login setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceIP = function () {
    try {
        var parent = this;
        var ip = $.trim($(this.pTxtDeviceNewIP).val());
        var subnet = $.trim($(this.pTxtDeviceNewSubnet).val());
        var gateway = $.trim($(this.pTxtDeviceNewGateway).val());
        if (!Validation.validateIP(ip) || !Validation.validateSubnet(subnet) || !Validation.validateIP(gateway)) {
            layer.alert("请输入有效的IP、子网掩码和网关", { icon: 5 });
            return false;
        }
        var link = APPCONFIG["default"].UPDATE_DEVICE_IP + "?Newdpiip=" + ip + "&newdpimask=" + subnet + "&newdpigateway=" + gateway;
        var promise = URLManager.getInstance().ajaxCall(link);
        layer.msg("正在跳转中...", {
            time: 10000,
            shade: [0.5, '#fff']
        }, function () {
            window.location.replace("https://" + ip + "/" + APPCONFIG["default"].LOGIN_URL);
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                layer.alert("IP设置成功", { icon: 6 }); k
            }
            else {
                layer.alert("IP设置失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceIP() - Unable to update ip setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceDatetime = function () {
    try {
        var parent = this;
        var manualTime = $.trim($(this.pTxtDeviceDateTime3).val());
        var autoIP = $.trim($(this.pTxtDeviceDateTime4).val());
        var syncType = $("input:radio[name='" + this.pRabDeviceDateTime + "']:checked").val();
        var link = APPCONFIG["default"].UPDATE_DEVICE_TIME_MANUAL + "?inputTime=" + manualTime;
        if (syncType == 2) {
            link = APPCONFIG["default"].UPDATE_DEVICE_TIME_AUTO + "?destIp=" + autoIP;
            if (!Validation.validateIP(autoIP)) {
                layer.alert("请输入有效的服务器IP", { icon: 5 });
                return false;
            }
        }
        else {
            if (!Validation.validateDateTime(manualTime)) {
                return false;
            }
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                getSysTime();
                layer.alert("时间设置成功", { icon: 6 });
            }
            else {
                layer.alert("时间设置失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceDatetime() - Unable to update datetime setting: " + err.message);
    }
}

BasicDeviceController.prototype.updateDeviceLoginInfo = function () {
    try {
        var parent = this;
        var logoutDatetime = $.trim($(this.pTxtDeviceLogoutDateTime).val());
        var loginTimes = $.trim($(this.pTxtDeviceLogintTimes).val());//IP
        var passwordLevel = 2;
        var link = APPCONFIG["default"].UPDATE_DEVICE_LOGIN_SETTING;
        link += "?logoutMinute=" + logoutDatetime;
        link += "&tryLogTimes=" + loginTimes
        link += "&safeLevel=" + passwordLevel;
        if ((parseInt(logoutDatetime) < 5 || parseInt(logoutDatetime) > 60) || (parseInt(loginTimes) < 5 || parseInt(loginTimes) >10)) {
            layer.alert("登出时间请确认在5-60分钟,登录次数请确认在5-10次否则会导致无法登录", { icon: 5 });
            return;
        }
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != null && result.status == "1") {
                AuthManager.getInstance().setSessionTimeMin(logoutDatetime);
                layer.alert("登录安全设置成功", { icon: 6 });
            }
            else {
                layer.alert("登录安全设置失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - BasicDeviceController.updateDeviceLoginInfo() - Unable to update login setting: " + err.message);
    }
}

BasicDeviceController.prototype.gotoPage = function () {
    if (this.isRedirect == true) {
        window.location.replace(APPCONFIG["default"].LOGIN_URL);
    }
}

BasicDeviceController.prototype.upgradeDevice = function () {
    var layerIndex;
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPGRADE_DEVICE;
        layerIndex = layer.msg("正在升级，请稍后登录...", {
            time: 600000,
            shade: [0.5, '#fff']
        }, function () {
            parent.gotoPage();
        });    
        $(this.pFormUpload).ajaxSubmit({
            type: 'POST',
            url: link,
            success: function (result) {
                result = $.parseJSON(result);
                if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                    switch (result.status) {
                        case 0:
                            parent.isRedirect = false;
                            layer.alert("升级失败", { icon: 5 }); break;
                        default: $(parent.pErrUpload).html("");
                            break;
                    }
                }
                else {
                    parent.isRedirect = false;
                    layer.alert("升级失败", { icon: 5 });
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
            }
        });
    }
    catch (err) {
        this.isRedirect = false;
        layer.close(layerIndex);
        console.error("ERROR - BasicDeviceController.upgradeDevice() - Unable to upgrade device: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.BasicDeviceController", BasicDeviceController);


// ---------------------------------------------
﻿function DeviceController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBasicDeviceHolder = "#" + this.elementId + "_basicDeviceHolder";
    this.pAdvanceDeviceHolder = "#" + this.elementId + "_advanceDeviceHolder";
    this.pTotalBasicDevice = "#" + this.elementId + "_totalBasicDevice";
    this.pTotalAdvanceDevice = "#" + this.elementId + "_totalAdvanceDevice";

    this.pBasicDeviceController = null;
    this.pAdvanceDeviceController = null;
    this.currentTabId = "";
    this.currentTabHolder = null;
}

DeviceController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.DEVICE_BASIC,
                Constants.TEMPLATES.DEVICE_ADVANCE],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - DeviceController.init() - Unable to initialize all templates: " + err.message);
    }
}

DeviceController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - DeviceController.initShell() - Unable to initialize: " + err.message);
    }
}

DeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalBasicDevice:
                    parent.currentTabHolder = $(parent.pBasicDeviceHolder);
                    if (parent.pBasicDeviceController == null) {
                        parent.pBasicDeviceController = new kea.base.BasicDeviceController(parent, parent.currentTabHolder, parent.elementId + "_basic");
                        parent.pBasicDeviceController.init();
                    }
                    break;
                case parent.pTotalAdvanceDevice:
                    parent.currentTabHolder = $(parent.pAdvanceDeviceHolder);
                    if (parent.pAdvanceDeviceController == null) {
                        parent.pAdvanceDeviceController = new kea.base.AdvanceDeviceController(parent, parent.currentTabHolder, parent.elementId + "_advance");
                        parent.pAdvanceDeviceController.init();
                    }
                    break;
            }
            $(".tabtitle>ul>li").removeClass("hit");
            $(this).addClass("hit");
            $(".tabmiantxt").css("display", "none");
            $(parent.currentTabHolder).css("display", "block");
        });
        $(".tabtitle>ul>li").eq(0).click();
    }
    catch (err) {
        console.error("ERROR - DeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

DeviceController.prototype.load = function () {
    try {
        //this.getLogInfo();
    }
    catch (err) {
        console.error("ERROR - DeviceController.load() - Unable to load: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.DeviceController", DeviceController);


// ---------------------------------------------
﻿function EventController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pTodayEvent = "#" + this.elementId + "_todayEvent";
    this.pNoReadEvent = "#" + this.elementId + "_noReadyEvent";
    this.pHighPeriod = "#" + this.elementId + "_highPeriod";
    this.pLblEventTitle = "#" + this.elementId + "_lblEventTitle";
    this.pLblEventCount = "#" + this.elementId + "_lblEventCount";
    this.pTotalSafeEvent = "#" + this.elementId + "_totalSafeEvent";
    this.pTotalSystemEvent = "#" + this.elementId + "_totalSystemEvent";
    this.pSafeEventHolder = "#" + this.elementId + "_safeEventHolder";
    this.pSystemEventHolder = "#" + this.elementId + "_systemEventHolder";

    this.pSafeEventController = null;
    this.pSystemEventController = null;
    this.pEventInfo = null;
    this.pFilters = "";
    this.currentTabId="";
    this.currentTabHolder = null;
}

EventController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.EVENT_SAFE,
                Constants.TEMPLATES.EVENT_SYSTEM,
                Constants.TEMPLATES.EVENT_SAFE_DIALOG],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - EventController.init() - Unable to initialize all templates: " + err.message);
    }
}

EventController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        //this.load();
        this.initControls();
    }
    catch (err) {
        console.error("ERROR - EventController.initShell() - Unable to initialize: " + err.message);
    }
}

EventController.prototype.initControls = function () {
    try {
        var parent = this;
        //bind event for search event via filter
        $("p.evnumber.evnumber_refresh").on("click", function () {
            var data_id = "#"+$(this).attr("data-id");
            if (parent.currentTabId == parent.pTotalSafeEvent && parent.pSafeEventController != null) {
                switch (data_id) {
                    case parent.pTodayEvent:
                        parent.formatSafeFilter("datetime");
                        break;
                    case parent.pNoReadEvent:
                        parent.formatSafeFilter("isready");
                        break;
                }
                parent.pSafeEventController.pEventPager = null;
                parent.pSafeEventController.pFilters = parent.pFilters;
                parent.pSafeEventController.searchEvents(1, parent.pFilters);
            }
            else if (parent.currentTabId == parent.pTotalSystemEvent && parent.pSystemEventController != null) {
                switch (data_id) {
                    case parent.pTodayEvent:
                        parent.formatSystemFilter("datetime");
                        break;
                    case parent.pNoReadEvent:
                        parent.formatSystemFilter("isready");
                        break;
                }
                parent.pSystemEventController.pEventPager = null;
                parent.pSystemEventController.pFilters = parent.pFilters;
                parent.pSystemEventController.searchEvents(1, parent.pFilters);
            }
        });
        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalSafeEvent:
                    parent.currentTabHolder = $(parent.pSafeEventHolder);
                    parent.setSafeEventNum();
                    if (parent.pSafeEventController == null) {
                        parent.pSafeEventController = new kea.base.SafeEventController(parent, parent.currentTabHolder, parent.elementId + "_safe");
                        parent.pSafeEventController.init();
                    }
                    break;
                case parent.pTotalSystemEvent:
                    parent.currentTabHolder = $(parent.pSystemEventHolder);
                    parent.setSysEventNum();
                    if (parent.pSystemEventController == null) {
                        parent.pSystemEventController = new kea.base.SystemEventController(parent, parent.currentTabHolder, parent.elementId + "_sys");
                        parent.pSystemEventController.init();
                    }
                    break;
            }
            $(".tabtitle>ul>li").removeClass("hit");
            $(this).addClass("hit");
            $(".tabmiantxt").css("display", "none");
            $(parent.currentTabHolder).css("display", "block");
        });
        $(".tabtitle>ul>li").eq(0).click();
    }
    catch (err) {
        console.error("ERROR - EventController.initControls() - Unable to initialize control: " + err.message);
    }
}

EventController.prototype.setSafeEventNum = function () {
    try {
        this.getEventInfo();
        if (this.pEventInfo != null) {
            $(this.pTotalSafeEvent).html(this.pEventInfo.safeeventinfo.allSafeEvent);
            $(this.pTotalSystemEvent).html(this.pEventInfo.syseventinfo.allSafeEvent);
            $(this.pTodayEvent).prev().html("今日安全事件");
            $(this.pTodayEvent).html(this.pEventInfo.safeeventinfo.todaySafeEvent);
            $(this.pNoReadEvent).prev().html("未读安全事件");
            $(this.pNoReadEvent).html(this.pEventInfo.safeeventinfo.noReadSafeEvent);
            $(this.pHighPeriod).prev().html("安全事件高峰时段");
            $(this.pHighPeriod).html(this.pEventInfo.safeeventinfo.highestPeriod);
            var historyEvent = this.pEventInfo.safeeventinfo.allSafeEvent - this.pEventInfo.safeeventinfo.todaySafeEvent;
            if (historyEvent < 0)
            {
                historyEvent = 0;
            }
            $(this.pLblEventCount).html(historyEvent);
            $(this.pLblEventTitle).html("历史安全事件");
        }
    }
    catch (err) {
        console.error("ERROR - EventController.setSafeEventNum() - Unable to set safe event num: " + err.message);
    }
}

EventController.prototype.setSysEventNum = function () {
    try {
        this.getEventInfo();
        if (this.pEventInfo != null) {
            $(this.pTotalSafeEvent).html(this.pEventInfo.safeeventinfo.allSafeEvent);
            $(this.pTotalSystemEvent).html(this.pEventInfo.syseventinfo.allSafeEvent);
            $(this.pTodayEvent).prev().html("今日系统事件");
            $(this.pTodayEvent).html(this.pEventInfo.syseventinfo.todaySafeEvent);
            $(this.pNoReadEvent).prev().html("未读系统事件");
            $(this.pNoReadEvent).html(this.pEventInfo.syseventinfo.noReadSafeEvent);
            $(this.pHighPeriod).prev().html("系统事件高峰时段");
            $(this.pHighPeriod).html(this.pEventInfo.syseventinfo.highestPeriod);
            var historyEvent = this.pEventInfo.syseventinfo.allSafeEvent - this.pEventInfo.syseventinfo.todaySafeEvent;
            if (historyEvent < 0) {
                historyEvent = 0;
            }
            $(this.pLblEventCount).html(historyEvent);
            $(this.pLblEventTitle).html("历史系统事件");
        }
    }
    catch (err) {
        console.error("ERROR - EventController.setSysEventNum() - Unable to set system event num: " + err.message);
    }
}

EventController.prototype.load = function () {
    try {
        this.getEventInfo();
    }
    catch (err) {
        console.error("ERROR - EventController.load() - Unable to load: " + err.message);
    }
}

EventController.prototype.getEventInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_EVENT_INFO;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                parent.pEventInfo = result;
            }
        });
    }
    catch (err) {
        console.error("ERROR - SafeEventController.getEventInfo() - Unable to load: " + err.message);
    }
}

EventController.prototype.formatSafeFilter = function (flag) {
    try {
        this.pFilters = "?action=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "sourceIp=&";
        this.pFilters += "destinationIp=&";
        this.pFilters += "appLayerProtocol=&";

        if (flag == "datetime") {
            var datetime = new Date();
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10) {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

EventController.prototype.formatSystemFilter = function (flag) {
    try {
        this.pFilters = "?level=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "content=&";

        if (flag == "datetime") {
            //不能用本机时间，必须用系统事件
            var sysDateTime = $(".systemtime>p").text();
            var datetime = new Date();
            if (typeof (sysDateTime) != "undefined" && sysDateTime != "")
            {
                datetime = new Date(sysDateTime);
            }
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10)
            {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.EventController", EventController);


// ---------------------------------------------
﻿function SafeEventController(eventController,viewHandle, elementId) {
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

        $(this.pBtnRefresh).on("click", function () {
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
            parent.exportEvent();
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
            parent.searchEvents(1,parent.pFilters);
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("设置已读成功", { icon: 6 });
                        parent.pEventController.setSafeEventNum();
                        parent.selectEvents(1);
                        break;
                    default: layer.alert("设置已读失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("设置已读失败", { icon: 5 });
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined"&&typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("清除所有事件成功", { icon: 6 });
                        parent.pEventPager = null;
                        parent.pEventController.setSafeEventNum();
                        parent.selectEvents(1);
                        break;
                    default: layer.alert("清除所有事件失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("清除所有事件失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - SafeEventController.clearEvent() - Unable to clear all events: " + err.message);
    }
}

SafeEventController.prototype.exportEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_SAFE_EVENT;
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
                        window.open(APPCONFIG["default"].SAFE_EVENT_FILEPATH  + result.filename);
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
    html += '<td class="address">状态</td>';
    html += '<td>操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_SAFE_EVENT_LIST + "?page="+pageIndex;
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
                        if (result.rows[i][4] == 0)
                        {
                            html += "<td>通过</td>";
                        }
                        else if (result.rows[i][4] == 1) {
                            html += "<td>警告</td>";
                        }
                        else {
                            html += "<td>阻断</td>"; 
                        }
                        html += "<td>" + parent.formatReadStatus(result.rows[i][5]) + "</td>";
                        html += "<td><button class='details' data-key='" + result.rows[i][6] + "'>详情</button></td>";
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
            if (typeof (result.total) != "undefined")
            {
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
                var width = parent.pEventController.pViewHandle.find(".eventinfo_box").width()-10 + "px";
                var height = $(window).height() - parent.pEventController.pViewHandle.find(".eventinfo_box").offset().top-10 + "px";
                layer.open({
                    type: 1,
                    title:"事件信息",
                    area: [width, height],
                    offset: ["82px", "200px"],
                    shade: [0.5, '#393D49'],
                    content: dialogTemplate,
                    success: function (layero, index) {
                        parent.getEventDetails(layero, id,$tr);
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

SafeEventController.prototype.searchEvents = function (pageIndex,filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">源地址</td>';
    html += '<td class="address">目的地址</td>';
    html += '<td class="address">协议</td>';
    html += '<td class="time">时间</td>';
    html += '<td class="address">事件等级</td>';
    html += '<td class="address">状态</td>';
    html += '<td>操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SEARCH_SAFE_EVENT +filter+"page=" + pageIndex;
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
                        else {
                            html += "<td>阻断</td>";
                        }
                        html += "<td>" + parent.formatReadStatus(result.rows[i][5]) + "</td>";
                        html += "<td><button class='details' data-key='" + result.rows[i][6] + "'>详情</button></td>";
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
                        parent.getEventDetails(layero, id,$tr);
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
                parent.pEventPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex,filters) {
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

SafeEventController.prototype.getEventDetails = function (viewHandler,id,$tr) {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_SAFE_DIALOG), {
            elementId: parent.elementId+"_dialog"
        });
        var tmpViewHandle = $("<div />").html(tabTemplate);
        var link = APPCONFIG["default"].GET_SAFE_EVENT + "?recordid="+id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result.values) != "undefined") {
                parent.flagSingleEvent(id,$tr);
                $(viewHandler).find(parent.pLblEventLevel).text("警告");
                $(viewHandler).find(parent.pLblRiskLevel).text(parent.formatRiskLevel(result.values[1]));
                $(viewHandler).find(parent.pLblEventType).text("安全事件");
                $(viewHandler).find(parent.pLblEventDate).text(FormatterManager.formatDate(result.values[2]));
                $(viewHandler).find(parent.pLblEventTime).text(FormatterManager.formatToLongTime(result.values[2]));
                $(viewHandler).find(parent.pLblApplicationProtocol).text(result.values[3]);
                $(viewHandler).find(parent.pLblNetworkProtocol).text(result.values[4]);
                $(viewHandler).find(parent.pLblEventRemark).text(result.values[6]);

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

SafeEventController.prototype.flagSingleEvent = function (id,obj) {
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].FLAG_SAFE_EVENT + "?recordindex="+id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.pEventController.setSafeEventNum();
                        obj.html("已读");
                        break;
                    default: layer.alert("设置已读失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("设置已读失败", { icon: 5 });
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
        switch (status)
        {
            case 1: return "已读"; 
            case 0: return "未读"; 
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - SafeEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

SafeEventController.prototype.formatRiskLevel = function (v) {
    try {
        switch (v) {
            case 0: return "低";
            case 1: return "中";
            case 2: return "高";
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - SafeEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}

SafeEventController.prototype.formatFilter = function () {
    try {
        this.pFilters = "?action=&";
        this.pFilters += "sourceIp=" + $.trim($(this.pTxtSourceIP).val()) + "&";
        this.pFilters += "status=&";
        this.pFilters += "destinationIp=" + $.trim($(this.pTxtDestinationIP).val()) + "&";
        this.pFilters += "appLayerProtocol=" + $.trim($(this.pTxtProtocol).val()) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err) {
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.SafeEventController", SafeEventController);


// ---------------------------------------------
﻿function SystemEventController(eventController, viewHandle, elementId) {
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
            parent.exportEvent();
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("设置已读成功", { icon: 6, width: 300, height: 200 });
                        parent.pEventController.setSysEventNum();
                        parent.selectEvents(1);
                        break;
                    default: layer.alert("设置已读失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("设置已读失败", { icon: 5 });
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("清除所有事件成功", { icon: 6 });
                        parent.pEventPager = null;
                        parent.pEventController.setSysEventNum();
                        parent.selectEvents(1);
                        break;
                    default: layer.alert("清除所有事件失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("清除所有事件失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - SystemEventController.clearEvent() - Unable to clear all events: " + err.message);
    }
}

SystemEventController.prototype.exportEvent = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_SYS_EVENT;
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
                        window.open(APPCONFIG["default"].SYS_EVENT_FILEPATH + result.filename);
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
            html += "<tr><td colspan='5'>暂无数据</td></tr>";;
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
                        html += "<td>" + parent.formatEventContent(result.rows[i][3]) + "</td>";
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
                    html += "<tr><td colspan='5'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pEventController.pTotalSystemEvent).text(result.total);
                $(parent.pLblTotalEvent).text(result.total);
            }
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);

            $(parent.pTdEventList).find("button").on("click", function (event) {
                var id = $(this).attr("data-key");
                parent.flagSingleEvent($(this),id);
                
            });

            if (parent.pEventPager == null) {
                parent.pEventPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex,filters) {
                    parent.selectEvents(pageIndex);
                });
                parent.pEventPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";;
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
            html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            $(parent.pTdEventList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        //sourceIp,destinationIp,appLayerProtocol,timestamp,action,status,incidentId
                        html += "<td>" + parent.formatEventLevel(result.rows[i][0])+"</td>";
                        html += "<td>" + parent.formatEventType(result.rows[i][1]) + "</td>";
                        html += "<td>" + FormatterManager.formatToLocaleDateTime(result.rows[i][2]) + "</td>";
                        html += "<td>" + parent.formatEventContent(result.rows[i][3]) + "</td>";
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
                parent.flagSingleEvent($(this),id);
                
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

SystemEventController.prototype.flagSingleEvent = function (obj,id) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].FLAG_SYS_EVENT + "?recordid=" + id;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("设置已读成功", { icon: 6 });
                        obj.parent().html("已读");
                        parent.pEventController.setSysEventNum();
                        break;
                    default: layer.alert("设置已读失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("设置已读失败", { icon: 5 });
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
            case 0: return "信息";
            case 1: return "警告";
            case 3: return "信息和警告";
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

SystemEventController.prototype.formatReadStatus = function (status) {
    try {
        switch (status) {
            case 1: return "已读";
            case 0: return "未读";
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatReadStatus() - Unable to format ReadStaus: " + err.message);
    }
}

SystemEventController.prototype.formatEventType = function (v) {
    try {
        switch (v) {
            case 0: return "设备状态";
            case 1: return "接口状态";
            default: return "";
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}

SystemEventController.prototype.formatEventContent = function (v) {
    try {
        switch ($.trim(v)) {
            case "all": return "所有内容";
            case "link": return "连接";
            case "unlink": return "未连接";
            case "p0 up,p1 up": return "P0连接,P1连接";
            case "p0 up,p1 down": return "P0连接,P1未连接";
            case "p0 down,p1 up": return "P0未连接,P1连接";
            case "p0 down,p1 down": return "P0未连接,P1未连接";
            default: return v;
        }
    }
    catch (err) {
        console.error("ERROR - SystemEventController.getEventDetails() - Unable to format RiskLevel: " + err.message);
    }
}

SystemEventController.prototype.formatFilter = function () {
    try {
        this.pFilters = "";
        this.pFilters += "?status=&level=&";
        this.pFilters += "content=" + $.trim($(this.pTxtEventContent+" option:selected").val()) + "&";
        this.pFilters += "starttime=" + $.trim($(this.pTxtStartDateTime).val()) + "&";
        this.pFilters += "endtime=" + $.trim($(this.pTxtEndDateTime).val()) + "&";
    }
    catch (err) {
        console.error("ERROR - SystemEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.SystemEventController", SystemEventController);


// ---------------------------------------------
﻿function HomeController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.pCPUState = this.elementId + '_cpuState';
    this.pMemoryState = this.elementId + '_memoryState';
    this.pDiskState = this.elementId + '_diskState';

    this.pRuleNum = "#" + this.elementId + '_ruleNum';
    this.pBlackNum = "#" + this.elementId + '_blackNum';
    this.pHistoryEventNum = "#" + this.elementId + '_historyEventNum';
    this.pIpmacNum = "#" + this.elementId + '_ipmacNum';
    this.pNoReadNum = "#" + this.elementId + '_noReadNum';
    this.pTodayEventNum = "#" + this.elementId + '_todayEventNum';
    this.pWhiteNum = "#" + this.elementId + '_whiteNum';

    this.pConsolePort = "#" + this.elementId + '_consolePort';
    this.pMgmtPort = "#" + this.elementId + '_mgmtPort';
    this.pP0Port = "#" + this.elementId + '_p0Port';
    this.pP1Port = "#" + this.elementId + '_p1Port';
    this.pP2Port = "#" + this.elementId + '_p2Port';
    this.pP3Port = "#" + this.elementId + '_p3Port';
    this.pRunLight = "#" + this.elementId + '_greenLight';
    this.pRedLight = "#" + this.elementId + '_redLight';
    this.pGrayLight = "#" + this.elementId + '_grayLight';

    this.pPortInformation = "#" + this.elementId + '_portInformation';

    this.color = ['#3994d3', '#f98665', '#fac767', '#28daca', '#9569f9', '#e36585'];

    this.layerTip = {
        tip1: null,
        tip2: null,
        tip3: null
    };
    this.timer = {
        chartTimer: null
    };
}

HomeController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.HOME_DASHBOARD), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        this.load();
    }
    catch (err) {
        console.error("ERROR - HomeController.init() - Unable to initialize: " + err.message);
    }
}

HomeController.prototype.load = function () {
    try {
        var parent = this;
        var CPUChrt = parent.initGaugeChart(this.pCPUState, 'CPU', '利用率', 1, 0);
        var memoryChart = parent.initGaugeChart(this.pMemoryState, '内存', '利用率', 2, 0);
        var diskChart = parent.initGaugeChart(this.pDiskState, '磁盘', '利用率', 3, 0);
        var totalFlow = this.selectTotalFlow();
        var interfaceChart = this.initLineChart('divInterface', '总流量', totalFlow);
        var deviceFlow = this.selectDeviceFlow();
        var deviceChart = this.initPieChart('divDevice', '设备流量排名', deviceFlow);
        var protocolFlow = this.selectProtocolFlow();
        var protocolChart = this.initPieChart('divPortocol', '协议流量排名', protocolFlow);

        this.selectBaseData(CPUChrt, memoryChart, diskChart);

        clearInterval(this.timer.chartTimer);
        this.timer.chartTimer = setInterval(function () {
            parent.selectBaseData(CPUChrt, memoryChart, diskChart);

            var data = parent.selectSingleTotalFlow();
            var option = interfaceChart.getOption();
            if (option.yAxis[0].max < Math.ceil(data.y)) {
                option.yAxis[0].max = Math.ceil(data.y);
                interfaceChart.setOption(option);
            }
            interfaceChart.addData([
                [
                    0,
                    data.y,
                    false,
                    false,
                    data.x
                ]
            ]);
        }, 20000);
        this.selectProductInfo();
        $(window).resize(function () {
            CPUChrt.resize();
            memoryChart.resize();
            diskChart.resize();
            deviceChart.resize();
            protocolChart.resize();
            interfaceChart.resize();
        });
    }
    catch (err) {
        console.error("ERROR - HomeController.load() - Unable to load: " + err.message);
    }
}

HomeController.prototype.selectBaseData = function (CPUChrt, memoryChart, diskChart) {
    var parent = this;
    try {
        var promise = URLManager.getInstance().ajaxCall(APPCONFIG["default"].GET_HOME_BASE);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            return null;
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                $(parent.pRuleNum).text(result.sys_info.rulesNum);
                $(parent.pBlackNum).text(result.sys_info.blackNum);
                $(parent.pHistoryEventNum).text(result.sys_info.historyEventNum);
                $(parent.pIpmacNum).text(result.sys_info.ipmacNum);
                $(parent.pNoReadNum).text(result.sys_info.noReadNum);
                $(parent.pTodayEventNum).text(result.sys_info.todayEventNum);
                $(parent.pWhiteNum).text(result.sys_info.whiteNum);
                if (result.sys_info.agl0LinkState) {
                    $(parent.pMgmtPort).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_YES);
                }
                else {
                    $(parent.pMgmtPort).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_NO)
                }

                if (typeof (result.sys_info.agl0Info) != "undefined" && result.sys_info.agl0Info != "") {
                    $(parent.pMgmtPort).find("img").attr("alt", result.sys_info.agl0Info);
                    $(parent.pMgmtPort).find("img").hover(function () {
                        var data = $(this).attr("alt").split(';');
                        var tipBox = parent.initTipBox("MGMT", data[1], data[2], data[3]);
                        parent.layerTip.tip1 = layer.tips(tipBox, this, {
                            time: 100000,
                            tips: [2, '#eee', '#ff0000']
                        });
                        $(".layui-layer-content").css("color", "#222");
                    }, function () {
                        parent.disposeTipBox();
                    });
                }
                if (result.sys_info.p0LinkState) {
                    $(parent.pP0Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_YES);
                }
                else {
                    $(parent.pP0Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_NO);
                }
                if (typeof (result.sys_info.p0Info) != "undefined" && result.sys_info.p0Info != "") {
                    $(parent.pP0Port).find("img").attr("alt", result.sys_info.p0Info);
                    $(parent.pP0Port).find("img").hover(function () {
                        var data = $(this).attr("alt").split(';');
                        var tipBox = parent.initTipBox("P0", data[1], data[2], data[3]);
                        parent.layerTip.tip2 = layer.tips(tipBox, this, {
                            time: 100000,
                            tips: [2, '#eee', '#ff0000']
                        });
                        $(".layui-layer-content").css("color", "#222");
                    }, function () {
                        parent.disposeTipBox();
                    });
                }

                if (result.sys_info.p1LinkState) {
                    $(parent.pP1Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_YES);
                }
                else {
                    $(parent.pP1Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_NO)
                }
                if (typeof (result.sys_info.p1Info) != "undefined" && result.sys_info.p1Info != "") {
                    $(parent.pP1Port).find("img").attr("alt", result.sys_info.p1Info);
                    $(parent.pP1Port).find("img").hover(function () {
                        var data = $(this).attr("alt").split(';');
                        var tipBox = parent.initTipBox("P1", data[1], data[2], data[3]);
                        parent.layerTip.tip3 = layer.tips(tipBox, this, {
                            time: 100000,
                            tips: [2, '#eee', '#ff0000']
                        });
                        $(".layui-layer-content").css("color", "#222");
                    }, function () {
                        parent.disposeTipBox();
                    });
                }

                if (result.sys_info.p2LinkState) {
                    $(parent.pP2Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_YES);
                }
                else {
                    $(parent.pP2Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_NO);
                }
                if (typeof (result.sys_info.p2Info) != "undefined" && result.sys_info.p0Info != "") {
                    $(parent.pP2Port).find("img").attr("alt", result.sys_info.p2Info);
                    $(parent.pP2Port).find("img").hover(function () {
                        var data = $(this).attr("alt").split(';');
                        var tipBox = parent.initTipBox("P2", data[1], data[2], data[3]);
                        parent.layerTip.tip2 = layer.tips(tipBox, this, {
                            time: 100000,
                            tips: [2, '#eee', '#ff0000']
                        });
                        $(".layui-layer-content").css("color", "#222");
                    }, function () {
                        parent.disposeTipBox();
                    });
                }

                if (result.sys_info.p3LinkState) {
                    $(parent.pP3Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_YES);
                }
                else {
                    $(parent.pP3Port).find("img").attr("src", Constants.PORT_IMAGETYPE.PORT_NO)
                }
                if (typeof (result.sys_info.p3Info) != "undefined" && result.sys_info.p3Info != "") {
                    $(parent.pP3Port).find("img").attr("alt", result.sys_info.p3Info);
                    $(parent.pP3Port).find("img").hover(function () {
                        var data = $(this).attr("alt").split(';');
                        var tipBox = parent.initTipBox("P3", data[1], data[2], data[3]);
                        parent.layerTip.tip3 = layer.tips(tipBox, this, {
                            time: 100000,
                            tips: [2, '#eee', '#ff0000']
                        });
                        $(".layui-layer-content").css("color", "#222");
                    }, function () {
                        parent.disposeTipBox();
                    });
                }
                if (result.sys_info.isC400 == 0)
                {
                    $(".line-name02").hide();
                    $(parent.pP2Port).hide();
                    $(parent.pP3Port).hide();
                }

                var CPUOption = CPUChrt.getOption();
                CPUOption.series[0].data[0].value = result.sys_info.cpuState;
                CPUChrt.setOption(CPUOption, true);

                var memoryOption = memoryChart.getOption();
                memoryOption.series[0].data[0].value = result.sys_info.memoryState;
                memoryChart.setOption(memoryOption, true);

                var diskOption = diskChart.getOption();
                diskOption.series[0].data[0].value = result.sys_info.diskState;
                diskChart.setOption(diskOption, true);
            }
        });

    }
    catch (err) {
        console.error("ERROR - HomeController.getBaseData() - Unable to load: " + err.message);
    }
}

HomeController.prototype.selectTotalFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            x: [],
            y: []
        };
        var link = APPCONFIG["default"].GET_TOTAL_FLOW + "?timeDelta=1";
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                for (var i = 0; i < result.points.length; i++) {
                    data.y.push(result.points[i]);
                }
                for (var i = 0; i < result.timePoints.length; i++) {
                    data.x.push(result.timePoints[i]);
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - HomeController.selectFlow() - Unable to get all points: " + err.message);
        return data;
    }
}
HomeController.prototype.selectProductInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_HOME_PRODUCT;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                if (result.isC400 == 0) {
                    $(".line-name02").hide();
                    $(parent.pP2Port).hide();
                    $(parent.pP3Port).hide();
                }
            }
        });
    }
    catch (err) {
        console.error("ERROR - HomeController.selectProductInfo() - Unable to get product info: " + err.message);
    }
}

HomeController.prototype.selectSingleTotalFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {x: '', y: 0};
        var link = APPCONFIG["default"].GET_TOTAL_FLOW_POINT + "?timeDelta=1";
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.point) != "undefined" && typeof (result.timePoint) != "undefined"
                && result.timePoint != "undefined") {
                data.x = result.timePoint;
                data.y = result.point;
            }
        });

        return data;
    }
    catch (err) {
        return data;
        console.error("ERROR - HomeController.selectSingleTotalFlow() - Unable to get single point: " + err.message);
    }
}

HomeController.prototype.selectDeviceFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            name: [],
            item: []
        };
        var link = APPCONFIG["default"].GET_DEVICE_TOTAL_FLOW + "?timeDelta=1";
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][1] != 0) {
                        var color = parent.color[i];
                        if (result.rows[i][0].toLowerCase() == "others") {
                            color = parent.color[5];
                            result.rows[i][0] = "其他";
                        }
                        var item = parent.createPieStruct(result.rows[i][0], result.rows[i][1], color);
                        data.name.push(result.rows[i][0]);
                        data.item.push(item);
                    }
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - HomeController.selectDeviceFlow() - Unable to get device flow data: " + err.message);
        return data;
    }
}

HomeController.prototype.selectProtocolFlow = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            name: [],
            item: []
        };
        var link = APPCONFIG["default"].GET_PROTOCOL_TOTAL_FLOW + "?timeDelta=1";
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][1] != 0) {
                        var color = parent.color[i];
                        if (result.rows[i][0].toLowerCase() == "others") {
                            color = parent.color[5];
                            result.rows[i][0] = "其他";
                        }
                        var item = parent.createPieStruct(result.rows[i][0], result.rows[i][1], color);
                        data.name.push(result.rows[i][0]);
                        data.item.push(item);
                    }
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - HomeController.selectProtocolFlow() - Unable to get protocol flow data: " + err.message);
        return data;
    }
}

HomeController.prototype.initGaugeChart = function (id, title, subTitle, type, initValue) {
    var gauge = echarts.init(document.getElementById(id));
    var axisLineCPUColor = [[0.3, '#e1f1fe'], [0.7, '#c2def3'], [1, '#85c5f3']];
    var axisLineMemoryColor = [[0.3, '#e0e5fd'], [0.7, '#c2c9fa'], [1, '#8592f3']];
    var axisLineDiskColor = [[0.3, '#e6d1f5'], [0.7, '#cfa9f1'], [1, '#b277e8']];
    var axisLineColor;
    var detailTextColor;
    var pointerColor;
    switch (type) {
        case 1:
            axisLineColor = axisLineCPUColor;
            detailTextColor = '#85c5f3';
            pointerColor = '#85c5f3';
            break;
        case 2:
            axisLineColor = axisLineMemoryColor;
            detailTextColor = '#8592f3';
            pointerColor = '#8592f3';
            break;
        default:
            axisLineColor = axisLineDiskColor;
            detailTextColor = '#b277e8';
            pointerColor = '#b277e8';
            break;
    }
    var option = {
        title: {
            text: title,
            textStyle: {
                color: detailTextColor,
                fontSize: 25
            },
            subtext: subTitle,
            x: 20,
            y: 50
        },
        tooltip: {
            formatter: "{a}{b} : {c}%"
        },
        series: [
            {
                name: title + subTitle,
                type: 'gauge',
                center: ['60%', '80%'],    // 默认全局居中
                radius: [0, '120%'],
                startAngle: 180,
                endAngle: 0,
                min: 0,                     // 最小值
                max: 100,                   // 最大值
                precision: 0,               // 小数精度，默认为0，无小数点
                splitNumber: 10,             // 分割段数，默认为5
                axisLine: {            // 坐标轴线
                    show: true,        // 默认显示，属性show控制显示与否
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: axisLineColor,
                        width: 30
                    }
                },
                axisTick: {            // 坐标轴小标记
                    show: true,        // 属性show控制显示与否，默认不显示
                    splitNumber: 2,    // 每份split细分多少段
                    length: 5,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#eee',
                        width: 1,
                        type: 'solid'
                    }
                },
                axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                    show: true,
                    formatter: function (v) {
                        switch (v) {
                            case 0:
                                return 0 + '%';
                            case 50:
                                return 50 + '%';
                            case 100:
                                return 100 + '%';
                            default:
                                return '';
                        }
                    },
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: '#333'
                    }
                },
                splitLine: {           // 分隔线
                    show: true,        // 默认显示，属性show控制显示与否
                    length: 30,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: '#eee',
                        width: 2,
                        type: 'solid'
                    }
                },
                pointer: {
                    length: '80%',
                    width: 3,
                    color: pointerColor
                },
                title: {
                    show: true,
                    offsetCenter: ['0%', -10],       // x, y，单位px
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: '#333',
                        fontSize: 12
                    }
                },
                detail: {
                    show: true,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    borderColor: '#ccc',
                    width: 50,
                    height: 30,
                    offsetCenter: ['-140%', '-25%'],       // x, y，单位px
                    formatter: '{value}%',
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: detailTextColor,
                        fontFamily: '微软雅黑',
                        fontSize: 30,
                        fontWeight: 'bolder'
                    }
                },
                data: [{value: initValue, name: ''}]
            }
        ]
    };

    gauge.setOption(option);

    return gauge;
}

HomeController.prototype.initBarChart = function (id, title, data) {
    var bar = echarts.init(document.getElementById(id));
    var option = {
        title: {
            text: title,
            subtext: '最近1小时',
            textStyle: {
                fontSize: 14,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#666'
            },
            subtextStyle: {
                fontSize: 12,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#bbb'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (a) {
                return a[0][1] + ": " + (a[0][2] * 100) + "%";
            }
        },
        calculable: false,
        xAxis: [
            {
                type: 'value',
                max: 1,
                min: 0,
                boundaryGap: false,
                axisLabel: {
                    formatter: function (v) {
                        return v * 100 + "%";
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#eee',
                        width: 1,
                        type: 'solid'
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'category',
                data: data.x,
                axisLabel: {
                    formatter: function (v) {
                        return v;
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        type: 'solid'
                    }
                },
                splitLine: {
                    show: true
                }
            }
        ],
        series: [
            {
                type: 'bar',
                data: data.y,
                itemStyle: {
                    normal: {
                        color: function (a) {
                            switch (a.dataIndex) {
                                case 0:
                                    return "#3a94d3";
                                case 1:
                                    return "#fa8567";
                                case 2:
                                    return "#fac567";
                                case 3:
                                    return "#28d8ca";
                                default:
                                    return "#9667fa";
                            }
                        },
                        label: {
                            show: true,
                            textStyle: {
                                fontSize: 12,
                                color: '#333'
                            },
                            formatter: function (a) {
                                return (a.value * 100) + "%";
                            }
                        }
                    }
                },
                barWidth: 12
            }
        ]
    };

    bar.setOption(option);

    return bar;
}

HomeController.prototype.initLineChart = function (id, title, data) {
    var line = echarts.init(document.getElementById(id));
    var option = {
        title: {
            text: title,
            subtext: '单位：Kbps',
            textStyle: {
                fontSize: 14,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#666'
            },
            subtextStyle: {
                fontSize: 12,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#bbb'
            }
        },
        calculable: false,
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}Kbps'
        },
        xAxis: [
            {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        type: 'solid'
                    }
                },
                boundaryGap: false,
                data: data.x
            }
        ],
        yAxis: [
            {
                type: 'value',
                min: 0,
                max: data.y.length == 0 ? 1 : Math.ceil(Math.max.apply(null, data.y)) + 1,
                boundaryGap: false,
                axisLabel: {
                    formatter: function (v) {
                        if (v == 0) {
                            return v;
                        }
                        return v.toFixed(1);
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ccc',
                        width: 1,
                        type: 'solid'
                    }
                }
            }
        ],
        series: [
            {
                type: 'line',
                symbol: 'none',
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default',
                            color: '#6dc7be'
                        },
                        lineStyle: {
                            color: '#6dc7be'
                        }
                    }
                },
                data: data.y
            }
        ]
    };

    line.setOption(option);

    return line;
}

HomeController.prototype.initPieChart = function (id, title, data) {
    var parent = this;
    var pie = echarts.init(document.getElementById(id));
    var option = {
        title: {
            text: title,
            subtext: '最近1小时',
            textStyle: {
                fontSize: 14,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#666'
            },
            subtextStyle: {
                fontSize: 12,
                fontWeight: 'bolder',
                fontFamily: '微软雅黑',
                color: '#bbb'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{d}%"
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            data: data.name
        },
        calculable: true,
        series: [
            {
                name: 'pie',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                data: data.item
            }
        ],
        noDataLoadingOption: {
            text: "暂无数据",
            effect: "bar",
            
        }
    };

    pie.setOption(option);

    return pie;
}

HomeController.prototype.createPieStruct = function (name, value, color) {
    return {
        name: name,
        value: value,
        itemStyle: {
            normal: {
                color: color,
                label: {
                    show: false,
                    formatter: '{d}%',
                    textStyle: {
                        fontSize: 14,
                        fontFamily: "微软雅黑"
                    },
                    position: 'inner'
                },
                labelLine: {
                    show: false
                }
            }
        }
    }
}

HomeController.prototype.initTipBox = function (title, mac, ip, subip) {
    var tipBox = '<div class="tooltip">';
    tipBox += ' <ul>';
    tipBox += '<li>接口名称：<span>' + title + '</span></li>';
    tipBox += '<li>硬件地址：<span>' + ip + '</span></li>';
    tipBox += '<li>接口地址：<span>' + mac + '</span></li>';
    tipBox += '<li>子网掩码：<span>' + subip + '</span></li>';
    tipBox += '</ul>';
    tipBox += '</div>';

    return tipBox;
}

HomeController.prototype.disposeTipBox = function () {
    layer.closeAll("tips");
}

HomeController.prototype.clearTimer = function () {
    if (typeof (this.timer.chartTimer) != "undefined" && this.timer.chartTimer != null) {
        clearInterval(this.timer.chartTimer);
    }
}

ContentFactory.assignToPackage("kea.base.HomeController", HomeController);


// ---------------------------------------------
﻿function LogController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pTotalLoginLog = "#" + this.elementId + "_totalLoginLog";
    this.pTotalOperationLog = "#" + this.elementId + "_totalOperationLog";
    this.pLoginLogHolder = "#" + this.elementId + "_loginLogHolder";
    this.pOperatioLogHolder = "#" + this.elementId + "_operationLogHolder";
    this.pDownloadHolder = "#" + this.elementId + "_downloadHolder";

    this.PLoginLogController = null;
    this.POperationLogController = null;
    this.pLogInfo = null;
    this.pFilters = "";
    this.currentTabId="";
    this.currentTabHolder = null;
}

LogController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.LOG_LOGIN,
                Constants.TEMPLATES.LOG_OPERATION],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - LogController.init() - Unable to initialize all templates: " + err.message);
    }
}

LogController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.LOG_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - LogController.initShell() - Unable to initialize: " + err.message);
    }
}

LogController.prototype.initControls = function () {
    try {
        var parent = this;

        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalLoginLog:
                    parent.currentTabHolder = $(parent.pLoginLogHolder);
                    if (parent.pLogInfo != null) {
                        $(parent.pTotalLoginLog).html(parent.pLogInfo.loginlog_num);
                    }
                    if (parent.PLoginLogController == null) {
                        parent.PLoginLogController = new kea.base.LoginLogController(parent, parent.currentTabHolder, parent.elementId + "_login");
                        parent.PLoginLogController.init();
                    }
                    break;
                case parent.pTotalOperationLog:
                    parent.currentTabHolder = $(parent.pOperatioLogHolder);
                    if (parent.pLogInfo != null) {
                        $(parent.pTotalOperationLog).html(parent.pLogInfo.operlog_num);
                    }
                    if (parent.POperationLogController == null) {
                        parent.POperationLogController = new kea.base.OperationLogController(parent, parent.currentTabHolder, parent.elementId + "_operation");
                        parent.POperationLogController.init();
                    }
                    break;
            }
            $(".tabtitle>ul>li").removeClass("hit");
            $(this).addClass("hit");
            $(".tabmiantxt").css("display", "none");
            $(parent.currentTabHolder).css("display", "block");
        });
        $(".tabtitle>ul>li").eq(0).click();
    }
    catch (err) {
        console.error("ERROR - LogController.initControls() - Unable to initialize control: " + err.message);
    }
}

LogController.prototype.load = function () {
    try {
        this.getLogInfo();
    }
    catch (err) {
        console.error("ERROR - LogController.load() - Unable to load: " + err.message);
    }
}

LogController.prototype.getLogInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_LOG_INFO;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                parent.pLogInfo = result;
                $(parent.pTotalLoginLog).html(result.loginlog_num);
                $(parent.pTotalOperationLog).html(result.operlog_num);
            }
        });
    }
    catch (err) {
        console.error("ERROR - LoginLogController.getLogInfo() - Unable to load: " + err.message);
    }
}

LogController.prototype.formatSafeFilter = function (flag) {
    try {
        this.pFilters = "?action=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "sourceIp=&";
        this.pFilters += "destinationIp=&";
        this.pFilters += "appLayerProtocol=&";

        if (flag == "datetime") {
            var datetime = new Date();
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10) {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - LoginLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}


LogController.prototype.formatSystemFilter = function (flag) {
    try {
        this.pFilters = "?level=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "content=&";

        if (flag == "datetime") {
            var datetime = new Date();
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10)
            {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - LoginLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.LogController", LogController);


// ---------------------------------------------
﻿function LoginLogController(eventController,viewHandle, elementId) {
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
            parent.exportLog();
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pLogPager = null;
            parent.selectLogs(1);
        });

        $(this.pBtnSearch).on("click", function () {
            parent.formatFilter();
            parent.pLogPager = null;
            parent.searchLogs(1,parent.pFilters);
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

LoginLogController.prototype.exportLog = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_LOGIN_LOG;
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
                        window.open(APPCONFIG["default"].LOGIN_LOG_FILEPATH + result.filename);
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
        console.error("ERROR - LoginLogController.exportLog() - Unable to export all logs: " + err.message);
    }
}

LoginLogController.prototype.selectLogs = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" style="width:22%;">日期</td>';
    html += '<td class="address" style="width:13%;">用户</td>';
    html += '<td class="address" style="width:22%;">IP</td>';
    html += '<td class="address" style="width:22%;">登录状态</td>';
    html += '<td class="address">原因</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_LOGIN_LOG_LIST + "?page="+pageIndex;
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
            if (typeof (result.total) != "undefined")
            {
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

LoginLogController.prototype.searchLogs = function (pageIndex,filter) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="time" style="width:22%;">日期</td>';
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
                parent.pLogPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex,filters) {
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
        switch (status)
        {
            case "0": return "成功"; 
            case "1": return "失败"; 
            default: return "";
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
    catch (err) {
        console.error("ERROR - OperationLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.LoginLogController", LoginLogController);


// ---------------------------------------------
﻿function OperationLogController(logController, viewHandle, elementId) {
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
            parent.exportLog();
        });

        $(this.pBtnRefresh).on("click", function () {
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

OperationLogController.prototype.exportLog = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_OPER_LOG;
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
    html += '<td class="time" style="width:22%;">日期</td>';
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
    html += '<td class="time" stle="width:22%;">日期</td>';
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

ContentFactory.assignToPackage("kea.base.OperationLogController", OperationLogController);


// ---------------------------------------------
﻿function NettopoController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnDetails = "#" + this.elementId + "_btnDetails";
    //set backGround
    this.imgPath = '/images/img/';
    this.bgImage = '';
    this.topoDevices = null;
    this.nodeAttribute = {
        textOffsetY: '31',
        shadow: true,
        font: 'bold 13px 微软雅黑',
        fontColor: '0,0,0',
        textPosition: 'Top_Center',
        borderColor: '220,220,220'
    };
    this.protocal = ['', 'profinet', 'modbus', 'opcda', 'dnp3', 'iec104', 'mms', 'opcua_tcp', 'ENIP-TCP', 'snmp', 'ENIP-UDP', 's7', 'ENIP-IO', 'hexagon', 'goose', 'sv', 'pnrtdcp'];
    this.linkNodeAttribute = { text: '', direction: 'vertical', strokeColor: '0,255,0' };
    this.sceneObejct = null;
    this.centerNode = null;
}

NettopoController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.NETTOPO_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);
        //init all controls and load data
        this.initControl();
    }
    catch (err) {
        console.error("ERROR - NettopoController.initShell() - Unable to initialize: " + err.message);
    }
}
NettopoController.prototype.initControl = function () {
    try {
        var parent = this;
        parent.getTopoDevices();
        //构建网络特殊直线

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        JTopo.Link.prototype.drawanimepic = function (imgurl, scene, width, height) {
            var imgnode = new JTopo.Node();
            imgnode.setSize(width ? width : 16, height ? height : 16)
            imgnode.setImage(imgurl);
            imgnode.zIndex = 2.5
            imgnode.deviceType = "flow";
            var thislink = this;
            function imgnodeanime() {
                var xs = thislink.nodeA.cx - thislink.nodeZ.cx,
                    xy = thislink.nodeA.cy - thislink.nodeZ.cy,
                    l = Math.floor(Math.sqrt(xs * xs + xy * xy)),
                    j = l;
                xl = xs / l, yl = xy / l;
                var animespeed = (new Date() / 15);//速度
                var colorpoint = parseInt(animespeed % l);
                imgnode.rotate = (Math.atan(xy / xs)) + (xs > 0 ? Math.PI : 0);
                imgnode.cx = thislink.nodeA.cx - colorpoint * xl;
                imgnode.cy = thislink.nodeA.cy - colorpoint * yl;
                window.requestAnimationFrame(imgnodeanime);
            }
            window.requestAnimationFrame(imgnodeanime);
            scene.add(imgnode);
        };
        var canvas = document.getElementById('canvas');
        canvas.width = $(document).width() - 220;
        canvas.height = $(document).height() - 72;
        var stage = new JTopo.Stage(canvas);
        $(window).resize(function () {
            var canvas1 = document.getElementById('canvas');
            var documentHeight = $(document).height();
            canvas1.height = documentHeight - 72;
            $("#mainDeviceDiv").height(documentHeight - 72);
            $("#btnDeviceNet").height(documentHeight - 72);
            $("#rightContainer").height(documentHeight - 72);
        });
        //显示工具栏
        var scene = new JTopo.Scene();
        scene.background = parent.bgImage;
        stage.add(scene);

        var cloudNode = new JTopo.Node('');
        cloudNode.setImage(parent.imgPath + 'cloud.png', true);
        cloudNode.setLocation((canvas.width - 300) / 2, (canvas.height - 72) / 2);
        cloudNode.layout = { type: 'circle', radius: 300 };
        scene.add(cloudNode);
        parent.centerNode = cloudNode;
        var arryNumlist = parent.topoDevices.rows;
        for (var i = 0; i < arryNumlist.length; i++) {
            //创建节点
            var node = parent.buildNode(i, parent.topoDevices.rows[i], parent.topoDevices.numlist, scene);
            //创建连线
            var link = parent.linkNode(cloudNode, node, false, parent.linkNodeAttribute, scene);
        }
        JTopo.layout.layoutNode(scene, cloudNode, true);
        var documentHeight=$(document).height();
        $("#mainDeviceDiv").height(documentHeight - 72);
        $("#btnDeviceNet").height(documentHeight - 72);
        $("#rightContainer").height(documentHeight - 72);
        $("#btnDeviceNet").on("click", function () {
            var parent = this;
            $("#rightContainer").toggle();
        });
        parent.sceneObejct = scene;

    }
    catch (err) {
        console.error("ERROR - NettopoController.initControls() - Unable to initialize control: " + err.message);
    }

}
//设置网络Topo图的节点
NettopoController.prototype.buildNode = function (num, nodeObject, numList, scene) {
    try {
        var parent = this;
        var node = new JTopo.Node(nodeObject[1]);
        if (nodeObject[5] == 1) {
            node.setImage(parent.imgPath + "warning_device.png", true);
        }
        else {
            node.setImage(parent.imgPath + "normal_device.png", true);
        }
        node.radius = 15;
        node.shadow = parent.nodeAttribute.shadow;
        node.font = parent.nodeAttribute.font;
        node.fontColor = parent.nodeAttribute.fontColor;
        node.textPosition = parent.nodeAttribute.textPosition;
        node.borderColor = parent.nodeAttribute.borderColor;
        //自定义属性
        node.text = nodeObject[1];
        node.deviceId = nodeObject[0];
        node.deviceMAC = nodeObject[2];
        node.deviceIP = nodeObject[3];
        var protocal = "";
        var nodeObj = (nodeObject[4] + "").split(",");
        nodeObj.sort();
        for (var i = 0; i < nodeObj.length; i++) {
            if (nodeObj[i] != nodeObj[i + 1]) {
                protocal += parent.protocal[nodeObj[i]] + ",";
            }
        }
        node.deviceProtocal = protocal.substr(0, protocal.length - 1);
        if (numList[num] > 0) {
            node.alarm = numList[num];
        }
        node.setLocation(scene.width * Math.random(), scene.height * Math.random());
        node.layout = { type: 'circle', radius: 100 };
        scene.add(node);
        node.click(function (event) {
            var parent = this;
            $("#txtDeviceName").val(parent.text);
            $("#txtDeviceIP").val(parent.deviceIP);
            $("#txtDeviceMAC").val(parent.deviceMAC);
            $("#txtDeviceProtocal").val(parent.deviceProtocal);
            $("#txtDeviceName").attr("data-key",parent.deviceId);
            $("#btnUpdate").unbind("click");

            $("#btnUpdate").bind("click", function () {               
                try {
                     var id = $("#txtDeviceName").attr("data-key");
                    var name = $("#txtDeviceName").val();
                    if (name == "")
                    {
                        layer.alert("请填写设备名称！", { icon: 2 });
                        return;
                    }
                    parent.text = $("#txtDeviceName").val();
                    var link = APPCONFIG["default"].SAVE_TOPO_DEVICES + "?id=" + id + "&name=" + name;
                    var promise = URLManager.getInstance().ajaxCall(link);
                    promise.fail(function (jqXHR, textStatus, err) {
                        console.log(textStatus + " - " + err.message);
                        layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
                    });
                    promise.done(function (result) {
                        if (result.status == 1) {
                            layer.alert("保存成功", { icon: 6 });
                        }
                        else {
                            layer.alert("保存失败", { icon: 5 });
                        }
                    });
                }
                catch (err) {
                    console.error("ERROR - NettopoController.saveDevices() - Unable to save devices control: " + err.message);
                }
            });
        });
        node.dbclick(function (event) {
            parent.getDeviceNodes();
        });

        return node;
    }
    catch (err) {
        console.error("ERROR - NettopoController.buildNode() - Unable to buildNode control: " + err.message);
    }

}
//设置节点之间的连线
NettopoController.prototype.linkNode = function (nodeA, nodeZ, boolContact, linkNodeAttributee, scene) {
    try {
        var parent = this;
        var link = new JTopo.Link(nodeA, nodeZ, linkNodeAttributee.text);
        //link.risk = risk;
        link.strokeColor = linkNodeAttributee.strokeColor;
        link.direction = linkNodeAttributee.direction;
        if (boolContact) {
            link.drawanimepic(parent.imgPath + "specialline.png", scene);
        }
        scene.add(link);
        return link;

    }
    catch (err) {
        console.error("ERROR - NettopoController.linkNode() - Unable to link node control: " + err.message);
    }
}
//获取网络TOPO 信息
NettopoController.prototype.getTopoDevices = function (scence) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_TOPO_DEVICES;
        var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
        if (beginnerGuide == "1") {
            link = APPCONFIG["default"].ID2URL["GET_TOPO_DEVICES"];
        }
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.numlist) != "undefined") {
                parent.topoDevices = result;
            }
            else {
                layer.alert("获取网络设备信息失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - NettopoController.getTopoDevices() - Unable to get devices control: " + err.message);
    }
}

NettopoController.prototype.getDeviceNodes = function () {
    try {
        var parent = this;
        var currentScene = parent.sceneObejct;
        var currentItem = currentScene.currentElement;
        var link = APPCONFIG["default"].GET_TOPO_PATH + "?mac=" + currentItem.deviceMAC;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                var temNodes = [currentScene.currentElement];
                var temLinks = [];
                //var arryNodes = currentScene.getDisplayedNodes();
                var arryNodes = currentScene.getDisplayedElements();
                var cloudNode = parent.centerNode;
                for (var i = 0; i < arryNodes.length; i++) {
                    if (arryNodes[i].elementType == "link") {
                        temLinks.push(arryNodes[i]);
                    }
                    else {
                        if (arryNodes[i].text != "" && arryNodes[i].deviceMAC != null) {
                            for (var j = 0; j < result.rows.length; j++) {
                                if (arryNodes[i].deviceMAC == result.rows[j] && arryNodes[i].deviceMAC != currentScene.currentElement.deviceMAC) {
                                    temNodes.push(arryNodes[i]);
                                }
                            }
                        }
                        else if (arryNodes[i].deviceType == "flow")
                        {
                            currentScene.remove(arryNodes[i]);
                        }
                    }
                }
                for (var n = 0; n < temLinks.length; n++) {
                    for (var m = 0; m < temNodes.length; m++) {
                        if (temLinks[n].nodeZ.deviceMAC == temNodes[m].deviceMAC) {
                            currentScene.remove(temLinks[n]);
                        }
                    }
                }
                //连线
                for (var i = 0; i < temNodes.length; i++) {
                    var link = parent.linkNode(cloudNode, temNodes[i], true, parent.linkNodeAttribute, currentScene);
                }
            }
            else {
                layer.alert("获取网络设备信息失败", { icon: 5 });
            }
        });

    }
    catch (err) {
        console.error("ERROR - NettopoController.getDeviceNodes() - Unable to get devices nodes control: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.NettopoController", NettopoController);


// ---------------------------------------------
﻿function BlacklistController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnEnableAll = "#" + this.elementId + "_btnEnableAll";
    this.pBtnDisableAll = "#" + this.elementId + "_btnDisableAll";
    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.bBtnUpload = "#" + this.elementId + "_btnUpload";
    this.pDdlFilter = "#" + this.elementId + "_ddlFilter";
    this.pFileUpload = "#" + this.elementId + "_fileUpload";
    this.pFormUpload = "#" + this.elementId + "_formUpload";
    this.pTdBlacklistList = "#" + this.elementId + "_tdBlacklistList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalBlacklist = "#" + this.elementId + "_lblTotalBlacklist";

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

        $(this.pBtnEnableAll).on("click", function () {
            parent.enableBlacklist();
        });

        $(this.pBtnDisableAll).on("click", function () {
            parent.disableBlacklist();
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
                    layer.alert("文件格式不对", { icon: 6 });
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
    }
    catch (err) {
        console.error("ERROR - BlacklistController.load() - Unable to load: " + err.message);
    }
}

BlacklistController.prototype.uploadBlacklist = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPLOAD_BLACKLIST_FILEPATH;
        jQuery.support.cors = true;
        $(this.pFormUpload).ajaxSubmit({
            type: 'post',
            url: link,//"/default.aspx",
            success: function (result) {
                if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                    switch (result.status) {
                        case 1:
                            setTimeout(function () { parent.selectRuleLibraries(1) }, 3000);
                            layer.alert("上传成功", { icon: 6 });
                            break;
                        default: layer.alert("上传失败", { icon: 5 }); break;
                    }
                }
                else {
                    layer.alert("上传失败", { icon: 5 });
                }
                layer.close(loadIndex);
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                layer.close(loadIndex);
                layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdBlacklistList).find("input[type='checkbox']").prop("checked", true);
                        layer.alert("启用所有规则成功", { icon: 6 });
                        setTimeout(function () { parent.selectBlacklists(1); }, 3000);
                        break;
                    default: layer.alert("启用所有规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("启用所有规则失败", { icon: 5 });
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdBlacklistList).find("input[type='checkbox']").prop("checked", false);
                        $(parent.pLblTotalBlacklist).text("0");
                        layer.alert("禁用所有规则成功", { icon: 6 });
                        break;
                    default: layer.alert("禁用所有规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("禁用所有规则失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.clearBlacklist() - Unable to clear all events: " + err.message);
    }
}

BlacklistController.prototype.updateBlacklist = function (id, status,obj,v) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_BLACKLIST + "?sid=" + id + "&status=" + status;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            obj.prop("checked", v);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("操作成功", { icon: 6 });
                        if (status == 1) {
                            $(parent.pLblTotalBlacklist).text(parseInt($(parent.pLblTotalBlacklist).html()) + 1);
                        }
                        else {
                            $(parent.pLblTotalBlacklist).text(parseInt($(parent.pLblTotalBlacklist).html()) - 1);
                        }
                        break;
                    default:
                        obj.prop("checked", v);
                        layer.alert("操作失败", { icon: 5 });
                        break;
                }
            }
            else {
                obj.prop("checked", v);
                layer.alert("操作失败", { icon: 5 });
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
    html += '<td class="address" style="width:12%">序号</td>';
    html += '<td class="address" style="width:40%">漏洞名称</td>';
    html += '<td class="address" style="width:12%">发布时间</td>';
    html += '<td class="address" style="width:12%">启用状态</td>';
    html += '<td class="IPaddress" style="width:10%;">事件处理</td>';
    html += '<td class="address" style="width:12%">风险等级</td>';
    html += '<td class="address" style="width:12%">内容</td>';
    html += '</tr>';
    try {
        var parent = this;
        var filter = $(parent.pDdlFilter + " option:selected").val();
        var link = APPCONFIG["default"].GET_BLACKLIST_LIST + "?page=" + pageIndex;
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
                    for (var i = 0; i < result.rows.length; i++) {
                        parent.pSids.push(result.rows[i][0]);
                        html += "<tr>";
                        html += "<td style='width:12%'>" + ((pageIndex - 1) * 10 + 1 + i) + "</td>";
                        html += "<td style='width:40%;text-align: left;padding-left:5px;' title='" + result.rows[i][0] + "'>" + FormatterManager.stripText(result.rows[i][0], 44) + "</td>";
                        html += "<td style='width:12%'>" + result.rows[i][1] + "</td>";
                        html += "<td style='width:12%'><input type='checkbox' data-key='" + result.rows[i][4] + "' " + parent.formatStatus(result.rows[i][2]) + " /></td>";
                        if (result.rows[i][5] == 0) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option selected='selected'  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>阻断</option></select></td>";
                        }
                        else if (result.rows[i][5] == 1) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option  value='0'>通过</option> <option selected='selected' value='1'>警告</option><option value='2'>阻断</option></select></td>";
                        }
                        else {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][4] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option selected='selected'  value='2'>阻断</option></select></td>";
                        }
                        html += "<td style='width:12%'>" + parent.formatRiskLevel(result.rows[i][3]) + "</td>";
                        html += "<td style='width:10%'><button class='details' data-key='" + result.rows[i][4] + "'>详情</button></td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='6'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='6'>暂无数据</td></tr>";
            }
            $(parent.pTdBlacklistList).html(html);
            layer.close(loadIndex);
            if (typeof (result.num) != "undefined") {
                $(parent.pLblTotalBlacklist).text(result.num);
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

            $(parent.pTdBlacklistList).find("input[type='checkbox']").on("click", function (event) {
                var id = $(this).attr("data-key");
                var status = $(this).prop("checked") ? 1 : 0;
                parent.updateBlacklist(id, status, $(this), !$(this).prop("checked"));
            });

            $(parent.pTdBlacklistList).find("select").each(function () {
                $(this).change(function () {
                    var id = $(this).attr("data-key");
                    var value = $(this).val();
                    var link = APPCONFIG["default"].UPDATE_BLACKLIST_EVENT + "?action=" + value + "&sid=" + id;
                    var promise = URLManager.getInstance().ajaxCall(link);
                    promise.fail(function (jqXHR, textStatus, err) {
                        console.log(textStatus + " - " + err.message);
                        layer.alert("事件处理失败", { icon: 5 });
                    });
                    promise.done(function (result) {
                        if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                            switch (result.status) {
                                case 1:
                                    layer.alert("事件处理成功", { icon: 6 });
                                    break;
                                default: layer.alert("事件处理失败", { icon: 5 }); break;
                            }
                        }
                        else {
                            layer.alert("事件处理失败", { icon: 5 });
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
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_BLACKLIST_ALLEVENT + "?action=" + operationId ;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $(parent.pTdBlacklistList).find("select").val(operationId).attr("selected", true);
                        layer.alert("处理成功", { icon: 6 });
                        layer.close(loadIndex);
                        break;
                    default: layer.alert("设置失败", { icon: 5 });
                        layer.close(loadIndex);
                        break;
                }
            }
            else {
                layer.alert("设置失败", { icon: 5 });
                layer.close(loadIndex);
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.updateBlackEvent() - Unable to update backlist event: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.BlacklistController", BlacklistController);


// ---------------------------------------------
﻿function MacRuleController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnRefresh = "#" + this.elementId + "_btnRefresh";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
    this.pBtnDisable = "#" + this.elementId + "_btnDisable";

    this.pTxtIP = "#" + this.elementId + "_txtIP";
    this.pTxtMac = "#" + this.elementId + "_txtMac";
    this.pTxtDevice = "#" + this.elementId + "_txtDevice";
    this.pBtnAdd = "#" + this.elementId + "_btnAdd";

    this.pTdRuleList = "#" + this.elementId + "_tdRuleList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalRule = "#" + this.elementId + "_lblTotalRule";

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

        $(this.pBtnAdd).on("click", function () {
            parent.addRule();
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pRulePager = null;
            parent.selectRules(1);
        });

        $(this.pBtnDisable).on("click", function () {
            parent.disableRule();
        });

        $(this.pBtnEnable).on("click", function () {
            parent.enableRule($("input[name='macEvent']:checked").val());
           
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.initControls() - Unable to initialize control: " + err.message);
    }
}

MacRuleController.prototype.load = function () {
    try {
        this.selectRules(1);
        this.getInitEventAction();
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
            layer.alert("设备名称不能为空", { icon: 5 });
            return false;
        }
        if (device.length>16) {
            layer.alert("设备名称不能超过16个字符", { icon: 5 });
            return false;
        }
        if (!Validation.validateIP(ip)) {
            layer.alert("请输入正确有效的IP地址", { icon: 5 });
            return false;
        }
        if (!Validation.validateMAC(mac)) {
            layer.alert("请输入正确有效的MAC地址", { icon: 5 });
            return false;
        }
        var link = APPCONFIG["default"].ADD_RULE_MAC + "?name=" + device.toLowerCase()+ "&ip=" + ip + "&mac=" + mac.toLowerCase();
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        setTimeout(function () { parent.selectRules(1); },3000);
                        break;
                    case -1: layer.alert("当前规则已经存在，请不要重复添加", { icon: 5 }); break;
                    case 0: layer.alert("规则数量超出上限", { icon: 5 }); break;
                    case 2: layer.alert("白名单正在学习中...请稍后操作.", { icon: 5 }); break;
                    default: layer.alert("添加规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("添加规则失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to export all events: " + err.message);
    }
}

MacRuleController.prototype.disableRule = function () {
    try {
        var parent = this;
        if ($(this.pLblTotalRule).html() == "0") {
            layer.alert("当前没有可以操作的规则", { icon: 5 });
            return;
        }
        var link = APPCONFIG["default"].DISABLE_RULE_MAC;
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
                        $(parent.pTdRuleList).find("input[type='checkbox']").prop("checked", false);
                        layer.close(loadIndex);
                        break;
                    default: layer.alert("禁用所有规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("禁用所有规则失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to export all events: " + err.message);
    }
}

MacRuleController.prototype.enableRule = function (val) {
    try {
        var parent = this;
        if ($(this.pLblTotalRule).html() == "0") {
            layer.alert("当前没有可以操作的规则", { icon: 5 });
            return;
        }
        var link = APPCONFIG["default"].ENABLE_RULE_MAC + "?action=" + val;
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
                        $(parent.pTdRuleList).find("input[type='checkbox']").prop("checked", true);
                        break;
                    case 2: layer.alert("白名单正在学习中...请稍后操作.", { icon: 5 }); break;
                    default: layer.alert("启用所有规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("启用所有规则失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to deploy rules: " + err.message);
    }
}

MacRuleController.prototype.deleteRule = function (id,$tr) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_RULE_MAC + "?id=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        $tr.remove();
                        var cur = parseInt($(parent.pLblTotalRule).text()) - 1;
                        $(parent.pLblTotalRule).text(cur);
                        break;
                    default: layer.alert("删除规则失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("删除规则失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - MacRuleController.exportLog() - Unable to delete this rule: " + err.message);
    }
}

MacRuleController.prototype.updateRule = function (id,status,obj,v) {
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_RULE_MAC + "?id=" + id + "&status=" + status + "&action=" + $("input[name='macEvent']:checked").val();
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            obj.prop("checked", v);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:break;
                    case 2:
                        layer.alert("白名单正在学习中,请稍后操作...", { icon: 5 });
                        obj.prop("checked", v);
                        break;
                    default:
                        layer.alert("修改失败", { icon: 5 });
                        obj.prop("checked", v);
                        break;
                }
            }
            else {
                obj.prop("checked", v);
                layer.alert("修改失败", { icon: 5 });
            }
            layer.close(loadIndex);
        });
    }
    catch (err) {
        obj.prop("checked", v);
        console.error("ERROR - MacRuleController.exportLog() - Unable to save this rule: " + err.message);
    }
}

MacRuleController.prototype.selectRules = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">设备名称</td>';
    html += '<td class="address" style="width:18%;">IP地址</td>';
    html += '<td class="address" style="width:18%;">MAC地址</td>';
    html += '<td class="address style="width:8%;"">启用状态</td>';
    html += '<td class="address" style="width:8%;">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_RULE_MAC_LIST + "?page=" + pageIndex;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";;
            $(parent.pTdRuleList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:18%;text-align:center;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:18%;text-align:center;'>" + result.rows[i][3] + "</td>";
                        if (result.rows[i][4] == 1) {
                            html += "<td style='width:8%;'><input type='checkbox' checked='checked' data-key='" + result.rows[i][0] + "' /></td>";
                        }
                        else {
                            html += "<td style='width:8%;'><input type='checkbox' data-key='" + result.rows[i][0] + "' /></td>";
                        }
                        html += "<td style='color:#1ca826;width:8%;'><button class='button_delete button_small' data-key='" + result.rows[i][0] + "'>删除</button></td>";
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
                $(parent.pLblTotalRule).text(result.total);
            }
            $(parent.pTdRuleList).html(html);
            layer.close(loadIndex);

            $(parent.pTdRuleList).find("button[class='button_delete button_small']").on("click", function () {
                var id = $(this).attr("data-key");
                parent.deleteRule(id,$(this).parent().parent());
            });

            $(parent.pTdRuleList).find("input[type='checkbox']").on("change", function () {
                var id = $(this).attr("data-key");
                var status = $(this).prop("checked")?1:0;
                parent.updateRule(id, status, $(this), !$(this).prop("checked"));
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
        html += "<tr><td colspan='5'>暂无数据</td></tr>";;
        $(this.pTdRuleList).html(html);
        console.error("ERROR - MacRuleController.selectRules() - Unable to get all events: " + err.message);
    }
}


MacRuleController.prototype.getInitEventAction = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_RULE_MAC_EVENT;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.action) != "undefined") {
                switch (result.action) {
                    case 1:
                        $("input[name='macEvent'][value='1']").attr("checked",true);
                        break;
                    case 2:
                        $("input[name='macEvent'][value='2']").attr("checked", true);
                        break;
                    default: layer.alert("读取失败", { icon: 5 }); break;
                }
               
            }
            else {
                layer.alert("读取失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.getInitEventAction() - Unable to get InitEventAction: " + err.message);
    }
}

MacRuleController.prototype.setEventAction = function (val) {
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].SET_RULE_MAC_EVENT + "?action=" + val;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("处理成功", { icon: 6 });
                        layer.close(loadIndex);
                        break;
                    default: layer.alert("处理失败", { icon: 5 });
                        layer.close(loadIndex);
                        break;
                }
            }
            else {
                layer.alert("处理失败", { icon: 5 });
                layer.close(loadIndex);
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.setEventAction() - Unable to set EventAction: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.MacRuleController", MacRuleController);


// ---------------------------------------------
﻿function WhitelistController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.isAllChecked = false;
    this.allRules = [];
    this.checkedRules = [];

    this.pBtnDisable = "#" + this.elementId + "_btnDisable";
    this.pBtnEnable = "#" + this.elementId + "_btnEnable";
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
    this.pLblStudyRuleCount = "#" + this.elementId + "_lblStudyRuleCount";
    this.pDllEvent = "#" + this.elementId + "_dllEventAll";
    this.studyTimer = null;

    this.pWhitelistPager = null;
    this.pDetailsWhitelistPager = null;
    this.pDetailViewHandle = null;
    this.pDetailproto = null;
    this.pDetailmac = null;
    this.pDetailid = null;
    this.pExpand = false;
    this.pCurrentPageIndex = 1;

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
                parent.checkedRules = parent.allRules;
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

        $(this.pBtnDisable).on("click", function () {
            parent.updateWhitelist(parent.checkedRules, 0);
        });

        $(this.pTxtStartDatetime).on("click", function () {
            var startTime = $(".systemtime>p").text();
            return WdatePicker({ dateFmt: 'yyyy-MM-dd HH:mm:00', minDate: startTime });
        });

        $(this.pBtnRefresh).on("click", function () {
            parent.pWhitelistPager = null;
            var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
            if (beginnerGuide != "1") {
                parent.selectWhitelist(1);
            }
        });
        $(this.pDllEvent).on("change", function () {
            parent.updateWhitelistEvent($(this).val());
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
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
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

WhitelistController.prototype.updateWhitelistAll = function (status) {
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
        console.error("ERROR - WhitelistController.updateWhitelist() - Unable to disable/enable whitelist: " + err.message);
    }
}

WhitelistController.prototype.updateWhitelist = function (sids, status) {
    try {
        var parent = this;
        if (parent.checkedRules==null||parent.checkedRules.length == 0) {
            layer.alert("你还没有选中任何规则，无法操作", { icon: 5 });
            return false;
        }
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
                        if (parent.pExpand==true) {
                            parent.getWhitelistDetails(parent.pDetailViewHandle, 1, parent.pDetailproto, parent.pDetailmac, parent.pDetailid);

                        }
                        else {
                            parent.selectWhitelist(1);
                        }
                        layer.alert("操作成功", { icon: 6 });
                        break;
                    case 2: layer.alert("白名单正在学习中...请稍后操作.", { icon: 5 }); break;
                    default: layer.alert("操作失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("操作失败", { icon: 5 });
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
            layer.alert("请选择开始时间", { icon: 5 });
            return;
        }
        if (new Date($.trim(starttime).replace(/-/g, '/')) < curDatetime)
        {
            layer.alert("开始学习时间必须在系统时间之后", { icon: 5 });
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
        console.error("ERROR - WhitelistController.stopStudyWhitelist() - Unable to stop study rule: " + err.message);
    }
}

WhitelistController.prototype.selectWhitelist = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="list" style="width:8%;">序号</td>';
    html += '<td class="devicename">设备名称</td>';
    html += '<td class="IPaddress" style="width:12%;">IP地址</td>';
    html += '<td class="IPaddress" style="width:12%;">MAC地址</td>';
    html += '<td class="IPaddress" style="width:12%;">协议</td>';
    html += '<td class="IPaddress" style="width:8%;">风险等级</td>';
    html += '<td class="IPaddress" style="width:8%;">操作</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_WHITELIST_DEVICE + "?page=" + pageIndex;
        var beginnerGuide = CookieManager.getCookieValue("beginnerGuide");
        if (beginnerGuide == "1") {
            link = APPCONFIG["default"].ID2URL["GET_WHITELIST_DEVICE"];
        }
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
                        html += "<td style='width:8%;'>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                        html += "<td style='text-align:left;' title='" + result.rows[i][1] + "'>" + FormatterManager.stripText(result.rows[i][1], 30) + "</td>";
                        html += "<td style='width:12%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:13%;'>" + result.rows[i][3] + "</td>";
                        html += "<td style='width:12%;'>" + parent.protocal[result.rows[i][4]] + "</td>";
                        html += "<td style='width:8%;'>中</td>";
                        html += "<td style='width:8%;'><button class='details' id='" + result.rows[i][0] + "' status='0' mac='" + result.rows[i][3] + "' proto='" + result.rows[i][4] + "'>详情</button>&nbsp;&nbsp;</td>";
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
                $(parent.pLblStudyRuleCount).text(result.num);
            }

            $(parent.pTdWhitelist).html(html);
            $(".arrowsbox.pos-arrows02").show();
            layer.close(loadIndex);

            $(parent.pTdWhitelist).find("button[class='details']").on("click", function (event) {
                if(parent.pExpand==false)
                {
                    parent.pExpand = true;
                }
                else
                {
                    parent.pExpand = false;
                }
                var mac = $(this).attr("mac");
                var proto = $(this).attr("proto");
                var id = $(this).attr("id");
                var status = $(this).attr("status");
                if (status == "0") {
                    parent.pDetailsWhitelistPager = null;
                    $(parent.pTdWhitelist).find("button[class='details']").attr("status", "0");
                    $(parent.pTdWhitelist).find("td[colspan='8']").parent().remove();
                    var lastTr = $(this).parent().parent();
                    var html = '<tr><td colspan="8" style="width:100%;" align="center">';
                    html += '<div class="tabel_div" style="padding:5px 5px;margin-bottom:0px;">';
                    html += '<table style="width:100%;"></table>';
                    html += '</div>';
                    html += "<div class='page' style='padding-right:5px;margin-bottom:10px;' data-id='" + parent.elementId + "_details_pagerContent" + id + "' id='" + parent.elementId + "_details_pagerContent" + id + "'></div>";
                    html += '</td></tr>';
                    var viewHandler = lastTr.after(html).next().find("table");
                    parent.pDetailViewHandle = viewHandler;
                    parent.pDetailproto = proto;
                    parent.pDetailmac = mac;
                    parent.pDetailid = id;
                    parent.getWhitelistDetails(viewHandler, 1, proto, mac, id);
                    $(this).attr("status", "1");
                }
                else {
                    $(this).parent().parent().next().remove();
                    $(this).attr("status", "0");
                }
            });
           

            if (parent.pWhitelistPager == null) {
                parent.checkedRules = result.checklist;
                parent.allRules = result.alllist;
            }
            if (parent.pWhitelistPager == null && result.rows.length > 0) {
                parent.pWhitelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectWhitelist(pageIndex);
                    parent.pCurrentPageIndex = pageIndex;
                });
                parent.pWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='8'>暂无数据</td></tr>";
        $(this.pTdWhitelist).html(html);
        console.error("ERROR - WhitelistController.selectWhitelist() - Unable to get whitelist: " + err.message);
    }
}

WhitelistController.prototype.getWhitelistDetails = function (viewHandler, pageIndex, proto, mac, id) {
    var parent = this;
    var loadIndex = layer.load(2);
    var html = '';
    try {
        html += '<tr class="wtitle">';
        html += '<td><input type="checkbox" id="chkWhitelistDetails' + id + '" data-key="0" /></td>';
        html += '<td style="width:5%;">序号</td>';
        html += '<td style="width:25%;">规则名</td>';
        html += '<td style="width:55%;">操作码</td>';
        html += '<td style="width:10%;">事件处理</td>';
        html += '<td style="width:10%;">启用状态</td>';
        html += '</tr>';
        var link = APPCONFIG["default"].GET_WHITELIST_RULE + "?page=" + pageIndex + "&proto=" + proto + "&mac=" + mac;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='6'>暂无数据</td></tr>";
        });
        promise.done(function (result) {
            if (typeof (result.rows) != "undefined" && result.rows.length > 0) {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += '<td><input type="checkbox" data-key="' + result.rows[i][3] + '" /></td>';
                        html += "<td style='width:5%;'>" + ((pageIndex - 1) * 10 + i + 1) + "</td>";
                        html += "<td style='width:25%;' title='" + result.rows[i][0] + "'>" + FormatterManager.stripText(result.rows[i][0], 30) + "</td>";
                        html += "<td style='width:55%;text-align:left;' title='" + result.rows[i][1] + "'>" + FormatterManager.stripText(result.rows[i][1], 85) + "</td>";
                        if (result.rows[i][4] == 0) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][3] + "'><option selected='selected'  value='0'>通过</option> <option  value='1'>警告</option><option value='2'>阻断</option></select></td>";
                        }
                        else if (result.rows[i][4] == 1) {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][3] + "'><option  value='0'>通过</option> <option selected='selected' value='1'>警告</option><option value='2'>阻断</option></select></td>";
                        }
                        else {
                            html += "<td style='width:10%;'><select class='select-note' data-key='" + result.rows[i][3] + "'><option  value='0'>通过</option> <option  value='1'>警告</option><option selected='selected'  value='2'>阻断</option></select></td>";
                        }
                        html += "<td style='width:10%;text-align:center;'>" + (result.rows[i][2] == 1 ? "启用" : "禁用") + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='6'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='6'>暂无数据</td></tr>";
            }

            viewHandler.html(html);

            layer.close(loadIndex);

            $(viewHandler).find("select").each(function () {
                $(this).change(function () {
                    var id = $(this).attr("data-key");
                    var value = $(this).val();
                    var link = APPCONFIG["default"].UPDATE_WHITELIST_EVENT + "?action=" + value + "&sid=" + id;
                    var promise = URLManager.getInstance().ajaxCall(link);
                    promise.fail(function (jqXHR, textStatus, err) {
                        console.log(textStatus + " - " + err.message);
                        layer.alert("事件处理失败", { icon: 5 });
                    });
                    promise.done(function (result) {
                        if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                            switch (result.status) {
                                case 1:
                                    layer.alert("事件处理成功", { icon: 6 });
                                    break;
                                default: layer.alert("事件处理失败", { icon: 5 }); break;
                            }
                        }
                        else {
                            layer.alert("事件处理失败", { icon: 5 });
                        }
                    });
                });
            });

            $(viewHandler).find("input:checkbox").each(function () {
                var id = $(this).attr("data-key");
                var isExits = $.inArray(id, parent.checkedRules);
                if (isExits >= 0) {
                    $(this).prop("checked", true);
                }
            });

            $(viewHandler).find("#chkWhitelistDetails" + id).on("change", function () {
                var checked = $(this).prop("checked");
                $(viewHandler).find("input:checkbox").prop("checked", checked);
                $(viewHandler).find("input:checkbox").each(function () {
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

            $(viewHandler).find("input:checkbox").on("change", function () {
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

            if (parent.pDetailsWhitelistPager == null && result.rows.length > 0) {
                parent.pDetailsWhitelistPager = new kea.base.utility.PagerController($(parent.pDetailsPagerContent + id), parent.elementId + "_details", 10, result.total, function (pageIndex, filters) {
                    parent.getWhitelistDetails(viewHandler, pageIndex, proto, mac, id);
                });
                parent.pDetailsWhitelistPager.init(Constants.TEMPLATES.UTILITY_PAGER2);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='6'>暂无数据</td></tr>";
        viewHandler.html(html);
        console.error("ERROR - KnowWhitelistController.getWhitelistDetails() - Unable to get rule information: " + err.message);
    }
}

WhitelistController.prototype.updateWhitelistEvent = function (operationId) {
    try {
        var parent = this;
        if (parent.checkedRules == null || parent.checkedRules.length == 0) {
            layer.alert("你还没有选中任何规则，无法操作", { icon: 5 });
            return false;
        }
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].UPDATE_WHITELIST_ALLEVENT + "?action=" + operationId + "&sids=" + parent.checkedRules.join(",");
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        if (parent.pExpand == true) {
                            parent.getWhitelistDetails(parent.pDetailViewHandle, 1, parent.pDetailproto, parent.pDetailmac, parent.pDetailid);

                        }
                        else {
                            parent.selectWhitelist(parent.pCurrentPageIndex);
                        }
                        layer.alert("处理成功", { icon: 6 });
                        layer.close(loadIndex);
                        break;
                    default: layer.alert("设置失败", { icon: 5 });
                        layer.close(loadIndex);
                        break;
                }
            }
            else {
                layer.alert("设置失败", { icon: 5 });
                layer.close(loadIndex);
            }
        });
    }
    catch (err) {
        console.error("ERROR - WhitelistController.updateWhitelistEvent() - Unable to update whitelist event: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.WhitelistController", WhitelistController);


// ---------------------------------------------
﻿function UserController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pUserName = "#" + this.elementId + "_userName";
    this.pUserForm = "#" + this.elementId + "_userForm";
    this.pNewUserForm = "#" + this.elementId + "_newUserForm";
    this.pNewPassword = "#" + this.elementId + "_newPassword";
    this.pNewPasswordInfo = "#" + this.elementId + "_newPasswordInfo";
    this.pNewPassword1 = "#" + this.elementId + "_newPassword1";
    this.pNewUserName = "#" + this.elementId + "_newUserName";
    this.pNewUserPassword = "#" + this.elementId + "_newUserPassword";
    this.pOldUserPassword = "#" + this.elementId + "_oldPassword";
    this.pNewUserPasswordInfo = "#" + this.elementId + "_newUserPasswordInfo";
    this.pNewUserPassword1 = "#" + this.elementId + "_newUserPassword1";
    this.pChangePassword = "#" + this.elementId + "_changePassword";
    this.pAddUser = "#" + this.elementId + "_addUser";
    this.pUserList = "#" + this.elementId + "_userList";
}

UserController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.USER_EDIT), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - UserController.init() - Unable to initialize: " + err.message);
    }
}

UserController.prototype.initControls = function () {
    try {
        var parent = this;
        //bind validate form
        $(this.pUserForm).Validform({
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.parent().find("input").attr("errormsg"));
                }
            },
        });
        $(this.pNewUserForm).Validform({
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.parent().find("input").attr("errormsg"));
                }
            }
        });

        //bind event
        $(this.pNewPassword1).on("change", function () {
            var newPassword = $(parent.pNewPassword).val();
            var newPassword1 = $(parent.pNewPassword1).val();
            if (newPassword != newPassword1) {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").css("color", "#ff0000").addClass("Validform_wrong").text("两次输入的密码不一致");
            }
            else {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pChangePassword).on("click", function () {
            var newPassword = $(parent.pNewPassword).val();
            var newPassword1 = $(parent.pNewPassword1).val();
            var oldPassword = $(parent.pOldUserPassword).val();
            if (newPassword != newPassword1) {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
                return false;
            }
            else {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
                if (!Validation.validatePassword(newPassword)) {
                    layer.alert("密码必须由字母、数字、特殊字符(@,!,#)组成，长度6到16位", { icon: 5 });
                    return false;
                }
                parent.changePassword(newPassword,oldPassword);
                return false;
            }
        });

        //add user
        $(this.pNewUserPassword1).on("change", function () {
            var newUserPassword = $(parent.pNewUserPassword).val();
            var newUserPassword1 = $(parent.pNewUserPassword1).val();
            if (newUserPassword != newUserPassword1) {
                $(parent.pNewUserPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
            }
            else {
                $(parent.pNewUserPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pAddUser).on("click", function () {
            var newUserName = $(parent.pNewUserName).val();
            var newUserPassword = $(parent.pNewUserPassword).val();
            var newUserPassword1 = $(parent.pNewUserPassword1).val();
            if (newUserPassword != newUserPassword1) {
                $(parent.newUserPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
                return false;
            }
            else {
                $(parent.newUserPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
                if (!Validation.validateUserName(newUserName))
                {
                    layer.alert("用户名必须为4-25个字符", { icon: 5 });
                    return false;
                }
                if (!Validation.validatePassword(newUserPassword)) {
                    layer.alert("密码必须由字母、数字、特殊字符(@,!,#)组成，长度6到16位", { icon: 5 });
                    return false;
                }
                parent.addUser(newUserName, newUserPassword);
                return false;

            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.initControls() - Unable to initialize control: " + err.message);
    }
}

UserController.prototype.load = function () {
    try {
        this.getUser();
        this.selectUsers();
    }
    catch (err) {
        console.error("ERROR - UserController.load() - Unable to load: " + err.message);
    }
}

UserController.prototype.getUser = function () {
    try {
        $(this.pUserName).text(AuthManager.getInstance().getUserName());
    }
    catch (err) {
        console.error("ERROR - UserController.getUser() - Unable to get current user information: " + err.message);
    }
}

UserController.prototype.changePassword = function (pwd,oldPwd) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].CHANGE_USER_PWD;
        var data = { newpwd: pwd, oldpwd: oldPwd, username: AuthManager.getInstance().getUserName() };
        var promise = URLManager.getInstance().ajaxCallPost(link, data);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
            return false;
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0: layer.alert("原始密码错误，修改密码失败", { icon: 5 }); return false;
                    case 1: layer.alert("修改密码成功", { icon: 6 }); return false;
                    default: layer.alert("修改密码失败", { icon: 5 });return false;
                }
            }
            else {
                layer.alert("修改密码失败", { icon: 5 });
                return false;
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.changePassword() - Unable to change password for user: " + err.message);
        return false;
    }
}

UserController.prototype.addUser = function (uname, pwd) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].ADD_USER;
        var data = { user: uname, password: pwd};
        var promise = URLManager.getInstance().ajaxCallPost(link,data);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
            return false;
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0: layer.alert("用户人数上限", { icon: 1 }); return false;
                    case 1: layer.alert("用户已经存在", { icon: 2 }); return false;
                    case 2:
                        layer.alert("添加用户成功", { icon: 6 });
                        setTimeout(function () {
                            parent.selectUsers();
                        }, 3000);
                        return false;
                    default: layer.alert("添加用户失败", { icon: 5 }); return false;
                }
            }
            else {
                layer.alert("添加用户失败", { icon: 5 });
                return false;
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.addUser() - Unable to add new user: " + err.message);
        return false;
    }
}

UserController.prototype.removeUser = function (id,$tr) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_USER + "?id=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", { icon: 2 });
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("删除用户成功", { icon: 6 });
                        var userId = AuthManager.getInstance().getUserId();
                        if (typeof(userId) != "undefined" && userId != null && userId != 0&&userId==id) {
                            LocalStorageManager.getInstance().deleteProperty(APPCONFIG.LOGIN_RESPONSE);
                            AuthManager.timedOut = true;
                            AuthManager.getInstance().logOut();
                        }
                        $tr.remove();
                        break;
                    default: layer.alert("删除用户失败", { icon: 5 }); break;
                }
            }
            else {
                layer.alert("删除用户失败", { icon: 5 });
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.removeUser() - Unable to remove user: " + err.message);
    }
}

UserController.prototype.selectUsers = function () {
    var colspanRow = "<tr><td colspan='2'>暂无数据</td></tr>";
    var html = "";
    html += '<tr class="title">';
    html += '<td class="username">用户名</td>';
    html += '<td class="usertime">上次登录时间</td>';
    var userName=AuthManager.getInstance().getUserName().toLowerCase();
    if (userName == "admin") {
        html += '<td>操作</td>';
        colspanRow = "<tr><td colspan='3'>暂无数据</td></tr>";
    }
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_USER_LIST + "?page=1";
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += colspanRow;
            $(parent.pUserList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td>" + result.rows[i][1] + "</td>";
                        html += "<td>" + result.rows[i][2] + "</td>";
                        if (AuthManager.getInstance().getUserName().toLowerCase() == "admin") {
                            if (result.rows[i][1] != "admin") {
                                html += "<td><button class='button_delete button' id='" + result.rows[i][0] + "'>删除</button></td>";
                            }
                            else {
                                html += "<td></td>";
                            }
                        }
                        html += "</tr>";
                    }
                }
                else {
                    html += colspanRow;
                }
            }
            else {
                html += colspanRow;
            }
            $(parent.pUserList).html(html);
            $(parent.pUserList).find("button").on("click", function (event) {
                parent.removeUser($(this).attr("id"),$(this).parents("tr"));                
                return false;
            });
        });
    }
    catch (err) {
        html += colspanRow;
        $(this.pUserList).html(html);
        console.error("ERROR - UserController.selectUsers() - Unable to load all users: " + err.message);
    }
}

UserController.prototype.checkPasswordPriority = function (password) {
    try {
        var parent = this;
        var reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#]).{6,16}$/;
        if (reg.test(password)) {
            if (password.length >= 6 && password.length < 8) {
                return "low";
            }
            else if (password.length >= 8 && password.length < 12) {
                return "middle";
            }
            else if (password.length >= 12 && password.length <= 16) {
                return "high";
            }
            else {
                return "";
            }
        }
        return "";
    }
    catch (err) {
        console.error("ERROR - UserController.selectUsers() - Unable to load all users: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.UserController", UserController);

