/**
 * Created by mingzheng.zhang on 2016/9/30.
 */
function InterfaceController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBtnPortEditCancel = "#" + this.elementId + "_btnPortEditCancel";
    this.pBtnPortEditSure = "#" + this.elementId + "_btnPortEditSure";
    this.pBtnPortEditStart = "#" + this.elementId + "_btnPortEditStart";
    this.pImgRunLight = "#" + this.elementId + "_imgRunLight";
    this.pImgPowerLight = "#" + this.elementId + "_imgPowerLight";
    this.pImgFindLight = "#" + this.elementId + "_imgFindLight";
    this.pImgAlarmLight = "#" + this.elementId + "_imgAlarmLight";
    this.pDivPortList = "#" + this.elementId + "_divPortList";
    this.pDivPortDetailList = "#" + this.elementId + "_divPortDetailList";

    this.pTxtRouteIpStart = "#" + this.elementId + "_txtRouteIpStart";
    this.pTxtRouteIpEnd = "#" + this.elementId + "_txtRouteIpEnd";
    this.pRabRouteDirect = this.elementId + "_rabRouteDirect";
    this.pRabRouteDirect1 = "#" + this.elementId + "_rabRouteDirect1";
    this.pRabRouteDirect2 = "#" + this.elementId + "_rabRouteDirect2";
    this.pDdlRouteOutInterface = "#" + this.elementId + "_ddlRouteOutInterface";
    this.pTxtRouteNextHop = "#" + this.elementId + "_txtRouteNextHop";
    this.pBtnAddRoute = "#" + this.elementId + "_btnAddRoute";
    this.pBtnDeleteRoutes = "#" + this.elementId + "_btnDeleteRoutes";
    this.pTdRoutelist = "#" + this.elementId + "_tdRoutelist";
    this.pLblTotalRoutelist = "#" + this.elementId + "_lblTotalRouteList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";

    this.pPortList = null;
    this.pRouteList = null;

    this.pRoutelistPager = null;

}

InterfaceController.prototype.init = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.INTERFACE_EDIT), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - InterfaceController.init() - Unable to initialize: " + err.message);
    }
}

InterfaceController.prototype.initControls = function () {
    try {
        var parent = this;

        $(parent.pBtnPortEditStart).on("click", function () {
            parent.updatePortList();
        });

        $(parent.pBtnPortEditSure).on("click", function () {
            parent.commitPortList();
        });

        $(parent.pBtnPortEditCancel).on("click", function () {
            $(parent.pBtnPortEditStart).css({"display": "", "visibility": "visible"});
            $(parent.pBtnPortEditSure + ',' + parent.pBtnPortEditCancel).css({
                "display": "none",
                "visibility": "hidden"
            });
            parent.getPortList();
        });

        $("input[name='" + this.pRabRouteDirect + "']").on("click", function () {
            var type = $(this).val();
            if (type == "output_interface") {
                $(parent.pTxtRouteNextHop).val("").attr("disabled", true);
                $(parent.pDdlRouteOutInterface).attr("disabled", false);
                $(".rule-single-select").ruleSingleSelect();
            } else {
                $(parent.pDdlRouteOutInterface).val("").attr("disabled", true);
                $(parent.pTxtRouteNextHop).attr("disabled", false);
                $(".rule-single-select").ruleSingleSelect();
            }
        })

        $(parent.pBtnAddRoute).on("click", function () {
            parent.addRoute();
        })

        $(parent.pBtnDeleteRoutes).on("click", function () {
            parent.deleteRoutes();
        })
    } catch (err) {
        console.error("ERROR - InterfaceController.initControls() - Unable to initialize control: " + err.message);
    }
}

InterfaceController.prototype.load = function () {
    try {
        this.getPortLED();
        this.getPortList();
        this.selectRoutes(1);
    } catch (err) {
        console.error("ERROR - InterfaceController.load() - Unable to load: " + err.message);
    }
}

InterfaceController.prototype.getPortLED = function () {
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
                $(parent.pImgRunLight + "," + parent.pImgPowerLight + "," + parent.pImgFindLight + "," + parent.pImgAlarmLight).attr("src", "/images/portbox_gray.png");
                if (typeof(result.RUN) != "undefined" && $.trim(result.RUN) == "ON") {
                    $(parent.pImgRunLight).attr("src", "/images/portbox_green.png");
                }
                if (typeof(result.POWER) != "undefined" && $.trim(result.POWER) == "ON") {
                    $(parent.pImgPowerLight).attr("src", "/images/portbox_red.png");
                }
                if (typeof(result.BYPASS) != "undefined" && $.trim(result.BYPASS) == "ON") {
                    $(parent.pImgFindLight).attr("src", "/images/portbox_green.png");
                }
                if (typeof(result.ALARM) != "undefined" && $.trim(result.ALARM) == "ON") {
                    $(parent.pImgAlarmLight).attr("src", "/images/portbox_red.png");
                }
            }
            else {
                layer.alert("获取端口状态失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AdvanceDeviceController.getDeviceRemote() - Unable to get the device remote status: " + err.message);
    }
}

