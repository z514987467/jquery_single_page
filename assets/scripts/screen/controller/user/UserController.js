function UserController(viewHandle, elementId) {
    this.pViewHandle = viewHandle;
    this.elementId = elementId;

    this.pUserName = "#" + this.elementId + "_userName";
    this.pUserForm = "#" + this.elementId + "_userForm";
    this.pNewUserForm = "#" + this.elementId + "_newUserForm";
    this.pNewPassword = "#" + this.elementId + "_newPassword";
    this.pNewPasswordInfo = "#" + this.elementId + "_newPasswordInfo";
    this.pNewPassword1 = "#" + this.elementId + "_newPassword1";
    this.pNewUserName = "#" + this.elementId + "_newUserName";
    this.pNewUserPassword = "#" + this.elementId + "_newUserPassword";
    this.pOldUserPassword = "#" + this.elementId + "_oldPassword";
    this.pNewUserPasswordInfo = "#" + this.elementId + "_newUserPasswordInfo";
    this.pNewUserPassword1 = "#" + this.elementId + "_newUserPassword1";
    this.pChangePassword = "#" + this.elementId + "_changePassword";
    this.pAddUser = "#" + this.elementId + "_addUser";
    this.pUserList = "#" + this.elementId + "_userList";
}

UserController.prototype.init = function () {
    try {
        var parent = this;

        var tabTemplate = TemplateManager.getInstance().updateTemplate(TemplateManager.getInstance().getTemplate(Constants.TEMPLATES.USER_EDIT), {
            elementId: parent.elementId
        });
        this.pViewHandle.html(tabTemplate);

        //init all controls and load data
        this.initControls();
        this.load();
    }
    catch (err) {
        console.error("ERROR - UserController.init() - Unable to initialize: " + err.message);
    }
}

UserController.prototype.initControls = function () {
    try {
        var parent = this;
        //bind validate form
        $(this.pUserForm).Validform({
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.parent().find("input").attr("errormsg"));
                }
            },
        });
        $(this.pNewUserForm).Validform({
            tiptype: function (msg, o, cssctl) {
                if (!o.obj.is("form")) {
                    //页面上不存在提示信息的标签时，自动创建;
                    if (o.obj.parent().find(".Validform_checktip").length == 0) {
                        o.obj.parent().append("<span class='Validform_checktip' />");
                        o.obj.parent().next().find(".Validform_checktip").remove();
                    }
                    var objtip = o.obj.parent().find(".Validform_checktip");
                    cssctl(objtip, o.type);
                    objtip.text(o.obj.parent().find("input").attr("errormsg"));
                }
            }
        });

        //bind event
        $(this.pNewPassword1).on("change", function () {
            var newPassword = $(parent.pNewPassword).val();
            var newPassword1 = $(parent.pNewPassword1).val();
            if (newPassword != newPassword1) {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").css("color", "#ff0000").addClass("Validform_wrong").text("两次输入的密码不一致");
            }
            else {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pChangePassword).on("click", function () {
            var newPassword = $(parent.pNewPassword).val();
            var newPassword1 = $(parent.pNewPassword1).val();
            var oldPassword = $(parent.pOldUserPassword).val();
            if (newPassword != newPassword1) {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
                return false;
            }
            else {
                $(parent.pNewPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
                if (!Validation.validatePassword(newPassword)) {
                    layer.alert("密码必须由字母、数字、特殊字符(@,!,#)组成，长度6到16位", {icon: 5});
                    return false;
                }
                parent.changePassword(newPassword, oldPassword);
                return false;
            }
        });

        //add user
        $(this.pNewUserPassword1).on("change", function () {
            var newUserPassword = $(parent.pNewUserPassword).val();
            var newUserPassword1 = $(parent.pNewUserPassword1).val();
            if (newUserPassword != newUserPassword1) {
                $(parent.pNewUserPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
            }
            else {
                $(parent.pNewUserPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
            }
        });
        $(this.pAddUser).on("click", function () {
            var newUserName = $(parent.pNewUserName).val();
            var newUserPassword = $(parent.pNewUserPassword).val();
            var newUserPassword1 = $(parent.pNewUserPassword1).val();
            if (newUserPassword != newUserPassword1) {
                $(parent.newUserPassword1).parent().find(".Validform_checktip").addClass("Validform_wrong").css("color", "#ff0000").text("两次输入的密码不一致");
                return false;
            }
            else {
                $(parent.newUserPassword1).parent().find(".Validform_checktip").removeClass("Validform_wrong").css("color", "").text("");
                if (!Validation.validateUserName(newUserName)) {
                    layer.alert("用户名必须以字母开头，4-25个字符组成", {icon: 5});
                    return false;
                }
                if (!Validation.validatePassword(newUserPassword)) {
                    layer.alert("密码必须由字母、数字、特殊字符(@,!,#)组成，长度6到16位", {icon: 5});
                    return false;
                }
                parent.addUser(newUserName, newUserPassword);
                return false;

            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.initControls() - Unable to initialize control: " + err.message);
    }
}

UserController.prototype.load = function () {
    try {
        this.getUser();
        this.selectUsers();
    }
    catch (err) {
        console.error("ERROR - UserController.load() - Unable to load: " + err.message);
    }
}

UserController.prototype.getUser = function () {
    try {
        var userName = AuthManager.getInstance().getUserName();
        $(this.pUserName).text(userName);
        if (userName == "admin") {
            $(this.pNewUserForm).css({"visibility": "visible", "display": ""})
        }
    }
    catch (err) {
        console.error("ERROR - UserController.getUser() - Unable to get current user information: " + err.message);
    }
}

UserController.prototype.changePassword = function (pwd, oldPwd) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].CHANGE_USER_PWD;
        var data = {newpwd: pwd, oldpwd: oldPwd, username: AuthManager.getInstance().getUserName()};
        var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            return false;
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0:
                        layer.alert("原始密码错误，修改密码失败", {icon: 5});
                        return false;
                    case 1:
                        layer.alert("修改密码成功", {icon: 6});
                        return false;
                    default:
                        layer.alert("修改密码失败", {icon: 5});
                        return false;
                }
            }
            else {
                layer.alert("修改密码失败", {icon: 5});
                return false;
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.changePassword() - Unable to change password for user: " + err.message);
        return false;
    }
}

UserController.prototype.addUser = function (uname, pwd) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].ADD_USER;
        var data = {user: uname, password: pwd};
        var promise = URLManager.getInstance().ajaxCallByURL(link, "POST", data, true);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
            return false;
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 0:
                        layer.alert("用户人数上限", {icon: 1});
                        return false;
                    case 1:
                        layer.alert("用户已经存在", {icon: 2});
                        return false;
                    case 2:
                        layer.alert("添加用户成功", {icon: 6});
                        setTimeout(function () {
                            parent.selectUsers();
                        }, 3000);
                        return false;
                    default:
                        layer.alert("添加用户失败", {icon: 5});
                        return false;
                }
            }
            else {
                layer.alert("添加用户失败", {icon: 5});
                return false;
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.addUser() - Unable to add new user: " + err.message);
        return false;
    }
}

