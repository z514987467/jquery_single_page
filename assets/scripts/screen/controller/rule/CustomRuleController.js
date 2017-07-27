/**
 * Created by mingzheng.zhang on 2016/11/8.
 */
function CustomRuleController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pFileUpload = "#" + this.elementId + "_fileUpload";
    this.pFormUpload = "#" + this.elementId + "_formUpload";
    this.pErrUpload = "#" + this.elementId + "_errUpload";
    this.pBtnImport = "#" + this.elementId + "_btnImport";
    this.pBtnExport = "#" + this.elementId + "_btnExport";
    this.pTdCustomRuleList = "#" + this.elementId + "_tdCustomRuleList";
    this.pPagerContent = "#" + this.elementId + "_pagerContent";
    this.pLblTotalCustomRules = "#" + this.elementId + "_lblTotalCustomRules";

    this.pLblProtocolName = "#" + this.elementId + "_dialog_lblProtocolName";
    this.pLblTransportProtocol = "#" + this.elementId + "_dialog_lblTransportProtocol";
    this.pLblIdentificationPort = "#" + this.elementId + "_dialog_lblIdentificationPort";
    this.pLblIdentityKey = "#" + this.elementId + "_dialog_lblIdentityKey";
    this.pLblProtocolParser = "#" + this.elementId + "_dialog_lblProtocolParser";
}

CustomRuleController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.RULE_CUSTOM_DIALOG],
            function (templateResults) {
                parent.initShell();
            }
        );
    } catch (err) {
        console.error("ERROR - CustomRuleController.init() - Unable to initialize all templates: " + err.message);
    }
}

CustomRuleController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_CUSTOM), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    } catch (err) {
        console.error("ERROR - CustomRuleController.init() - Unable to initialize: " + err.message);
    }
}

CustomRuleController.prototype.initControls = function () {
    try {
        var parent = this;
        $(this.pFileUpload).on("change", function () {
            var fileName = $.trim($(this).val());
            fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);
            if (fileName != "") {
                var file = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
                if (fieExtension == "yaml") {
                    $(parent.pErrUpload).html(fileName);
                }
                else {
                    layer.alert("文件格式不对！", {icon: 5});
                    $(parent.pErrUpload).html("文件格式不对");
                }
            }
            else {
                layer.alert("请选择文件！", {icon: 5});
                $(parent.pErrUpload).html("选择上传文件");
            }
        });
        $(this.pBtnImport).on("click", function () {
            var fileName = $.trim($(parent.pFileUpload).val());
            if (fileName != "") {
                var fieExtension = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
                fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);
                if (fieExtension == "yaml") {
                    $(parent.pErrUpload).html(fileName);
                    parent.import();
                } else {
                    layer.alert("文件格式不对！", {icon: 5});
                    $(parent.pErrUpload).html("文件格式不对");
                }
            } else {
                layer.alert("请选择文件！", {icon: 5});
                $(parent.pErrUpload).html("选择上传文件");
            }
            return false;
        })
        $(this.pBtnExport).on("click", function () {
            parent.export();
        })
        this.total = {
            get: function () {
                return this.value;
            },
            set: function (value) {
                this.value = value;
                $(parent.pLblTotalCustomRules).html(value);
            }
        };
    } catch (err) {
        console.error("ERROR - CustomRuleController.initControls() - Unable to initialize control: " + err.message);
    }
}

CustomRuleController.prototype.load = function () {
    try {
        var parent = this;
        parent.select(1);
    } catch (err) {
        console.error("ERROR - CustomRuleController.load() - Unable to load: " + err.message);
    }
}

