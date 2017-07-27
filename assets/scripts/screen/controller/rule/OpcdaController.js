/**
 * Created by mingzheng.zhang on 2017/2/14.
 */
function OpcdaController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
	this.pReadSwitch = this.elementId + "_readSwitch";
	this.pWriteSwitch = this.elementId + "_writeSwitch";
    this.pWriteOp = "#" + this.elementId + "_writeSwitch1";
	this.pWriteCl = "#" + this.elementId + "_writeSwitch2";
	this.pReadOp = "#" + this.elementId + "_readSwitch1";
	this.pReadCl = "#" + this.elementId + "_readSwitch2";
    this.pbtnSettings = "#" + this.elementId + "_btnOpcdaSetting";
	this.pWriteEventStatus = "#" + this.elementId + "_writeEventStatus";
	this.pReadEventStatus = "#" + this.elementId + "_readEventStatus";

	
}

OpcdaController.prototype.init = function () {
	try {
		var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.RULE_OPCDA), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);
        this.initControls();
		this.load();		
    }
    catch (err) {
        console.error("ERROR - OpcdaController.init() - Unable to initialize: " + err.message);
    }
}

OpcdaController.prototype.initControls = function () {
    try {
		var parent = this;
        $(".rule-single-select").ruleSingleSelect();
		$(this.pbtnSettings).on("click", function () {
             layer.confirm('OPC-DA布署确认？', {
                btn: ['确定', '取消']
            }, function () {
                parent.switchopcDa();
            });
        });
		$("input[name='" + this.pWriteSwitch + "']").on("click", function () {
            parent.changeOpcDa();
        })
		$("input[name='" + this.pReadSwitch + "']").on("click", function () {
            parent.changeOpcDa();
        })
		
		}
    catch (err) {
        console.error("ERROR - OpcdaController.initControls() - Unable to initialize control: " + err.message);
    }
}

OpcdaController.prototype.load = function () {
    try {
        this.getOpcdaStatus();
		this.changeOpcDa();
    }
    catch (err) {
        console.error("ERROR - OpcdaController.load() - Unable to load: " + err.message);
    }
}

OpcdaController.prototype.getOpcdaStatus = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_OPCDA;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.write.isOpen) != "undefined" && typeof(result.write.action != "undefined")) {
				switch (result.write.isOpen) {
                    case true:
						$(parent.pWriteOp).attr("checked", "checked");
						$(parent.pWriteEventStatus).parent().parent().show();
                         break; 
						
                    case false:
                        $(parent.pWriteCl).attr("checked", "checked");
                        $(parent.pWriteEventStatus).parent().parent().hide();
						 break; 
                                          
                }
				$( parent.pWriteEventStatus).val(result.write.action);
				$(".rule-single-select").ruleSingleSelect();
				
            }
            else {
                layer.alert("OPC-DA设置失败", {icon: 5});
            };
			//
			 if (typeof (result) != "undefined" && typeof (result.read.isOpen) != "undefined" && typeof(result.read.action != "undefined")) {
				
				switch (result.read.isOpen) {
                    case true:
                        $(parent.pReadOp).attr("checked", "checked");
                        $(parent.pReadEventStatus).parent().parent().show();
						
                        break;
                    default:
                        $(parent.pReadCl).attr("checked", "checked");
                        $(parent.pReadEventStatus).parent().parent().hide();
						
                        break;                    
                }
				$( parent.pReadEventStatus).val(result.read.action);
				$(".rule-single-select").ruleSingleSelect();
            }
            else {
                layer.alert("OPC-DA设置失败", {icon: 5});
            }
			
        });
    }
    catch (err) {
        console.error("ERROR - OpcdaController.getRunningModeStatus() - Unable to update the device remote status: " + err.message);
    }
}
//!!parseInt()
OpcdaController.prototype.changeOpcDa = function () {
    try {
        var parent = this;
        var readStaus = $("input:radio[name='" + this.pReadSwitch + "']:checked").val();
		var writeStaus = $("input:radio[name='" + this.pWriteSwitch + "']:checked").val();
        if (readStaus == 1) {
            $(parent.pReadEventStatus).parent().parent().show();
        }
        else {
            $(parent.pReadEventStatus).parent().parent().hide();
        };
		if (writeStaus == 1) {
            $(parent.pWriteEventStatus).parent().parent().show();
        }
        else {
            $(parent.pWriteEventStatus).parent().parent().hide();
        }
    } catch (err) {
        console.error("ERROR - OpcdaController.changeOpcDa() - Change opcda server status: " + err.message);
    }
}

OpcdaController.prototype.switchopcDa = function () {
    try {
        var parent = this;
		var flag1 = $("input:radio[name='" + this.pWriteSwitch + "']:checked").val();
		var flag2 = $("input:radio[name='" + this.pReadSwitch + "']:checked").val();
		var flag3 = $(parent.pWriteEventStatus + " option:selected").val();
		var flag4 = $(parent.pReadEventStatus + " option:selected").val();
		var link = APPCONFIG["default"].SET_OPCDA;
		var data ={"write":{"isOpen":!!parseInt(flag1),"action":flag3},"read":{"isOpen":!!parseInt(flag2),"action":flag4}};
		var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
        var layerIndex = layer.msg("正在设置，请稍后...", {
            time: 10000,
            shade: [0.5, '#fff']
        });
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
			return false;
        });
       promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
				switch (result.status) {
                    case 1:
						layer.alert("OPC-DA设置成功", {icon: 6});
						return false;
						break;
					default:
						layer.alert("OPC-DA设置失败", {icon: 5});
						return false;
                        break;
                }
			}
            else {
				
                layer.alert("OPC-DA设置失败", {icon: 5});
				return false;
            }
        });
    }
    catch (err) {
		console.error("ERROR - OpcdaController.switchopcDa() - Unable to update the device routemode remote server status: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.OpcdaController", OpcdaController);