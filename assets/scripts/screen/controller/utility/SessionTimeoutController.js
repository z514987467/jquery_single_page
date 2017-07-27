function SessionTimeoutController() {
    try {
        this.idleTime = 0;
        this.isTriggered = false;
    }
    catch (err) {
        console.error("ERROR - SessionTimeoutController() - Unable to instantiate class: " + err.message);
    }
}

SessionTimeoutController.prototype.init = function () {
    try {
        var parent = this;
        //Increment the idle time counter every minute.
        var timerIncrement = function () {
            parent.idleTime = parent.idleTime + 1;
            console.log("check idle time:" + parent.idleTime);
            if (parent.idleTime >= AuthManager.getInstance().getSessionTimeMin()) {
                AuthManager.timedOut = true;
                AuthManager.getInstance().logOut();
            }

        };
        var idleInterval = setInterval(timerIncrement, APPCONFIG.TOKEN_CHECK_INTERVAL); // 1 minute
        //Zero the idle timer on mouse movement.
        $(document).keypress(function (e) {
            parent.updateUserToken();
        });
        $(document).click(function (e) {
            parent.updateUserToken();
        });
    }
    catch (err) {
        console.error("ERROR - SessionTimeoutController.init() - Unable to initialize: " + err.message);
    }
};

SessionTimeoutController.prototype.setLastOperationTime = function () {
    var self = this;
    self.idleTime = 0;
    var cache = LocalStorageManager.getInstance();
    var loginInfo = LocalStorageManager.deserialize(cache.getProperty(APPCONFIG.LOGIN_RESPONSE));
    loginInfo.lastOperation = FormatterManager.formatDateTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
    cache.setProperty(APPCONFIG.LOGIN_RESPONSE, LocalStorageManager.serialize(loginInfo));
}

SessionTimeoutController.prototype.updateUserToken = function () {
    var _self = this;
    if (!_self.isTriggered) {
        try {
            var link = APPCONFIG["default1"].USER_TOKEN;
            var promise = URLManager.getInstance().ajaxCallByURL(link, 'PUT', {}, true);
            promise.fail(function (jqXHR, textStatus, err) {
                console.error("ERROR - SessionTimeoutController.updateUserToken() - Message: " + err);
            });
            promise.done(function (result) {
                if (!result) {
                    console.error("FAILE - SessionTimeoutController.updateUserToken()");
                }
            });
            this.isTriggered = true;
            setTimeout(function () {
                _self.isTriggered = false;
            }, 5000);
        }
        catch (err) {
            console.error("ERROR - SessionTimeoutController.updateUserToken() - Message: " + err.message);
        }
    }
}

/*
 * check token every 2 min
 */
SessionTimeoutController.prototype.startTokenValidatorRunner = function () {
    setInterval(SessionTimeoutController.tokenValidator, APPCONFIG.TOKEN_CHECK_INTERVAL);
    console.log("startTokenValidatorRunner");
};

SessionTimeoutController.tokenValidator = function () {
    console.log("tokenValidator called");
    var callback = function () {
        new kea.utility.SessionTimeoutModel().init();
    };
    AuthManager.getInstance().isSessionExpired(callback);
};
ContentFactory.assignToPackage("kea.base.utility.SessionTimeoutController", SessionTimeoutController);