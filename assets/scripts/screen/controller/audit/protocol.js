function DNP3Controller(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

DNP3Controller.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_DNP3), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - DNP3Controller.init() - Unable to initialize: " + err.message);
    }
}

DNP3Controller.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - DNP3Controller.initControls() - Unable to initialize control: " + err.message);
    }
}

DNP3Controller.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - DNP3Controller.load() - Unable to load: " + err.message);
    }
}

DNP3Controller.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:80%;">功能码</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][4] + "</td>";
                        html += "<td style='width:80%;'>"+result.rows[i][2]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='2'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='2'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - DNP3Controller.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.DNP3Controller", DNP3Controller);


// ---------------------------------------------
﻿function ENIPIOController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

ENIPIOController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPIO), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - ENIPIOController.init() - Unable to initialize: " + err.message);
    }
}

ENIPIOController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - ENIPIOController.initControls() - Unable to initialize control: " + err.message);
    }
}

ENIPIOController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - ENIPIOController.load() - Unable to load: " + err.message);
    }
}

ENIPIOController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">地址类型</td>';
    html += '<td class="address">数据类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - ENIPIOController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.ENIPIOController", ENIPIOController);


// ---------------------------------------------
﻿function ENIPTCPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

ENIPTCPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPTCP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - ENIPTCPController.init() - Unable to initialize: " + err.message);
    }
}

ENIPTCPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - ENIPTCPController.initControls() - Unable to initialize control: " + err.message);
    }
}

ENIPTCPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - ENIPTCPController.load() - Unable to load: " + err.message);
    }
}

ENIPTCPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:18%;">记录时间</td>';
    html += '<td class="address">命令</td>';
    html += '<td class="address" style="width:18%;">服务码</td>';
    html += '<td class="address" style="width:18%;">地址类型</td>';
    html += '<td class="address" style="width:18%;">数据类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='5'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:18%;'>" + result.rows[i][7] + "</td>";
                        html += "<td>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][3] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][4] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][5] + "</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='5'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - ENIPTCPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.ENIPTCPController", ENIPTCPController);


// ---------------------------------------------
﻿function ENIPUDPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

ENIPUDPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_ENIPUDP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - ENIPUDPController.init() - Unable to initialize: " + err.message);
    }
}

ENIPUDPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - ENIPUDPController.initControls() - Unable to initialize control: " + err.message);
    }
}

ENIPUDPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - ENIPUDPController.load() - Unable to load: " + err.message);
    }
}

ENIPUDPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address">命令</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='2'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][4] + "</td>";
                        html += "<td>"+result.rows[i][2]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='2'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='2'>暂无数据</td></tr>";
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='2'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - ENIPUDPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.ENIPUDPController", ENIPUDPController);


// ---------------------------------------------
﻿function FTPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

FTPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_FTP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - FTPController.init() - Unable to initialize: " + err.message);
    }
}

FTPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - FTPController.initControls() - Unable to initialize control: " + err.message);
    }
}

FTPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - FTPController.load() - Unable to load: " + err.message);
    }
}

FTPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">使用账号</td>';
    html += '<td class="address">输入命令</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - FTPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.FTPController", FTPController);


// ---------------------------------------------
﻿function GOOSEController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

GOOSEController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_GOOSE), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - GOOSEController.init() - Unable to initialize: " + err.message);
    }
}

GOOSEController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - GOOSEController.initControls() - Unable to initialize control: " + err.message);
    }
}

GOOSEController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - GOOSEController.load() - Unable to load: " + err.message);
    }
}

GOOSEController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">数据集</td>';
    html += '<td class="address">GO标识符</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - GOOSEController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.GOOSEController", GOOSEController);


// ---------------------------------------------
﻿function HTTPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

HTTPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_HTTP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - HTTPController.init() - Unable to initialize: " + err.message);
    }
}

HTTPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - HTTPController.initControls() - Unable to initialize control: " + err.message);
    }
}

HTTPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - HTTPController.load() - Unable to load: " + err.message);
    }
}

HTTPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:85%;">目标URL</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:85%;'>"+result.rows[i][2]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='2'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='2'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - HTTPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.HTTPController", HTTPController);


// ---------------------------------------------
﻿function IEC104Controller(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

IEC104Controller.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_IEC104), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - IEC104Controller.init() - Unable to initialize: " + err.message);
    }
}

IEC104Controller.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - IEC104Controller.initControls() - Unable to initialize control: " + err.message);
    }
}

IEC104Controller.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - IEC104Controller.load() - Unable to load: " + err.message);
    }
}

IEC104Controller.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">Causetx类型</td>';
    html += '<td class="address">Asdu类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - IEC104Controller.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.IEC104Controller", IEC104Controller);


// ---------------------------------------------
﻿function MMSController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

MMSController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_MMS), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - MMSController.init() - Unable to initialize: " + err.message);
    }
}

MMSController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - MMSController.initControls() - Unable to initialize control: " + err.message);
    }
}

MMSController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - MMSController.load() - Unable to load: " + err.message);
    }
}