CustomRuleController.prototype.select = function (pageIndex) {
    var html = "";
    html += '<tr class="title">';
    html += '<td class="address" style="width:5%">序号</td>';
    html += '<td class="address" style="width:25%">文件名</td>';
    html += '<td class="address" style="width:25%">协议名称</td>';
    html += '<td class="address" style="width:20%">状态</td>';
    html += '<td style="width:25%;" colspan="3">操作</td>';
    html += '</tr>';
    try {
        var parent = this;

        var link = APPCONFIG["default"].GET_ADL_FILES + "?page=" + pageIndex;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);

        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += "<tr><td colspan='7'>暂无数据</td></tr>";
            $(parent.pTdCustomRuleList).html(html);
            layer.close(loadIndex);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.res) != "undefined") {
                if (result.res.length > 0) {
                    console.log(result.res.length);
                    parent.total.set(result.res.filter(function (el) {
                        return el.status == 'used';
                    }).length);
                    result.res = result.res.sort(function (a, b) {
                        return a.file.localeCompare(b.file);
                    });
                    for (var i = 0; i < result.res.length; i++) {
                        html += "<tr data-key='" + result.res[i].file + "'>";
                        html += "<td >" + ((pageIndex - 1) * 10 + 1 + i) + "</td>";
                        html += "<td>" + result.res[i].file + "</td>";
                        html += "<td>" + result.res[i].file.replace(/.yaml/g, "") + "</td>";
                        if (result.res[i].status == "used") {
                            html += "<td>已启用</td>";
                            html += "<td><button class='button_disable' data-key='" + result.res[i].file + "'>禁用</button></td>";
                        } else {
                            html += "<td>未启用</td>";
                            html += "<td><button class='button_enabled' data-key='" + result.res[i].file + "'>启用</button></td>";
                        }
                        html += "<td><button class='details' data-key='" + result.res[i].file + "'>查看</button></td>";
                        if (result.res[i].status == "used") {
                            html += "<td><button class='button button_delete disabled' disabled='disabled' data-key='" + result.res[i].file + "'>删除</button></td>";
                        } else {
                            html += "<td><button class='button button_delete' data-key='" + result.res[i].file + "'>删除</button></td>";
                        }
                        html += "</tr>";
                    }
                } else {
                    parent.total.set(0);
                    html += "<tr><td colspan='7'>暂无数据</td></tr>";
                }
            }
            else {
                html += "<tr><td colspan='7'>暂无数据</td></tr>";
            }
            $(parent.pTdCustomRuleList).html(html);
            layer.close(loadIndex);

            $(parent.pTdCustomRuleList).find("tr").each(function () {
                //启用/禁用
                $(this).find("button:eq(0)").on("click", function () {
                    var fliename = $(this).attr("data-key");
                    if ($(this).html() == "禁用") {
                        parent.clear(fliename);
                    }
                    else {
                        parent.apply(fliename);
                    }
                });
                //详情
                $(this).find("button:eq(1)").on("click", function (event) {
                    var filename = $(this).attr("data-key");
                    var dialogTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_CUSTOM_DIALOG), {
                        elementId: parent.elementId + "_dialog"
                    });
                    var width = parent.pViewHandle.find(".eventinfo_box").width() - 10 + "px";
                    var height = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10 + "px";
                    layer.open({
                        type: 1,
                        title: "协议详情",
                        area: [width, height],
                        offset: ["82px", "200px"],
                        shade: [0.5, '#393D49'],
                        content: dialogTemplate,
                        success: function (layero, index) {
                            parent.detail(layero, filename);
                            $(window).on("resize", function () {
                                var pwidth = parent.pViewHandle.find(".eventinfo_box").width() - 10;
                                var pheight = $(window).height() - parent.pViewHandle.find(".eventinfo_box").offset().top - 10;
                                layero.width(pwidth);
                                layero.height(pheight);
                            })
                        }
                    });
                });
                //删除
                $(this).find("button:eq(2)").on("click", function () {
                    if (confirm("确定要删除吗？")) {
                        var fliename = $(this).attr("data-key");
                        parent.deleteADL(fliename);
                    }
                });
            })
        });
    }
    catch (err) {
        html += "<tr><td colspan='7'>暂无数据</td></tr>";
        $(this.pTdCustomRuleList).html(html);
        console.error("ERROR - CustomRuleController.select() - Unable to get all rules: " + err.message);
    }
}

