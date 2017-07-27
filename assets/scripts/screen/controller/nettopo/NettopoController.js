function NettopoController(viewHandle, elementId) {
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

