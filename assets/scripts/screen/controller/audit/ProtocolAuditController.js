function ProtocolAuditController(viewHandle, elementId) {
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

