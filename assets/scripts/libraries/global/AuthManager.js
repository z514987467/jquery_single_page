// AuthManager.js
function AuthManager() {
    this.pInstance = null;
    this.pUsername = "";
    this.pUserId = 0;
    this.pSessionTimeoutMin = 30;
    this.mode = 1;//1�Թ���0���й���
}

AuthManager.forcedLogOut = false;
AuthManager.timedOut = false;

AuthManager.getInstance = function () {
    if (!this.pInstance) {
        this.pInstance = new AuthManager();
    }
    return this.pInstance;
};

AuthManager.prototype.init = function () {
    var _self = this;
    try {
        var link = APPCONFIG["default1"].WHOAMI;
        var promise = URLManager.getInstance().ajaxCallByURL(link, "GET", {}, false);
        promise.fail(function (jqXHR, textStatus, err) {
            console.error("ERROR - SessionTimeoutController.updateUserToken() - Message: " + err);
            if (jqXHR.status === 401) {
                LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, '');
                window.location.replace(APPCONFIG["default"].LOGIN_URL);
            }
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && result.user) {
                LocalStorageManager.getInstance().init();
                LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, LocalStorageManager.serialize(result.user));
                _self.pUsername = result.user.stuffName;
                _self.pUserId = result.user.userId;
            } else {
                _self.logOut();
            }

        });
    }
    catch (err) {
        console.error("ERROR - AuthManager.init() - Critical error, can not initialize COMPASS authorizations: " + err.message);
    }
};

AuthManager.prototype.isLoggedIn = function (loggedInCallBack, loggedOutCallBack) {
    try {
        var cache = LocalStorageManager.getInstance();
        var loginInfo = cache.getProperty(APPCONFIG.LOGIN_RESPONSE);
        if (loginInfo) {
            console.log("isLoggedIn");
            if (typeof (loggedInCallBack) == "function") {
                console.log("loggedInCallBack called");
                loggedInCallBack();
            } else {
                console.log("isLoggedOut");
                if (typeof (loggedOutCallBack) == "function")
                    loggedOutCallBack();
                return false;
            }
        }
        else {
            console.log("isLoggedOut");
            if (typeof (loggedOutCallBack) == "function")
                loggedOutCallBack();
            return false;
        }
    }
    catch (err) {
        console.error("ERROR - AuthManager.isLoggedIn() - Can not check login status: " + err.message);
    }
};

AuthManager.prototype.logOut = function () {
    try {
        console.log("log out user");
        var link = APPCONFIG["default1"].LOGOUT;
        var promise = URLManager.getInstance().ajaxCallByURL(link, 'POST', {}, true);
        promise.fail(function (jqXHR, textStatus, err) {
            LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, '');
            window.location.replace(APPCONFIG["default1"].LOGIN_URL);
        });
        promise.done(function (result) {
            if (result) {
                LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, '');
                window.location.replace(APPCONFIG["default"].LOGIN_URL);
            }
            else {
                layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            }
        });
    }
    catch (err) {
        console.error("ERROR - AuthManager.logOutImmediately() - Can not logout: " + err.message);
    }
};

AuthManager.prototype.checkUser = function () {
    try {
        var parent = this;

        var link = APPCONFIG["default"].GET_USER + "?username=" + this.pUsername;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            parent.logOut();
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        break;
                    default:
                        // parent.logOut();
                        break;
                }
            }
            else {
                parent.logOut();
            }
        });
    }
    catch (err) {
        console.error("ERROR - AuthManager.checkUser() - The user is not existed, pls make sure " + err.message);
        // parent.logOut();
    }
};

AuthManager.prototype.checkMode = function (renderModeUI) {
    try {
        var parent = this;

        var link = APPCONFIG["default"].GET_DEVICE_MODE;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" || typeof (result.curMode) != "undefined") {
                parent.mode = result.curMode;
            }
            renderModeUI();
        });
    }
    catch (err) {
        console.error("ERROR - AuthManager.getMode() - Get the current mode " + err.message);
    }
};

AuthManager.prototype.cacheGet = function (id) {
    var cache = LocalStorageManager.getInstance().getProperty(id);
    if (cache) {
        console.log("hit cache for " + id);
        var deferred = $.Deferred();
        deferred.resolve(LocalStorageManager.deserialize(cache));
        return deferred;
    } else
        return null;
}

AuthManager.prototype.cacheSet = function (id, data) {
    LocalStorageManager.getInstance().setProperty(id, LocalStorageManager.serialize(data));
}

AuthManager.prototype.getSessionTimeMin = function () {
    return this.pSessionTimeoutMin;
}

AuthManager.prototype.setSessionTimeMin = function (timeoutMin) {
    if (typeof (timeoutMin) != "undefined") {
        this.pSessionTimeoutMin = timeoutMin;
    }
}

AuthManager.prototype.getUserName = function () {
    return this.pUsername;
}

AuthManager.prototype.getUserId = function () {
    return this.pUserId;
}

AuthManager.prototype.getMode = function () {
    return this.mode;
}

AuthManager.prototype.setMode = function (v) {
    var cache = LocalStorageManager.getInstance();
    var loginInfo = cache.getProperty(APPCONFIG.LOGIN_RESPONSE);
    if (loginInfo) {
        loginInfo = LocalStorageManager.deserialize(loginInfo);
        loginInfo.mode = v;
        LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, LocalStorageManager.serialize(loginInfo));
    }
    this.mode = v;
}


