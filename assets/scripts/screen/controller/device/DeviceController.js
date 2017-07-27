function DeviceController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pBasicDeviceHolder = "#" + this.elementId + "_basicDeviceHolder";
    this.pAdvanceDeviceHolder = "#" + this.elementId + "_advanceDeviceHolder";
    this.pTotalBasicDevice = "#" + this.elementId + "_totalBasicDevice";
    this.pTotalAdvanceDevice = "#" + this.elementId + "_totalAdvanceDevice";

    this.pBasicDeviceController = null;
    this.pAdvanceDeviceController = null;
    this.currentTabId = "";
    this.currentTabHolder = null;
}

DeviceController.prototype.init = function () {
    try {
        var parent = this;
        TemplateManager.getInstance().requestTemplates([
                Constants.TEMPLATES.DEVICE_BASIC,
                Constants.TEMPLATES.DEVICE_ADVANCE],
            function (templateResults) {
                parent.initShell();
            }
        );
    }
    catch (err) {
        console.error("ERROR - DeviceController.init() - Unable to initialize all templates: " + err.message);
    }
}

DeviceController.prototype.initShell = function () {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.DEVICE_LIST), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - DeviceController.initShell() - Unable to initialize: " + err.message);
    }
}

DeviceController.prototype.initControls = function () {
    try {
        var parent = this;

        //tab click event
        $(".tabtitle>ul>li").on("click", function () {
            parent.currentTabId = "#" + $(this).attr("data-id");
            switch (parent.currentTabId) {
                case parent.pTotalBasicDevice:
                    parent.currentTabHolder = $(parent.pBasicDeviceHolder);
                    if (parent.pBasicDeviceController == null) {
                        parent.pBasicDeviceController = new kea.base.BasicDeviceController(parent, parent.currentTabHolder, parent.elementId + "_basic");
                        parent.pBasicDeviceController.init();
                    }
                    break;
                case parent.pTotalAdvanceDevice:
                    parent.currentTabHolder = $(parent.pAdvanceDeviceHolder);
                    if (parent.pAdvanceDeviceController == null) {
                        parent.pAdvanceDeviceController = new kea.base.AdvanceDeviceController(parent, parent.currentTabHolder, parent.elementId + "_advance");
                        parent.pAdvanceDeviceController.init();
                    }
                    parent.pAdvanceDeviceController.init();
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
        console.error("ERROR - DeviceController.initControls() - Unable to initialize control: " + err.message);
    }
}

DeviceController.prototype.load = function () {
    try {
        //this.getLogInfo();
    }
    catch (err) {
        console.error("ERROR - DeviceController.load() - Unable to load: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.DeviceController", DeviceController);