InterfaceController.prototype.getPortList = function (ports) {
    try {
        var parent = this;
        if (ports) {
            joinHtml();
        } else {
            var link = APPCONFIG["default"].GET_PORT_LIST;
            var promise = URLManager.getInstance().ajaxCall(link);
            promise.fail(function (jqXHR, textStatus, err) {
                console.log(textStatus + " - " + err.message);
                layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            });
            promise.done(function (result) {
                    if (typeof (result) != "undefined" && typeof (result.PORT) != "undefined") {
                        parent.pPortList = result.PORT;
                        ports = result.PORT;
                        joinHtml();
                    }
                    else {
                        layer.alert("获取端口信息失败", {icon: 5});
                    }
                }
            );
        }
        function joinHtml() {
            var html = '';
            for (var i = 0; i < ports.length; i++) {
                var port_name = (ports[i].port_name == "agl0" ? "MGMT" : ports[i].port_name);
                var port_img = (ports[i].status == "UP" ? "jackbox_yes.png" : "jackbox_no.png");
                html += '<li><span><p>' + port_name + '</p><img src="/images/' + port_img + '"></span></li>';
            }
            $(parent.pDivPortList + " li").not(":first-child").remove();
            $(parent.pDivPortList).append(html);

            html = '';
            for (var i = 0; i < ports.length; i++) {
                var port = ports[i];
                var port_name = (port.port_name == "agl0" ? "管理端口" : port.port_name);
                var port_status_img = (port.status == "UP" ? "con_ka6.jpg" : "con_ka5.jpg");
                var port_status_txt = (port.status == "UP" ? "端口连接正常" : "端口未连接");
                var port_ip = (port.ip ? port.ip : '' );
                var port_mask = (port.mask ? port.mask : '' );
                html += '<div class="portgl">';
                html += '<h3>' + port_name + '</h3>';
                html += '<p>' + port_name + '状态</p><p class="dkzt"><img src="static/images/' + port_status_img + '"/>' + port_status_txt + '</p>';
                if (port.port_name == "agl0") {
                    html += '<p class="ym"><label>管理端口IP地址</label><label></label></p>';
                    html += '<p class="ym"><label></label><label>' + port_ip + '</label></p>';
                } else {
                    html += '<p class="ym"><label>IP地址</label><label>' + port_ip + '</label></p>';
                    html += '<p class="ym"><label>掩码</label><label>' + port_mask + '</label></p>';
                }
                html += '</div>';
            }
            $(parent.pDivPortDetailList).html(html);

            html = '<option value="">--请选择--</option>';
            for (var i = 0; i < ports.length; i++) {
                var port = ports[i];
                if (port.port_name != 'agl0') {
                    html += '<option value="' + port.port_name + '">' + port.port_name + '</option>'
                }
            }
            $(parent.pDdlRouteOutInterface).html(html);
            $(".rule-single-select").ruleSingleSelect();
        }
    } catch (err) {
        console.error("ERROR - InterfaceController.getPortList() - Unable to get the device port list status: " + err.message);
    }
}