UserController.prototype.removeUser = function (id, $tr) {
    try {
        var parent = this;
        var link = APPCONFIG["default"].DELETE_USER + "?id=" + id;
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            layer.alert("系统服务忙，请稍后重试！", {icon: 2});
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.status) != "undefined") {
                switch (result.status) {
                    case 1:
                        layer.alert("删除用户成功", {icon: 6});
                        var userId = AuthManager.getInstance().getUserId();
                        if (typeof(userId) != "undefined" && userId != null && userId != 0 && userId == id) {
                            LocalStorageManager.getInstance().deleteProperty(APPCONFIG.LOGIN_RESPONSE);
                            AuthManager.timedOut = true;
                            AuthManager.getInstance().logOut();
                        }
                        $tr.remove();
                        break;
                    default:
                        layer.alert("删除用户失败", {icon: 5});
                        break;
                }
            }
            else {
                layer.alert("删除用户失败", {icon: 5});
            }
        });
    }
    catch (err) {
        console.error("ERROR - UserController.removeUser() - Unable to remove user: " + err.message);
    }
}

UserController.prototype.selectUsers = function () {
    var colspanRow = "<tr><td colspan='2'>暂无数据</td></tr>";
    var html = "";
    html += '<tr class="title">';
    html += '<td class="username">用户名</td>';
    html += '<td class="usertime">上次登录时间</td>';
    var userName = AuthManager.getInstance().getUserName().toLowerCase();
    if (userName == "admin") {
        html += '<td>操作</td>';
        colspanRow = "<tr><td colspan='3'>暂无数据</td></tr>";
    }
    html += '</tr>';
    try {
        var parent = this;
        var link = APPCONFIG["default"].GET_USER_LIST + "?page=1";
        var promise = URLManager.getInstance().ajaxCall(link);
        promise.fail(function (jqXHR, textStatus, err) {
            console.log(textStatus + " - " + err.message);
            html += colspanRow;
            $(parent.pUserList).html(html);
        });
        promise.done(function (result) {
            if (typeof (result) != "undefined" && typeof (result.rows) != "undefined") {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        html += "<tr>";
                        html += "<td>" + result.rows[i][1] + "</td>";
                        html += "<td>" + result.rows[i][2] + "</td>";
                        if (AuthManager.getInstance().getUserName().toLowerCase() == "admin") {
                            if (result.rows[i][1] != "admin") {
                                html += "<td><button class='button_delete button' id='" + result.rows[i][0] + "'>删除</button></td>";
                            }
                            else {
                                html += "<td></td>";
                            }
                        }
                        html += "</tr>";
                    }
                }
                else {
                    html += colspanRow;
                }
            }
            else {
                html += colspanRow;
            }
            $(parent.pUserList).html(html);
            $(parent.pUserList).find("button").on("click", function (event) {
                parent.removeUser($(this).attr("id"), $(this).parents("tr"));
                return false;
            });
        });
    }
    catch (err) {
        html += colspanRow;
        $(this.pUserList).html(html);
        console.error("ERROR - UserController.selectUsers() - Unable to load all users: " + err.message);
    }
}

UserController.prototype.checkPasswordPriority = function (password) {
    try {
        var parent = this;
        var reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#]).{6,16}$/;
        if (reg.test(password)) {
            if (password.length >= 6 && password.length < 8) {
                return "low";
            }
            else if (password.length >= 8 && password.length < 12) {
                return "middle";
            }
            else if (password.length >= 12 && password.length <= 16) {
                return "high";
            }
            else {
                return "";
            }
        }
        return "";
    }
    catch (err) {
        console.error("ERROR - UserController.selectUsers() - Unable to load all users: " + err.message);
    }
}

ContentFactory.assignToPackage("kea.base.UserController", UserController);

