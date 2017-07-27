function View() {
    this.pInstance = null;
    this.type = null;
    this.pageName = null;
    this.content = "";
    this.controller = null;
    this.viewHandle = $("#viewContainer");
}

View.getInstance = function () {
    if (!this.pInstance) {
        this.pInstance = new View();
    }
    return this.pInstance;
};

View.prototype.init = function (type, pageName) {
    var parent = this;
    this.type = type;
    this.pageName = pageName;
    if (this.controller != null && typeof (this.controller.disposeTipBox) == "function" && typeof (this.controller.disposeTipBox) == "function") {
        this.controller.disposeTipBox();
        this.controller.clearTimer();
    }
    if (this.controller != null && typeof (this.controller.totalFlowTimer) != "undefined" && typeof (this.controller.totalFlowTimer) != null) {
        clearInterval(this.controller.totalFlowTimer);
    }
    if (this.controller != null && typeof (this.controller.studyTimer) != "undefined" && typeof (this.controller.studyTimer) != null) {
        clearInterval(this.controller.studyTimer);
    }
    //����û�
    // AuthManager.getInstance().isLoggedIn(function () {
    //     AuthManager.getInstance().checkUser();
    // }, function () {
    //     AuthManager.getInstance().logOut();
    // });
    switch (type) {
        case Constants.PageType.HOME:
            ScriptLoader.getInstance().includeModule("home", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.HOME_DASHBOARD
                ], function () {
                    parent.controller = new kea.base.HomeController(parent.viewHandle, "home");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.USER:
            ScriptLoader.getInstance().includeModule("user", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.USER_EDIT
                ], function () {
                    parent.controller = new kea.base.UserController(parent.viewHandle, "user");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.EVENT:
            ScriptLoader.getInstance().includeModule("event", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.EVENT_LIST
                ], function () {
                    parent.controller = new kea.base.EventController(parent.viewHandle, "event");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.LOG:
            ScriptLoader.getInstance().includeModule("log", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.LOG_LIST
                ], function () {
                    parent.controller = new kea.base.LogController(parent.viewHandle, "log");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.DEVICE:
            ScriptLoader.getInstance().includeModule("device", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.DEVICE_LIST,
                    Constants.TEMPLATES.DEVICE_MODE
                ], function () {
                    if (AuthManager.getInstance().getMode() == 1) {
                        parent.controller = new kea.base.DeviceController(parent.viewHandle, "device");
                        parent.controller.init();
                    }
                    else {
                        parent.controller = new kea.base.ModeDeviceController(parent.viewHandle, "device_mode");
                        parent.controller.init();
                    }
                });
            });
            break;
        case Constants.PageType.MAC:
            ScriptLoader.getInstance().includeModule("mac", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.RULE_MAC
                ], function () {
                    parent.controller = new kea.base.MacRuleController(parent.viewHandle, "rule");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.CUSTOM:
            ScriptLoader.getInstance().includeModule("custom", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.RULE_CUSTOM
                ], function () {
                    parent.controller = new kea.base.CustomRuleController(parent.viewHandle, "adl");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.WHITELIST:
            ScriptLoader.getInstance().includeModule("whitelist", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.RULE_WHITELIST
                ], function () {
                    parent.controller = new kea.base.WhitelistController(parent.viewHandle, "whitelist");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.BLACKLIST:
            ScriptLoader.getInstance().includeModule("blacklist", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.RULE_BLACKLIST
                ], function () {
                    parent.controller = new kea.base.BlacklistController(parent.viewHandle, "blacklist");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.NETTOPO:
            ScriptLoader.getInstance().includeModule("nettopo", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.NETTOPO_LIST
                ], function () {
                    parent.controller = new kea.base.NettopoController(parent.viewHandle, "nettopo");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.PROTOCOL:
            ScriptLoader.getInstance().includeModule("protocol", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.AUDIT_PROTOCOL
                ], function () {
                    parent.controller = new kea.base.ProtocolAuditController(parent.viewHandle, "protocol");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.FLOW:
            ScriptLoader.getInstance().includeModule("flow", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.AUDIT_FLOW
                ], function () {
                    parent.controller = new kea.base.FlowAuditController(parent.viewHandle, "flow");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.INTERFACE:
            ScriptLoader.getInstance().includeModule("interface", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.INTERFACE_EDIT
                ], function () {
                    parent.controller = new kea.base.InterfaceController(parent.viewHandle, "interface");
                    parent.controller.init();
                });
            });
            break;
        case Constants.PageType.OPCDA:
            ScriptLoader.getInstance().includeModule("opcda", function (done) {
                TemplateManager.getInstance().requestTemplates([
                    Constants.TEMPLATES.RULE_OPCDA
                ], function () {
                    parent.controller = new kea.base.OpcdaController(parent.viewHandle, "opcda");
                    parent.controller.init();
                });
            });
            break;
        default:
            //handle error page
            this.viewHandle.html(ContentFactory.renderPageShell());
            break;
    }
}