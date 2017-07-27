function FlowDetailAuditController(viewHandle, elementId, mac,controller) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.controller = controller;
    this.mac = mac;

    this.pDdlTime1 = "#" + this.elementId + "_ddlTime1";
    this.pDdlTime2 = "#" + this.elementId + "_ddlTime2";
    this.pDivLineChart = this.elementId + "_divLineChart";
    this.pDivPieChart = this.elementId + "_divPieChart";

    this.pTdFlowList = "#" + this.elementId + "_tdFlowList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalFlow = "#" + this.elementId + "_lblTotalFlow";

    this.pPager = null;

    this.lineChart = null;
    this.pieChart = null;
    this.protocolFlowTimer = null;
}

FlowDetailAuditController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_FLOW_DETAIL), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - FlowDetailAuditController.initShell() - Unable to initialize: " + err.message);
    }
}

FlowDetailAuditController.prototype.initControls = function () {
    try {
        var parent = this;

        $(".rule-single-select").ruleSingleSelect();

        $(this.pDdlTime1).on("change", function () {
            parent.lineChart = parent.initLineChart(parent.pDivLineChart, parent.selectProtocolFlowTotal());
        });

        $(this.pDdlTime2).on("change", function () {
            parent.pieChart = parent.initPieChart(parent.pDivPieChart, parent.selectDeviceProtocolPerc());
        });

        this.lineChart = this.initLineChart(this.pDivLineChart, this.selectProtocolFlowTotal());
        this.pieChart = this.initPieChart(this.pDivPieChart, parent.selectDeviceProtocolPerc());
        $(window).resize(function () {
            parent.lineChart.resize();
            parent.pieChart.resize();
        });

        clearInterval(this.protocolFlowTimer);
        this.protocolFlowTimer = setInterval(function () {
            var data = parent.selectSingleProtocolFlowTotal();
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
        }, 20000)
    }
    catch (err) {
        console.error("ERROR - FlowDetailAuditController.initControls() - Unable to initialize control: " + err.message);
    }
}

FlowDetailAuditController.prototype.load = function () {
    try {
        this.pPager = null;
        this.selectDeviceProtocol(1);
    }
    catch (err) {
        console.error("ERROR - FlowDetailAuditController.load() - Unable to load: " + err.message);
    }
}

FlowDetailAuditController.prototype.selectProtocolFlowTotal = function () {
    try {
        var parent = this;
        var data = {
            x: [],
            y: []
        };
        var link = APPCONFIG["default"].GET_DEVICE_FLOW+"?mac="+this.mac;
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
        console.error("ERROR - FlowAuditController.selectFlow() - Unable to get all events: " + err.message);
        return data;
    }
}

FlowDetailAuditController.prototype.selectSingleProtocolFlowTotal = function () {
    try {
        var parent = this;
        var data = {
            x: '',
            y: 0
        };
        var link = APPCONFIG["default"].GET_DEVICE_FLOW_POINT + "?mac=" + this.mac;
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
        console.error("ERROR - FlowAuditController.selectSingleProtocolFlowTotal() - Unable to get all events: " + err.message);
        return data;
    }
}

FlowDetailAuditController.prototype.selectDeviceProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address">协议名</td>';
    html += '<td class="address style="width:40%;"">平均流量百分比(一周)</td>';
    html += '<td class="address style="width:20%;"">更新时间</td>';
    html += '</tr>';
    try {
        var parent = this;
        var loadIndex = layer.load(2);
        var link = APPCONFIG["default"].GET_DEVICE_FLOW_LIST + "?page=" + pageIndex + "&mac=" + this.mac;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdFlowList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='text-align:left;padding-left:5px;'>" + result.rows[i][0] + "</td>";
                        html += "<td style='width:40%;text-align:center;'>" + (result.rows[i][1] * 100).toFixed(2) + "%</td>";
                        html += "<td style='width:20%;'>" + result.rows[i][2] + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalFlow).text(result.total);
            }

            $(parent.pTdFlowList).html(html);
            layer.close(loadIndex);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 3, result.total, function (pageIndex, filters) {
                    parent.selectDeviceProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdFlowList).html(html);
        console.error("ERROR - FlowDetailAuditController.selectProtocolFlow() - Unable to get all events: " + err.message);
    }
}

FlowDetailAuditController.prototype.selectDeviceProtocolPerc = function () {
    var html = "";
    try {
        var parent = this;
        var data = {
            name: [],
            item: []
        };
        var timeFlag = $(this.pDdlTime2 + " option:selected").val();
        var link = APPCONFIG["default"].GET_DEVICE_PROTOCOL_FLOW + "?timeDelta=" + timeFlag + "&mac=" + this.mac;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][1] != 0) {
                        var color = parent.controller.color[i];
                        if (result.rows[i][0].toLowerCase() == "others") {
                            color = parent.controller.color[5];
                        }
                        var item = parent.controller.createPieStruct(result.rows[i][0], result.rows[i][1], color);
                        data.name.push(result.rows[i][0]);
                        data.item.push(item);
                    }
                }
            }
        });

        return data;
    }
    catch (err) {
        console.error("ERROR - FlowDetailAuditController.selectProtocolFlow() - Unable to get all events: " + err.message);
        return data;
    }
}

FlowDetailAuditController.prototype.initLineChart = function (id, data) {
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
                max: data.y.length == 0 ? 1 : Math.ceil(Math.max.apply(null, data.y)) + 0.1,
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

FlowDetailAuditController.prototype.initPieChart = function (id, data) {
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

ContentFactory.assignToPackage("kea.base.FlowDetailAuditController", FlowDetailAuditController);

