function getImage() {
    try {
        $.ajax({
            type: 'GET',
            url: APPCONFIG["default1"].GET_IMAGE,
            async: true,
            cache: false,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.error("ERROR - getImage() - Message: " + errorThrown);
            }
        });
    } catch (err) {
        console.error("ERROR - getImage() - Message: " + err.message);
    }
}

function initializeLoginScreen() {
    var promise = getSecretKey();
    promise.fail(function (jqXHR, textStatus, err) {
        console.log(textStatus + " - " + err.message);
        layer.alert("系统服务忙，请稍后重试！", {icon: 2});
    });
    promise.done(function (result) {
        if (typeof (result) != "undefined") {
            login(result);
        }
        else {
            layer.alert("登录失败", {icon: 5});
        }
    });
}

function login(key) {
    try {
        //validate user
        jQuery.support.cors = true;
        key = CryptoJS.enc.Base64.parse(key)
        var username = CryptoJS.AES.encrypt($.trim($("#login_txtUserName").val()), key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        var password = CryptoJS.AES.encrypt($.trim($("#login_txtUserPassword").val()), key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        var verifycode = $.trim('2464');
        var link = APPCONFIG["default1"].CHECK_USER;
        var loadIndex = layer.load(2, {shade: [0.3, '#fff']});
        $.ajax({
            type: 'POST',
            url: link,
            contentType: 'application/x-www-form-urlencoded',
            data: 'username=' + btoa(username) + '&password=' + btoa(password) + '&verifycode=' + btoa(verifycode),
            success: function (result) {
                layer.close(loadIndex);
                if (typeof (result) != "undefined") {
                    if (result.success) {
                        // result.user.lastOperation = FormatterManager.formatDateTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        // LocalStorageManager.getInstance().init();
                        // LocalStorageManager.getInstance().setProperty(APPCONFIG.LOGIN_RESPONSE, LocalStorageManager.serialize(result.user));
                        window.location.replace(APPCONFIG["default"].HOMEPAGE_URL);
                    } else {
                        $(".log_text").text(result.message);
                    }
                }
                else {
                    $(".log_text").text("系统服务忙，请稍后重试！");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                layer.close(loadIndex);
                $(".log_text").text("系统服务忙，请稍后重试！");
                console.error("ERROR - initializeLoginScreen() - Unable to retrieve URL: " + link + ". " + errorThrown);
                return false;
            }
        });
        return;
    }
    catch (err) {
        console.error("ERROR - initializeLoginScreen() - Can not initialize: " + err.message);
    }
}

function getSecretKey() {
    try {
        var promise = $.ajax({
            type: 'GET',
            url: APPCONFIG["default1"].GET_SECRET_KEY,
            async: true,
            cache: false,
            processData: false,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.error("ERROR - getSecretKey() - Message: " + errorThrown);
            }
        });
        return promise;
    } catch (err) {
        console.error("ERROR - getSecretKey() - Message: " + err.message);
    }
}