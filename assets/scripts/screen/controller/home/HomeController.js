function HomeController(viewHandle, elementId) {
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
    this.pRunLight = "#" + this.elementId + '_runLight';
    this.pPowerLight = "#" + this.elementId + '_powerLight';
    this.pBypassLight = "#" + this.elementId + '_findLight';
    this.pAlarmLight = "#" + this.elementId + '_alarmLight';


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


        this.selectBaseData(CPUChrt, memoryChart, diskChart);

        clearInterval(this.timer.chartTimer);
        this.timer.chartTimer = setInterval(function () {
            parent.selectBaseData(CPUChrt, memoryChart, diskChart);
            parent.getPortLED();

            var data = parent.selectSingleTotalFlow();
            // var option = interfaceChart.getOption();
            // if (option.yAxis[0].max < Math.ceil(data.y)) {
            //     option.yAxis[0].max = Math.ceil(data.y);
            //     interfaceChart.setOption(option);
            // }
            // interfaceChart.addData([
            //     [
            //         0,
            //         data.y,
            //         false,
            //         false,
            //         data.x
            //     ]
            // ]);
        }, 20000);
        this.selectProductInfo();
        this.getPortLED();
        $(window).resize(function () {
            CPUChrt.resize();
            memoryChart.resize();
            diskChart.resize();

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
                if (result.sys_info.isC400 == 0) {
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
                data: data.x,
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#DBDBDB'
                    }
                }
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

HomeController.prototype.getPortLED = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PORT_LED;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                $(parent.pRunLight + "," + parent.pPowerLight + "," + parent.pBypassLight + "," + parent.pAlarmLight).find("img").attr("src", "./images/portbox_gray.png");
                if (typeof(result.RUN) != "undefined" && $.trim(result.RUN) == "ON") {
                    $(parent.pRunLight).find("img").attr("src", "./images/portbox_green.png");
                }
                if (typeof(result.POWER) != "undefined" && $.trim(result.POWER) == "ON") {
                    $(parent.pPowerLight).find("img").attr("src", "./images/portbox_red.png");
                }
                if (typeof(result.BYPASS) != "undefined" && $.trim(result.BYPASS) == "ON") {
                    $(parent.pBypassLight).find("img").attr("src", "./images/portbox_green.png");
                }
                if (typeof(result.ALARM) != "undefined" && $.trim(result.ALARM) == "ON") {
                    $(parent.pAlarmLight).find("img").attr("src", "./images/portbox_red.png");
                }
            }
            else {
                //layer.alert("获取端口状态失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - HomeController.getPortLED() - Unable to get the device led status: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.HomeController", HomeController);

