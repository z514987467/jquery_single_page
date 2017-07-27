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
        var data = {x: '', y: 0};
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
                        html += "<td style='text-align:left;padding-left:5px;' title='" + result.rows[i][5] + "'>" + FormatterManager.stripText(result.rows[i][5], 18) + "</td>";
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
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#DBDBDB'
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
                        type: 'dashed'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#DBDBDB'
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
        ],
        noDataLoadingOption: {
            text: '暂无数据',
            effect: 'bar'
        }
    };

    pie.setOption(option);

    return pie;
}

FlowAuditController.prototype.createPieStruct = function (name, value, color) {
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

ContentFactory.assignToPackage("kea.base.FlowAuditController", FlowAuditController);