CustomRuleController.prototype.import = function () {
    var layerIndex;
    try {
        var parent = this;
        if (parent.total.get() >= 16) {
            layer.alert("协议最多16条", {icon: 5});
            return;
        }
        var link = APPCONFIG["default"].IMPORT_ADL_FILE;
        layerIndex = layer.msg('<div id="progressbar" style="width:300px; margin-top:5px;"><div class="progress-label" style="line-height: 40px"></div></div>', {
            time: 600000,
            shade: [0.5, '#fff']
        }, function () {
            //parent.gotoPage();
        });
        var progressbar = $("#progressbar"), progressLabel = $(".progress-label");
        progressbar.progressbar({
            value: 0,
            max: 100,
            min: 0,
            change: function (event, ui) {
                var val = progressbar.progressbar("value");
                if (val < 100) {
                    progressLabel.text("上传进度" + val + "%");
                } else {
                    progressLabel.text("正在处理...");
                }
            }
        });
        $(this.pFormUpload).ajaxSubmit({
            type: 'POST',
            url: link,
            beforeSend: function () {
                progressbar.progressbar("value", 0);
            },
            uploadProgress: function (event, position, total, percentComplete) {
                progressbar.progressbar("value", percentComplete);
            },
            complete: function (xhr) {
                progressbar.progressbar("value", 100);
            },
            success: function (result) {
                layer.close(layerIndex);
                if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                    switch (result.status) {
                        case 1:
                            parent.select(1);
                            break;
                        case 2:
                            layer.alert("文件格式不正确", {icon: 5});
                            break;
                        case 3:
                            layer.alert("协议已存在", {icon: 5});
                            break;
                        case 4:
                            layer.alert("协议最多16条", {icon: 5});
                            break;
                        case 5:
                            layer.alert("文件名与协议名称不匹配", {icon: 5});
                            break;
                        case 6:
                            layer.alert("文件加载错误", {icon: 5});
                            break;
                        default:
                            layer.alert("导入失败", {icon: 5});
                            break;
                    }
                } else {
                    layer.alert("导入失败", {icon: 5});
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                layer.alert("导入失败", {icon: 5});
            }
        });
    } catch (err) {
        layer.close(layerIndex);
        console.error("ERROR - CustomRuleController.import() - Unable to import adl: " + err.message);
    }
}

CustomRuleController.prototype.export = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].EXPORT_ADL_FILE;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            layer.close(loadIndex);
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        window.open(APPCONFIG["default"].SAFE_EVENT_FILEPATH + result.filename);
                        break;
                    default:
                        layer.alert("导出失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("导出失败", {icon: 5});
            }
        });
    } catch (err) {
        console.error("ERROR - SafeEventController.export() - Unable to export all rules: " + err.message);
    }
}

CustomRuleController.prototype.apply = function (fileName) {
    var parent = this;
    try {
        var link = APPCONFIG["default"].APPLY_ADL_FILE + "?ADLApplyFile=" + fileName;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        var row = $(parent.pTdCustomRuleList).find("tr[data-key='" + fileName + "']");
                        row.find("td:eq(3)").html("已启用");
                        row.find("td:eq(4) button").removeClass("button_enabled").addClass("button_disable").html("禁用");
                        row.find("td:eq(6) button").attr("disabled", "disabled").addClass("disabled");
                        parent.total.set(parent.total.get() + 1)
                        break;
                    default:
                        layer.alert("启用失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("启用失败", {icon: 5});
            }
            layer.close(loadIndex);
        })
    } catch (err) {
        console.error("ERROR - SafeEventController.apply() - Unable to apply rule: " + err.message);
    }
}

