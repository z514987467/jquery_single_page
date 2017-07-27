function EventController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pTodayEvent = "#" + this.elementId + "_todayEvent";
    this.pNoReadEvent = "#" + this.elementId + "_noReadyEvent";
    this.pHighPeriod = "#" + this.elementId + "_highPeriod";
    this.pLblEventTitle = "#" + this.elementId + "_lblEventTitle";
    this.pLblEventCount = "#" + this.elementId + "_lblEventCount";
    this.pTotalSafeEvent = "#" + this.elementId + "_totalSafeEvent";
    this.pTotalSystemEvent = "#" + this.elementId + "_totalSystemEvent";
    this.pSafeEventHolder = "#" + this.elementId + "_safeEventHolder";
    this.pSystemEventHolder = "#" + this.elementId + "_systemEventHolder";

    this.pSafeEventController = null;
    this.pSystemEventController = null;
    this.pEventInfo = null;
    this.pFilters = "";
    this.currentTabId="";
    this.currentTabHolder = null;
}

EventController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.EVENT_SAFE,
                Constants.TEMPLATES.EVENT_SYSTEM,
                Constants.TEMPLATES.EVENT_SAFE_DIALOG],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - EventController.init() - Unable to initialize all templates: " + err.message);
    }
}

EventController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.EVENT_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        //this.load();
        this.initControls();
    }
    catch (err) {
        console.error("ERROR - EventController.initShell() - Unable to initialize: " + err.message);
    }
}

EventController.prototype.initControls = function () {
    try {
        var parent = this;
        //bind event for search event via filter
        $("p.evnumber.evnumber_refresh").on("click", function () {
            var data_id = "#"+$(this).attr("data-id");
            if (parent.currentTabId == parent.pTotalSafeEvent && parent.pSafeEventController != null) {
                switch (data_id) {
                    case parent.pTodayEvent:
                        parent.formatSafeFilter("datetime");
                        break;
                    case parent.pNoReadEvent:
                        parent.formatSafeFilter("isready");
                        break;
                }
                parent.pSafeEventController.pEventPager = null;
                parent.pSafeEventController.pFilters = parent.pFilters;
                parent.pSafeEventController.searchEvents(1, parent.pFilters);
            }
            else if (parent.currentTabId == parent.pTotalSystemEvent && parent.pSystemEventController != null) {
                switch (data_id) {
                    case parent.pTodayEvent:
                        parent.formatSystemFilter("datetime");
                        break;
                    case parent.pNoReadEvent:
                        parent.formatSystemFilter("isready");
                        break;
                }
                parent.pSystemEventController.pEventPager = null;
                parent.pSystemEventController.pFilters = parent.pFilters;
                parent.pSystemEventController.searchEvents(1, parent.pFilters);
            }
        });
        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalSafeEvent:
                    parent.currentTabHolder = $(parent.pSafeEventHolder);
                    parent.setSafeEventNum();
                    if (parent.pSafeEventController == null) {
                        parent.pSafeEventController = new kea.base.SafeEventController(parent, parent.currentTabHolder, parent.elementId + "_safe");
                        parent.pSafeEventController.init();
                    }
                    break;
                case parent.pTotalSystemEvent:
                    parent.currentTabHolder = $(parent.pSystemEventHolder);
                    parent.setSysEventNum();
                    if (parent.pSystemEventController == null) {
                        parent.pSystemEventController = new kea.base.SystemEventController(parent, parent.currentTabHolder, parent.elementId + "_sys");
                        parent.pSystemEventController.init();
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
        console.error("ERROR - EventController.initControls() - Unable to initialize control: " + err.message);
    }
}

EventController.prototype.setSafeEventNum = function () {
    try {
        this.getEventInfo();
        if (this.pEventInfo != null) {
            $(this.pTotalSafeEvent).html(this.pEventInfo.safeeventinfo.allSafeEvent);
            $(this.pTotalSystemEvent).html(this.pEventInfo.syseventinfo.allSafeEvent);
            $(this.pTodayEvent).prev().html("今日安全事件");
            $(this.pTodayEvent).html(this.pEventInfo.safeeventinfo.todaySafeEvent);
            $(this.pNoReadEvent).prev().html("未读安全事件");
            $(this.pNoReadEvent).html(this.pEventInfo.safeeventinfo.noReadSafeEvent);
            $(this.pHighPeriod).prev().html("安全事件高峰时段");
            $(this.pHighPeriod).html(this.pEventInfo.safeeventinfo.highestPeriod);
            var historyEvent = this.pEventInfo.safeeventinfo.allSafeEvent - this.pEventInfo.safeeventinfo.todaySafeEvent;
            if (historyEvent < 0)
            {
                historyEvent = 0;
            }
            $(this.pLblEventCount).html(historyEvent);
            $(this.pLblEventTitle).html("历史安全事件");
        }
    }
    catch (err) {
        console.error("ERROR - EventController.setSafeEventNum() - Unable to set safe event num: " + err.message);
    }
}

EventController.prototype.setSysEventNum = function () {
    try {
        this.getEventInfo();
        if (this.pEventInfo != null) {
            $(this.pTotalSafeEvent).html(this.pEventInfo.safeeventinfo.allSafeEvent);
            $(this.pTotalSystemEvent).html(this.pEventInfo.syseventinfo.allSafeEvent);
            $(this.pTodayEvent).prev().html("今日系统事件");
            $(this.pTodayEvent).html(this.pEventInfo.syseventinfo.todaySafeEvent);
            $(this.pNoReadEvent).prev().html("未读系统事件");
            $(this.pNoReadEvent).html(this.pEventInfo.syseventinfo.noReadSafeEvent);
            $(this.pHighPeriod).prev().html("系统事件高峰时段");
            $(this.pHighPeriod).html(this.pEventInfo.syseventinfo.highestPeriod);
            var historyEvent = this.pEventInfo.syseventinfo.allSafeEvent - this.pEventInfo.syseventinfo.todaySafeEvent;
            if (historyEvent < 0) {
                historyEvent = 0;
            }
            $(this.pLblEventCount).html(historyEvent);
            $(this.pLblEventTitle).html("历史系统事件");
        }
    }
    catch (err) {
        console.error("ERROR - EventController.setSysEventNum() - Unable to set system event num: " + err.message);
    }
}

EventController.prototype.load = function () {
    try {
        this.getEventInfo();
    }
    catch (err) {
        console.error("ERROR - EventController.load() - Unable to load: " + err.message);
    }
}

EventController.prototype.getEventInfo = function () {
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_EVENT_INFO;
        var promise = URLManager.getInstance().ajaxSyncCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined") {
                parent.pEventInfo = result;
            }
        });
    }
    catch (err) {
        console.error("ERROR - SafeEventController.getEventInfo() - Unable to load: " + err.message);
    }
}

EventController.prototype.formatSafeFilter = function (flag) {
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
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

EventController.prototype.formatSystemFilter = function (flag) {
    try {
        this.pFilters = "?level=&";
        this.pFilters += "status=";
        if (flag == "isready") {
            this.pFilters += "0";
        }
        this.pFilters += "&";
        this.pFilters += "content=&";

        if (flag == "datetime") {
            //不能用本机时间，必须用系统事件
            var sysDateTime = $(".systemtime>p").text();
            var datetime = new Date();
            if (typeof (sysDateTime) != "undefined" && sysDateTime != "")
            {
                datetime = new Date(sysDateTime);
            }
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
        console.error("ERROR - SafeEventController.formatFilter() - Unable to get filter for searching: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.EventController", EventController);