InterfaceController.prototype.selectRoutes = function (pageIndex) {

    try {
        var parent = this;
        var html = "";
        html += '<tr class="title">';
        html += '<td class="address" style="width:12%">序号</td>';
        html += '<td class="address" style="width:20%">目的网段</td>';
        html += '<td class="address" style="width:17%">类型</td>';
        html += '<td class="address" style="width:17%">出接口</td>';
        html += '<td class="address" style="width:17%">下一跳</td>';
        html += '<td class="address" style="width:17%"></td>';
        html += '</tr>';
        function joinHtml() {
            var routes = parent.pRouteList.sort(function (a, b) {
                return a["dst"] > b["dst"];
            });
            if (routes.length > 0) {
                for (var i = (pageIndex - 1) * 10; i < routes.length && i < pageIndex * 10; i++) {
                    html += "<tr>";
                    html += "<td style='width:12%'>" + (i + 1) + "</td>";
                    html += "<td style='width:20%;' data-key='" + routes[i].dst + "'>" + routes[i].dst + "</td>";
                    html += "<td style='width:17%'  data-key='" + routes[i].type + "'>" + (routes[i].type == "output_interface" ? "直连" : "下一跳") + "</td>";
                    html += "<td style='width:17%'  data-key='" + routes[i].port + "'>" + routes[i].port + "</td>";
                    html += "<td style='width:17%'  data-key='" + routes[i].next_hop + "'>" + routes[i].next_hop + "</td>";
                    if (routes[i].code == "C>*") {
                        html += "<td style='width:17%'><input type='checkbox' disabled='disabled'/></td>";
                    } else {
                        html += "<td style='width:17%'><input type='checkbox'/></td>";
                    }
                    html += "</tr>";
                }
            }
            else {
                html += "<tr><td colspan='6'>暂无数据</td></tr>";
            }
            $(parent.pTdRoutelist).html(html);
            if (typeof (routes) != "undefined" && routes.length != 0) {
                $(parent.pLblTotalRoutelist).text(routes.length);
            }

            if (parent.pRoutelistPager == null) {
                parent.pRoutelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, routes.length, function (pageIndex) {
                    parent.selectRoutes(pageIndex);
                });
                parent.pRoutelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
            }
        }

        if (parent.pRouteList) {
            joinHtml();
        } else {
            var link = APPCONFIG["default"].GET_ROUTE_LIST;
            var loadIndex = layer.load(2);
            var promise = URLManager.getInstance().ajaxCall(link);
            promise.fail(function (jqXHR, textStatus, err) {
                console.log(textStatus + " - " + err.message);
                html += "<tr><td colspan='6'>暂无数据</td></tr>";
                $(parent.pTdRoutelist).html(html);
                layer.close(loadIndex);
            });
            promise.done(function (result) {
                if (typeof (result) != "undefined" && typeof (result.Route) != "undefined") {
                    parent.pRouteList = result.Route;
                    joinHtml();
                } else {
                    html += "<tr><td colspan='6'>暂无数据</td></tr>";
                }

                layer.close(loadIndex);
            });
        }
    } catch (err) {
        console.error("ERROR - InterfaceController.selectRoutes() - Unable to get the device route list status: " + err.message);
    }
}

InterfaceController.prototype.updatePortList = function () {
    try {
        var parent = this;

        $(parent.pBtnPortEditStart).css({"display": "none", "visibility": "hidden"});
        $(parent.pBtnPortEditSure + ',' + parent.pBtnPortEditCancel).css({"display": "", "visibility": "visible"});

        var html = '';
        for (var i = 0; i < parent.pPortList.length; i++) {
            var port = parent.pPortList[i];
            var port_name = (port.port_name == "agl0" ? "管理端口" : port.port_name);
            var port_status_img = (port.status == "UP" ? "con_ka6.jpg" : "con_ka5.jpg");
            var port_status_txt = (port.status == "UP" ? "端口连接正常" : "端口未连接");
            var port_ip = (port.ip ? port.ip : '' );
            var port_mask = (port.mask ? port.mask : '' );

            html += '<div class="portgl">';
            html += '<h3>' + port_name + '</h3>';
            html += '<p>' + port_name + '状态</p><p class="dkzt"><img src="static/images/' + port_status_img + '"/>' + port_status_txt + '</p>';
            if (port.port_name == "agl0") {
                html += '<p class="ym"><label>管理端口IP地址</label><label></label></p>';
                html += '<p class="ym"><label></label><label>' + port_ip + '</label></p>';
            } else {
                html += '<p class="ym"><label>IP地址</label><input value="' + port_ip + '"/></p>';
                html += '<p class="ym"><label>掩码</label><input value="' + port_mask + '"/></p>';
            }
            html += '</div>';
        }
        $(parent.pDivPortDetailList).html(html);
    } catch (err) {

    }
}

