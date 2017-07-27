function PagerController(viewHandle, elementId, pageSize, total, changePageClickEvent) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.total = total;
    this.pageCount = 1;
    this.changePageClickEvent = changePageClickEvent;

    this.pBtnFirstPage = "#" + this.elementId + "_btnFirstPage";
    this.pBtnNextPage = "#" + this.elementId + "_btnNextPage";
    this.pBtnPrevPage = "#" + this.elementId + "_btnPrevPage";
    this.pBtnLastPage = "#" + this.elementId + "_btnLastPage";
    this.pPageContent = "#" + this.elementId + "_pageContent";
    this.pTxtPageNO = "#" + this.elementId + "_txtPageNO";
    this.pBtnGoPage = "#" + this.elementId + "_btnGoPage";
}

PagerController.prototype.init = function (templateId) {
    try {
        var parent = this;
        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(templateId), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //render pager UI
        this.renderUI();
        //init all controls and load data
        this.initControls();
    }
    catch (err) {
        console.error("ERROR - SafeEventController.init() - Unable to initialize: " + err.message);
    }
}

PagerController.prototype.initControls = function () {
    try {
        var parent = this;
        $(this.pBtnFirstPage).on("click", function () {
            $(parent.pTxtPageNO).val("");
            parent.pageIndex = 1;
            $(parent.pPageContent).find("li[data-key='"+parent.pageIndex+"']").click();
        });
        $(this.pBtnLastPage).on("click", function () {
            $(parent.pTxtPageNO).val("");
            parent.pageIndex = parent.pageCount;
            $(parent.pPageContent).find("li[data-key='" + parent.pageIndex + "']").click();
        });
        $(this.pBtnNextPage).on("click", function () {
            $(parent.pTxtPageNO).val("");
            var index=parent.pageIndex + 1;
            if (index <= parent.pageCount) {
                parent.pageIndex = index;
                $(parent.pPageContent).find("li[data-key='" + parent.pageIndex + "']").click();
            }
            else
            {                
                layer.alert("已经是最后一页", { icon: 5 });
            }
        });
        $(this.pBtnPrevPage).on("click", function () {
            $(parent.pTxtPageNO).val("");
            var index=parent.pageIndex - 1;
            if (index >= 1) {
                parent.pageIndex = index;
                $(parent.pPageContent).find("li[data-key='" + parent.pageIndex + "']").click();
            }
            else {
                layer.alert("已经是第一页", { icon: 5 });
            }
        });
        $(this.pBtnGoPage).on("click", function () {
            var index = parseInt($(parent.pTxtPageNO).val());
            var reg = /^[0-9]*[1-9][0-9]*$/;
            if (!reg.test(index) || index <= 0 || index > parent.pageCount) {
                layer.alert("请输入正确的页数", { icon: 5 });
            }
            else {
                parent.pageIndex = index;
                $(parent.pPageContent).find("li[data-key='" + parent.pageIndex + "']").click();
            }
        });

        $(this.pPageContent).find("li").on("click", function () {
            var index = parseInt($.trim($(this).attr("data-key")));
            var yu = parent.pageIndex % 5;
            var lastPageNo = parent.pageIndex - yu;
            if (yu == 0) {
                lastPageNo = lastPageNo - 5;
            }
            $(parent.pPageContent).find("li").css("display", "none");
            for (var i = 1; i < lastPageNo; i++) {
                $(parent.pPageContent).find("li[data-key='" + i + "']").css("display", "none");
            }
            for (var i = lastPageNo + 1; i <= 5 + (lastPageNo) ; i++) {
                $(parent.pPageContent).find("li[data-key='" + i + "']").css("display", "block");
            }
            if (parent.pageIndex > 5) {
                $(parent.pPageContent).find("li[data-key='0']").css("display", "block");
            }
            if (parent.pageCount > 5) {
                $(parent.pPageContent).find("li[data-key='" + parseInt(parent.pageCount + 1) + "']").css("display", "block");
            }
            if (parent.pageIndex > parent.pageCount - (parent.pageCount % 5)) {
                $(parent.pPageContent).find("li[data-key='" + parseInt(parent.pageCount + 1) + "']").css("display", "none");
            }
            if (index > 0 && index < parent.pageCount + 1) {
                parent.pageIndex = index;
                $(parent.pPageContent).find("li>a").removeClass("on");
                $(parent.pPageContent).find("li[data-key='" + index + "']>a").addClass("on");
                parent.changePageClickEvent(index);
            }
        });

        $(this.pTxtPageNO).attr("placeholder", "1/" + this.pageCount);
        $(this.pTxtPageNO).attr("title", "1/" + this.pageCount);
    }
    catch (err) {
        console.error("ERROR - PagerController.initControls() - Unable to initialize control: " + err.message);
    }
}

PagerController.prototype.renderUI = function () {
    try {
        var parent = this;
        if (typeof (this.pageSize) == "undefined" && typeof (this.total) == "undefined") {
            this.pageSize = 10;
            this.total = 0;
        }
        if (this.total == 0)
        {
            this.pViewHandle.html("");
            return;
        }
        if (typeof (this.pageIndex) == "undefined") {
            this.pageIndex = 1;
        }
        if (this.total % this.pageSize == 0) {
            this.pageCount = this.total / this.pageSize;
        }
        else {
            this.pageCount = parseInt(this.total / this.pageSize) + 1;
        }

        var pageContent = "";
        var pageHeader = "<li style='{0}' data-key='{1}'><a href='javascript:void(0);' style='color:#bbb'>...</a></li>";
        pageContent += pageHeader.replace(/\{1\}/, '0').replace(/\{0\}/, "display:none");
        for (var i = 1; i <= this.pageCount; i++) {
            if (i==1)
            {
                pageContent += "<li data-key=" + i + "><a class='on' href='javascript:void(0);'>" + i + "</a></li>";
            }
            else if (i > 1 && i <= 5) {
                pageContent += "<li data-key=" + i + "><a href='javascript:void(0);'>" + i + "</a></li>";
            }
            else {
                pageContent += "<li data-key=" + i + " style='display:none;'><a href='javascript:void(0);'>" + i + "</a></li>";
            }
        }
        if (this.pageCount > 5) {
            pageContent += pageHeader.replace(/\{1\}/, this.pageCount+1).replace(/\{0\}/, "display:block");
        }
        $(this.pPageContent).html(pageContent);
    }
    catch (err) {
        console.error("ERROR - PagerController.renderUI() - Unable to render page control: " + err.message);
    }
}
PagerController.prototype.displayPageNo = function () {
    try {
        var parent = this;
        $(parent.pPageContent).find("li[data-key='"+(this.pageCount+1)+"']").each(function () {
            var isDisplay = $(this).css("display");
            if (isDisplay == "none") {
                $(this).css("display", "block");
            }
            else {
                $(this).css("display", "none");
            }
        });
    }
    catch (err) {
        console.error("ERROR - PagerController.displayPageNo() - Unable to display page NO: " + err.message);
    }
}

PagerController.prototype.displayPageNo1 = function () {
    try {
        var parent = this;
        $(parent.pPageContent).find("li").each(function () {
            var isDisplay = $(this).css("display");
            if (isDisplay == "none") {
                $(this).css("display", "block");
            }
            else {
                $(this).css("display", "none");
            }
        });
    }
    catch (err) {
        console.error("ERROR - PagerController.displayPageNo() - Unable to display page NO: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.utility.PagerController", PagerController);