CustomRuleController.prototype.clear = function (fileName) {
    var parent = this;
    try {
        var link = APPCONFIG["default"].CLEAR_ADL_FILE + "?ADLClearFile=" + fileName;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        var row = $(parent.pTdCustomRuleList).find("tr[data-key='" + fileName + "']");
                        row.find("td:eq(3)").html("未启用");
                        row.find("td:eq(4) button").removeClass("button_disable").addClass("button_enabled").html("启用");
                        row.find("td:eq(6) button").removeAttr("disabled").removeClass("disabled");
                        parent.total.set(parent.total.get() - 1);
                        break;
                    default:
                        layer.alert("禁用失败", {icon: 5});
                        break;
                }
            } else {
                layer.alert("禁用失败", {icon: 5});
            }
            layer.close(loadIndex);
        })
    } catch (err) {
        console.error("ERROR - SafeEventController.apply() - Unable to apply rule: " + err.message);
    }
}

CustomRuleController.prototype.detail = function (viewHandler, fileName) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DETAIL_ADL_FILE + "?ADLShowFile=" + fileName;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result.data) != "undefined" && result.data.length > 0) {
                //协议名称
                $(viewHandler).find(parent.pLblProtocolName).text(result.data[0].protocolName);
                //传输协议
                $(viewHandler).find(parent.pLblTransportProtocol).text(result.data[0].transportProtocol);
                //协议认证
                var protocolIdentification = result.data[0].protocolIdentification;
                for (var i = 0; i < protocolIdentification.length; i++) {
                    if (protocolIdentification[i].identificationPort) {
                        $(viewHandler).find(parent.pLblIdentificationPort).html("<label>端口：" + protocolIdentification[i].identificationPort.port + "</label>");
                    } else if (protocolIdentification[i].identificationContent
                        && protocolIdentification[i].identificationContent.identityKey) {
                        $(viewHandler).find(parent.pLblIdentityKey).html(protocolIdentification[i].identificationContent.identityKey.join("<br/>"));
                    }
                }
                //端口解析
                var protocolParserStr = "";
                for (var i = 0; i < result.data[0].protocolParser.length; i++) {
                    protocolParserStr += "<li class=\"Portresolution\"><b>解析内容：</b><div>";
                    var types = result.data[0].protocolParser[i].parseContent.types;
                    for (var j = 0; j < types.length; j++) {
                        protocolParserStr += "<article><dl>";
                        if (j == 0) {
                            protocolParserStr += "<dd>内容名称：" + result.data[0].protocolParser[i].parseContent.contentName + "</dd>";
                        }
                        protocolParserStr += "<br/>";
                        protocolParserStr += "<dd><dl><dd>类型：</dd> <dd>";
                        if (typeof(types[j].packetlen) != "undefined") {
                            protocolParserStr += "<span>数据包长度：" + types[j].packetlen + "</span><br>";
                        }
                        protocolParserStr += "<span>内容编码：" + types[j].contentCode + "</span><br>";
                        if (types[j].matchKey) {
                            protocolParserStr += "<dl><dd>匹配键值：</dd><dd>" + types[j].matchKey.join("<br/>") + "</dd></dl>";
                        }
                        protocolParserStr += "</dd></dl></dd></dl></article>";
                    }
                    protocolParserStr += "</li>";
                }
                $(viewHandler).find(parent.pLblProtocolParser).html(protocolParserStr);
            }
        });
    }
    catch (err) {
        console.error("ERROR - BlacklistController.getBlacklistDetails() - Unable to get safe event information: " + err.message);
    }
}

CustomRuleController.prototype.deleteADL = function (file) {
    var parent = this;
    try {
        var link = APPCONFIG["default"].DEL_ADL_FILE + "?ADLDelFile=" + file;
        var loadIndex = layer.load(2);
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.close(loadIndex);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        parent.select(1);
                        break;
                    default:
                        layer.alert("删除失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("删除失败", {icon: 5});
            }
            layer.close(loadIndex);
        })
    } catch (err) {
        console.error("ERROR - SafeEventController.deteleADL() - Unable to delte rule: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.CustomRuleController", CustomRuleController);