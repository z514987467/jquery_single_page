function LogController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pTotalLoginLog = "#" + this.elementId + "_totalLoginLog";
    this.pTotalOperationLog = "#" + this.elementId + "_totalOperationLog";
    this.pLoginLogHolder = "#" + this.elementId + "_loginLogHolder";
    this.pOperatioLogHolder = "#" + this.elementId + "_operationLogHolder";
    this.pDownloadHolder = "#" + this.elementId + "_downloadHolder";

    this.PLoginLogController = null;
    this.POperationLogController = null;
    this.pLogInfo = null;
    this.pFilters = "";
    this.currentTabId="";
    this.currentTabHolder = null;
}

LogController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.LOG_LOGIN,
                Constants.TEMPLATES.LOG_OPERATION],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - LogController.init() - Unable to initialize all templates: " + err.message);
    }
}

LogController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.LOG_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - LogController.initShell() - Unable to initialize: " + err.message);
    }
}

LogController.prototype.initControls = function () {
    try {
        var parent = this;

        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalLoginLog:
                    parent.currentTabHolder = $(parent.pLoginLogHolder);
                    if (parent.pLogInfo != null) {
                        $(parent.pTotalLoginLog).html(parent.pLogInfo.loginlog_num);
                    }
                    if (parent.PLoginLogController == null) {
                        parent.PLoginLogController = new kea.base.LoginLogController(parent, parent.currentTabHolder, parent.elementId + "_login");
                        parent.PLoginLogController.init();
                    }
                    break;
                case parent.pTotalOperationLog:
                    parent.currentTabHolder = $(parent.pOperatioLogHolder);
                    if (parent.pLogInfo != null) {
                        $(parent.pTotalOperationLog).html(parent.pLogInfo.operlog_num);
                    }
                    if (parent.POperationLogController == null) {
                        parent.POperationLogController = new kea.base.OperationLogController(parent, parent.currentTabHolder, parent.elementId + "_operation");
                        parent.POperationLogController.init();
                    }
                    break;
            }
            $(".tabtitle>ul>li").removeClass("hit");
            $(this).addClass("hit");
            $(".tabmiantxt").css("display", "none");
            $(parent.currentTabHolder).css("display", "block");
        });
        $(".tabtitle>ul>li").eq(0).click();
    }
    catch (err) {
        console.error("ERROR - LogController.initControls() - Unable to initialize control: " + err.message);
    }
}

LogController.prototype.load = function () {
    try {
        this.getLogInfo();
    }
    catch (err) {
        console.error("ERROR - LogController.load() - Unable to load: " + err.message);
    }
}

LogController.prototype.getLogInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_LOG_INFO;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                parent.pLogInfo = result;
                $(parent.pTotalLoginLog).html(result.loginlog_num);
                $(parent.pTotalOperationLog).html(result.operlog_num);
            }
        });
    }
    catch (err) {
        console.error("ERROR - LoginLogController.getLogInfo() - Unable to load: " + err.message);
    }
}

LogController.prototype.formatSafeFilter = function (flag) {
    try {
        this.pFilters = "?action=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "sourceIp=&";
        this.pFilters += "destinationIp=&";
        this.pFilters += "appLayerProtocol=&";

        if (flag == "datetime") {
            var datetime = new Date();
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10) {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - LoginLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}


LogController.prototype.formatSystemFilter = function (flag) {
    try {
        this.pFilters = "?level=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "content=&";

        if (flag == "datetime") {
            var datetime = new Date();
            var years = datetime.getFullYear();
            var months = datetime.getMonth() + 1;
            var days = datetime.getDate();
            if (months < 10)
            {
                months = "0" + months;
            }
            if (days < 10) {
                days = "0" + days;
            }
            var startToday = years + "-" + months + "-" + days + " 00:00:00";
            var endToday = years + "-" + months + "-" + days + " 23:59:59";
            this.pFilters += "starttime=" + startToday + "&";
            this.pFilters += "endtime=" + endToday + "&";
        }
        else {
            this.pFilters += "starttime=&";
            this.pFilters += "endtime=&";
        }
    }
    catch (err) {
        console.error("ERROR - LoginLogController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.LogController", LogController);