InterfaceController.prototype.commitPortList = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].UPDATE_PORTS;
        var data = [];
        var n = 0;
        $(parent.pDivPortDetailList + " .portgl").not(":first-child").each(function () {
            var port_name = $(this).find("h3").text();
            var port_ip = $(this).find(".ym input").eq(0).val();
            var port_mask = $(this).find(".ym input").eq(1).val();
            if (port_ip && port_mask) {
                if (!Validation.validateIP2(port_ip)) {
                    n = 1;
                    layer.alert(port_name + "端口请输入有效的IP", {icon: 5});
                    return false;
                }
                if (!Validation.validateSubnet2(port_mask)) {
                    n = 1;
                    layer.alert(port_name + "端口请输入子网掩码,且不能为0.0.0.0", {icon: 5});
                    return false;
                }
                if (FormatterManager.calculateNetwork(port_ip, port_mask) == port_ip || FormatterManager.calculateBroadcast(port_ip, port_mask) == port_ip || $.trim(port_ip) == "127.0.0.1") {
                    n = 1;
                    layer.alert(port_name + "端口IP和子网掩码组合无效", {icon: 5});
                    return false;
                }
                data.push(port_name + "," + port_ip + "," + port_mask);
            }
        });
        if (n == 1) {
            return false;
        }
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            layer.close(loadIndex);
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0:
                        $(parent.pBtnPortEditStart).css({"display": "", "visibility": "visible"});
                        $(parent.pBtnPortEditSure + ',' + parent.pBtnPortEditCancel).css({
                            "display": "none",
                            "visibility": "hidden"
                        });
                        parent.pPortList = result.PORT;
                        parent.getPortList(result.PORT);
                        break;
                    case 1:
                        layer.alert("端口已存在", {icon: 5});
                        break;
                }

            }
            else {
                layer.alert("修改端口信息失败", {icon: 5});
            }
        });
    } catch (err) {
        console.error("ERROR - InterfaceController.commitPortList() - Unable to update ports: " + err.message);
    }
}

InterfaceController.prototype.addRoute = function () {
    try {
        var parent = this;

        var dst1 = $.trim($(parent.pTxtRouteIpStart).val());
        var dst2 = $.trim($(parent.pTxtRouteIpEnd).val());
        var type = $("input[name='" + parent.pRabRouteDirect + "']:checked").val();
        var port = $(parent.pDdlRouteOutInterface).val();
        var next_hop = $.trim($(parent.pTxtRouteNextHop).val());
        if (!(dst1 && dst2) || !Validation.validateIP(dst1) || isNaN(dst2) || !(parseInt(dst2) >= 0 && parseInt(dst2) <= 32)) {
            layer.alert("请填写有效的目的网段", {icon: 5});
            return false;
        }
        if (type == "output_interface" && !port) {
            layer.alert("请选择出接口", {icon: 5});
            return false;
        }
        if (type == "next_hop" && !Validation.validateIP2(next_hop)) {
            layer.alert("请输入有效的下一跳", {icon: 5});
            return false;
        }
        var link = APPCONFIG["default"].ADD_ROUTE + "?dst=" + dst1 + "/" + dst2 + "&type=" + type + "&port=" + port + "&next_hop=" + next_hop;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(encodeURI(link));
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            layer.close(loadIndex);
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0:
                        layer.alert("添加路由成功", {icon: 6});
                        parent.pRouteList = result.Route;
                        parent.selectRoutes(1);
                        parent.pRoutelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, parent.pRouteList.length, function (pageIndex) {
                            parent.selectRoutes(pageIndex);
                        });
                        parent.pRoutelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
                        break;
                    case 1:
                        layer.alert("该静态路由已存在", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("添加静态路由失败", {icon: 5});
            }
        });
    } catch (err) {
        console.error("ERROR - InterfaceController.addRoute() - Unable to add route: " + err.message);
    }
}

InterfaceController.prototype.deleteRoutes = function () {
    try {
        var parent = this;
        var data = [];
        $(parent.pTdRoutelist).find("tr").not(".title").each(function () {
            if ($(this).find("input[type='checkbox']").is(":checked")) {
                var dst = $(this).find("td").eq(1).attr("data-key");
                var type = $(this).find("td").eq(2).attr("data-key");
                var port = $(this).find("td").eq(3).attr("data-key").replace("eth", "p");
                var next_hop = $(this).find("td").eq(4).attr("data-key").replace(",", "");
                data.push({"dst": dst, "type": type, "port": port, "next_hop": next_hop});
            }
        });
        if (!data.length) {
            layer.alert("请先选中要删除的静态路由信息！", {icon: 2});
            return;
        }
        var link = APPCONFIG["default"].DELETE_ROUTES;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.Route) != "undefined") {
                layer.alert("删除路由成功", {icon: 6});
                parent.pRouteList = result.Route;
                parent.selectRoutes(1);
                parent.pRoutelistPager = new kea.base.utility.PagerController($(parent.pPagerContent), parent.elementId, 10, parent.pRouteList.length, function (pageIndex) {
                    parent.selectRoutes(pageIndex);
                });
                parent.pRoutelistPager.init(Constants.TEMPLATES.UTILITY_PAGER1);
                layer.close(loadIndex);
            }
            else {
                layer.alert("删除静态路由失败", {icon: 5});
            }
        });
    } catch (err) {
        console.error("ERROR - InterfaceController.deleteRoutes() - Unable to delete routes: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.InterfaceController", InterfaceController);
