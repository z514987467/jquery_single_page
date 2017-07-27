// URLManager.js, for post/get/ajax
function URLManager() {
    this.pInstance = null;
    this.id2Url = {};
    this.base = null;
}

URLManager.getInstance = function () {
    if (!this.pInstance) {
        this.pInstance = new URLManager();
    }
    return this.pInstance;
};

URLManager.prototype.init = function (data) {
    if (typeof(data) == "object")
        this.id2Url = data;
    else
        this.id2Url = APPCONFIG["default"].ID2URL;
};

/**
 * id: the DOM element ID
 */
URLManager.prototype.ajaxCallGetById = function (id, data) {
    try {
        if (typeof data != "undefined") {
            return this.ajaxCallById(id, "GET", data);
        }
        else {
            return this.ajaxCallById(id, "GET", "");
        }
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCallGetByID() - Can not make ajax get call: " + err.message);
    }
};

URLManager.prototype.ajaxCallPostById = function (id, data) {
    try {
        if (typeof data != "undefined") {
            return this.ajaxCallById(id, "POST", data);
        }
        else {
            return this.ajaxCallById(id, "POST", "");
        }
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCallPostByID() - Can not make ajax post call: " + err.message);
    }
};

URLManager.prototype.ajaxCallById = function (id, method, data) {
    try {
        if (typeof(this.id2Url[id]) != "undefined") {
            return this.ajaxCallByURL(this.id2Url[id], method, data);
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCallById() - Can not make ajax call: " + err.message);
    }
};

/**
 * this method will create ajax by env using default method and default async mode
 */
URLManager.prototype.ajaxCall = function (link, data, method) {
    try {
        if (!method) {
            method = APPCONFIG["default"].HTTP_METHOD;
        }
        return this.ajaxCallByURL(link, method, data);
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCall() - Can not make ajax post call: " + err.message);
    }
};
/**
 * this method will create ajax by env using default method and default async mode
 */
URLManager.prototype.ajaxSyncCall = function (link, data) {
    try {
        var method = APPCONFIG["default"].HTTP_METHOD;
        return this.ajaxCallByURL(link, method, data, false);
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCall() - Can not make ajax post call: " + err.message);
    }
};
/**
 * @param data: json object or string, allowing json object accommodates backward compatibility, it will be converted to string
 * @param async: sync or async jax call
 * @param method: POST or GET
 * set processData  = false will prevent jquery to send data as query type string
 */
URLManager.prototype.ajaxCallByURL = function (link, method, data, async) {
    jQuery.support.cors = true;
    if (link.indexOf("data") == 0 || link.indexOf("/data") == 0) {
        method = "POST";
    }
    else if (APPCONFIG.ENV != "localhost" && (link.indexOf(".json") > 0 || link.indexOf(".txt") > 0)) {
        method = "GET"; // Override for DEV/Test development, for your local env, we have freedom to do POST
    }

    var way = true;
    if (typeof(async) == "boolean") {
        way = async;
    }

    if (typeof data == "object")
        data = JSON.stringify(data);

    try {
        if (link) {
            var promise = $.ajax({
                url: link,
                dataType: "json",
                data: data,
                type: method,
                async: way,
                cache: false,
                contentType: "application/json; charset=utf-8",
                processData: false,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.error("ERROR - URLManager.ajaxCallByURL() - Unable to retrieve URL: " + link + ". " + errorThrown);
                    if(XMLHttpRequest.status===401){
                        LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, '');
                        window.location.replace(APPCONFIG["default"].LOGIN_URL);
                    }
                }
            });
            return promise;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error("ERROR - URLManager.ajaxCallByURL() - Unable to retrieve URL: " + err.message);
        return "";
    }
};