MMSController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:50%;">PDU类型</td>';
    html += '<td class="address">服务请求类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][4] + "</td>";
                        html += "<td style='width:50%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][7]+"</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - MMSController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.MMSController", MMSController);


// ---------------------------------------------
﻿function MODBUSController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

MODBUSController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_MODBUS), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - MODBUSController.init() - Unable to initialize: " + err.message);
    }
}

MODBUSController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - MODBUSController.initControls() - Unable to initialize control: " + err.message);
    }
}

MODBUSController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - MODBUSController.load() - Unable to load: " + err.message);
    }
}

MODBUSController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">功能码</td>';
    html += '<td class="address" style="width:25%;">起始地址</td>';
    html += '<td class="address">终止地址</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:25%;'>" + result.rows[i][3] + "</td>";
                        html += "<td>"+result.rows[i][4]+"</td>";
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
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - MODBUSController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.MODBUSController", MODBUSController);


// ---------------------------------------------
﻿function OPCDAController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

OPCDAController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_OPCDA), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - OPCDAController.init() - Unable to initialize: " + err.message);
    }
}

OPCDAController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - OPCDAController.initControls() - Unable to initialize control: " + err.message);
    }
}

OPCDAController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - OPCDAController.load() - Unable to load: " + err.message);
    }
}

OPCDAController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:40%;">操作接口</td>';
    html += '<td class="address">操作码</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:40%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - OPCDAController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.OPCDAController", OPCDAController);


// ---------------------------------------------
﻿function OPCUAController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

OPCUAController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_OPCUA), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - OPCUAController.init() - Unable to initialize: " + err.message);
    }
}

OPCUAController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - OPCUAController.initControls() - Unable to initialize control: " + err.message);
    }
}

OPCUAController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - OPCUAController.load() - Unable to load: " + err.message);
    }
}

OPCUAController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address">服务码</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][4] + "</td>";
                        html += "<td>"+result.rows[i][2]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='2'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='2'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='2'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - OPCUAController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.OPCUAController", OPCUAController);


// ---------------------------------------------
﻿function PNRTDCPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

PNRTDCPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_PNRTDCP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - PNRTDCPController.init() - Unable to initialize: " + err.message);
    }
}

PNRTDCPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - PNRTDCPController.initControls() - Unable to initialize control: " + err.message);
    }
}

PNRTDCPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - PNRTDCPController.load() - Unable to load: " + err.message);
    }
}

PNRTDCPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:12%;">记录时间</td>';
    html += '<td class="address" style="width:18%;">frame标识符</td>';
    html += '<td class="address" style="width:18%;">服务标识符</td>';
    html += '<td class="address" style="width:18%;">服务类型</td>';
    html += '<td class="address" style="width:18%;">选项</td>';
    html += '<td class="address">子选项</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='6'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:12%;'>" + result.rows[i][8] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][3] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][4] + "</td>";
                        html += "<td style='width:18%;'>" + result.rows[i][5] + "</td>";
                        html += "<td>"+result.rows[i][6]+"</td>";
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
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='6'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - PNRTDCPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.PNRTDCPController", PNRTDCPController);


// ---------------------------------------------
﻿function POP3Controller(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

POP3Controller.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_POP3), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - POP3Controller.init() - Unable to initialize: " + err.message);
    }
}

POP3Controller.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - POP3Controller.initControls() - Unable to initialize control: " + err.message);
    }
}

POP3Controller.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - POP3Controller.load() - Unable to load: " + err.message);
    }
}

POP3Controller.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:40%;">源信箱地址</td>';
    html += '<td class="address">目的信箱地址</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:40%;'>" + result.rows[i][2].replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</pre></td>";
                        html += "<td>" + result.rows[i][3].replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - POP3Controller.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.POP3Controller", POP3Controller);


// ---------------------------------------------
﻿function PROFINETIOController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

PROFINETIOController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_PROFINETIO), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - PROFINETIOController.init() - Unable to initialize: " + err.message);
    }
}

PROFINETIOController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - PROFINETIOController.initControls() - Unable to initialize control: " + err.message);
    }
}

PROFINETIOController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - PROFINETIOController.load() - Unable to load: " + err.message);
    }
}

PROFINETIOController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:15%;">记录时间</td>';
    html += '<td class="address" style="width:15%;">功能码</td>';
    html += '<td class="address" style="width:15%;">操作接口</td>';
    html += '<td class="address">数据类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:15%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:15%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:15%;'>" + result.rows[i][3] + "</td>";
                        html += "<td>"+result.rows[i][4]+"</td>";
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
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - PROFINETIOController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.PROFINETIOController", PROFINETIOController);


// ---------------------------------------------
﻿function S7Controller(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

S7Controller.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_S7), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - S7Controller.init() - Unable to initialize: " + err.message);
    }
}

S7Controller.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - S7Controller.initControls() - Unable to initialize control: " + err.message);
    }
}

S7Controller.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - S7Controller.load() - Unable to load: " + err.message);
    }
}

S7Controller.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">PDU类型</td>';
    html += '<td class="address" style="width:30%;">操作类型</td>';
    html += '<td class="address">数据类型</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][3] + "</td>";
                        html += "<td>"+result.rows[i][4]+"</td>";
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
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - S7Controller.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.S7Controller", S7Controller);


// ---------------------------------------------
﻿function SMTPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

SMTPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_SMTP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - SMTPController.init() - Unable to initialize: " + err.message);
    }
}

SMTPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - SMTPController.initControls() - Unable to initialize control: " + err.message);
    }
}

SMTPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - SMTPController.load() - Unable to load: " + err.message);
    }
}

SMTPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:40%;">源信箱地址</td>';
    html += '<td class="address">目的信箱地址</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:40%;'>" + result.rows[i][2].replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</td>";
                        html += "<td>" + result.rows[i][3].replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - SMTPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.SMTPController", SMTPController);


// ---------------------------------------------
﻿function SNMPController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

SNMPController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_SNMP), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - SNMPController.init() - Unable to initialize: " + err.message);
    }
}

SNMPController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - SNMPController.initControls() - Unable to initialize control: " + err.message);
    }
}

SNMPController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - SNMPController.load() - Unable to load: " + err.message);
    }
}

SNMPController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">PDU类型</td>';
    html += '<td class="address" style="width:30%;">版本</td>';
    html += '<td class="address">团体名</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='4'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][3] + "</td>";
                        html += "<td>" + result.rows[i][4] + "</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='4'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='4'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='4'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - SNMPController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.SNMPController", SNMPController);


// ---------------------------------------------
﻿function SVController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

SVController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_SV), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - SVController.init() - Unable to initialize: " + err.message);
    }
}

SVController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - SVController.initControls() - Unable to initialize control: " + err.message);
    }
}

SVController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - SVController.load() - Unable to load: " + err.message);
    }
}

SVController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">SV编号</td>';
    html += '<td class="address">采样同步</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][5] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
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
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - SVController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.SVController", SVController);


// ---------------------------------------------
﻿function TELNETController(viewHandle, elementId, id, ip, mac, port, time, protocol) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId
    this.id = id;
    this.ip = ip;
    this.mac = mac;
    this.port = port;
    this.time = time;
    this.protocol = protocol;

    this.pLblType = "#" + this.elementId + "_lblType";
    this.pLblTime = "#" + this.elementId + "_lblTime";
    this.pLblPort = "#" + this.elementId + "_lblPort";
    this.pLblIP = "#" + this.elementId + "_lblIP";
    this.pLblMAC = "#" + this.elementId + "_lblMAC";
    this.pTdProtocolList = "#" + this.elementId + "_tdProtocolList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalProtocol = "#" + this.elementId + "_lblTotalProtocol";

    this.pPager = null;
}

TELNETController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.AUDIT_PROTOCOL_TELNET), {
            elementId: parent.elementId
        });
        this.pViewHandle.find(".layui-layer-content").html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - TELNETController.init() - Unable to initialize: " + err.message);
    }
}

TELNETController.prototype.initControls = function () {
    try {
    }
    catch (err) {
        console.error("ERROR - TELNETController.initControls() - Unable to initialize control: " + err.message);
    }
}

TELNETController.prototype.load = function () {
    try {
        //details
        $(this.pLblIP).html(this.ip);
        $(this.pLblMAC).html(this.mac);
        $(this.pLblPort).html(this.port);
        $(this.pLblTime).html(this.time);
        $(this.pLblType).html(this.protocol);
        //table
        this.pPager = null;
        this.selectProtocol(1);
    }
    catch (err) {
        console.error("ERROR - TELNETController.load() - Unable to load: " + err.message);
    }
}

TELNETController.prototype.selectProtocol = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:20%;">记录时间</td>';
    html += '<td class="address" style="width:30%;">使用账号</td>';
    html += '<td class="address">输入命令</td>';
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_PROTOCOL + "?protocol=" + this.protocol + "&page=" + pageIndex + "&flowdataHeadId=" + this.id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            $(parent.pTdProtocolList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td style='width:20%;'>" + result.rows[i][6] + "</td>";
                        html += "<td style='width:30%;'>" + result.rows[i][2] + "</td>";
                        html += "<td>"+result.rows[i][3]+"</td>";
                        html += "</tr>";
                    }
                }
                else {
                    html += "<tr><td colspan='3'>暂无数据</td></tr>";;
                }
            }
            else {
                html += "<tr><td colspan='3'>暂无数据</td></tr>";;
            }
            if (typeof (result.total) != "undefined") {
                $(parent.pLblTotalProtocol).text(result.total);
            }

            $(parent.pTdProtocolList).html(html);

            if (parent.pPager == null) {
                parent.pPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, result.total, function (pageIndex, filters) {
                    parent.selectProtocol(pageIndex);
                });
                parent.pPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        });
    }
    catch (err) {
        html += "<tr><td colspan='3'>暂无数据</td></tr>";;
        $(this.pTdProtocolList).html(html);
        console.error("ERROR - TELNETController.selectProtocol() - Unable to get all events: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.TELNETController", TELNETController);

